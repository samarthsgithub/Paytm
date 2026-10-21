const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { z } = require('zod');
const env = require('../config/env');
const { User, Account } = require('../models');
const { validate } = require('../middleware/validate');
const { asyncHandler, AppError } = require('../utils/errors');
const { toPaise } = require('../utils/money');

const router = express.Router();
const SIGNUP_BONUS_RUPEES = 1000;

const signupBody = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  username: z.string().trim().min(2).max(40),
  password: z.string().min(8, 'must be at least 8 characters').max(72),
});
const signinBody = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

router.post('/signup', validate({ body: signupBody }), asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (await User.exists({ email })) throw new AppError(409, 'An account with this email already exists', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, 10);
  // User and wallet are created together or not at all.
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const [user] = await User.create([{ email, username, passwordHash }], { session });
      await Account.create([{ userId: user._id, balance: toPaise(SIGNUP_BONUS_RUPEES) }], { session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json({ message: 'User created successfully' });
}));

router.post('/signin', validate({ body: signinBody }), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  // Same response for unknown email and wrong password so accounts cannot be enumerated.
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw new AppError(401, 'Invalid email or password', 'BAD_CREDENTIALS');

  const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  res.json({ message: 'Signin successful', token });
}));

module.exports = router;
