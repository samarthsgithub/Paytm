const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');
const { Account, User, Transaction } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler, AppError } = require('../utils/errors');
const { toPaise, toRupees } = require('../utils/money');

const router = express.Router();
router.use(requireAuth);

const MAX_TRANSFER_RUPEES = 100000;

const transferBody = z.object({
  to: z.string().refine(mongoose.isValidObjectId, 'must be a valid user id'),
  // The UI sends the number input's string value, so accept numeric strings too.
  amount: z.coerce
    .number()
    .positive('must be greater than 0')
    .max(MAX_TRANSFER_RUPEES, `cannot exceed ${MAX_TRANSFER_RUPEES}`)
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, 'cannot have more than 2 decimal places'),
  idempotencyKey: z.string().min(8).max(100).optional(),
});


router.get('/balance', asyncHandler(async (req, res) => {
  const account = await Account.findOne({ userId: req.userId });
  if (!account) throw new AppError(404, 'Account not found', 'NOT_FOUND');
  res.json({ balance: toRupees(account.balance) });
}));

router.post('/transfer', validate({ body: transferBody }), asyncHandler(async (req, res) => {
  const { to, idempotencyKey } = req.body;
  const amount = toPaise(req.body.amount);
  if (to === req.userId) throw new AppError(400, 'You cannot send money to yourself', 'SELF_TRANSFER');

  if (idempotencyKey) {
    const prior = await Transaction.findOne({ from: req.userId, idempotencyKey });
    if (prior) return res.status(200).json({ message: 'Transfer already processed', transactionId: prior._id });
  }
  if (!(await User.exists({ _id: to }))) throw new AppError(404, 'Recipient not found', 'RECIPIENT_NOT_FOUND');

  const session = await mongoose.startSession();
  let tx;
  try {
    await session.withTransaction(async () => {
      // Conditional debit: the balance check and the decrement are one atomic operation,
      // so two concurrent transfers can never overdraw the account.
      const debit = await Account.updateOne(
        { userId: req.userId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { session },
      );
      if (debit.modifiedCount !== 1) throw new AppError(400, 'Insufficient balance', 'INSUFFICIENT_FUNDS');
      const credit = await Account.updateOne({ userId: to }, { $inc: { balance: amount } }, { session });
      if (credit.modifiedCount !== 1) throw new AppError(404, 'Recipient account not found', 'RECIPIENT_NOT_FOUND');
      [tx] = await Transaction.create([{ from: req.userId, to, amount, idempotencyKey }], { session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json({ message: 'Transfer successful', transactionId: tx._id });
}));

router.get('/transactions', asyncHandler(async (req, res) => {
  const txs = await Transaction.find({ $or: [{ from: req.userId }, { to: req.userId }] })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('from', 'username')
    .populate('to', 'username')
    .lean();
  const items = txs.map((t) => {
    const sent = t.from._id.toString() === req.userId;
    return {
      _id: t._id,
      direction: sent ? 'sent' : 'received',
      counterparty: (sent ? t.to : t.from)?.username ?? 'Deleted user',
      amount: toRupees(t.amount),
      createdAt: t.createdAt,
    };
  });
  res.json({ transactions: items });
}));

module.exports = router;
