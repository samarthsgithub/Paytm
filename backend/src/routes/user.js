const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { User } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler, AppError } = require('../utils/errors');

const router = express.Router();
router.use(requireAuth);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const updateBody = z
  .object({
    username: z.string().trim().min(2).max(40).optional(),
    password: z.string().min(8).max(72).optional(),
  })
  .strict()
  .refine((b) => b.username || b.password, { message: 'Provide a username or password to update' });

router.get('/me', asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('username email');
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  res.json({ _id: user._id, username: user.username, email: user.email });
}));

router.put('/update', validate({ body: updateBody }), asyncHandler(async (req, res) => {
  const changes = {};
  if (req.body.username) changes.username = req.body.username;
  if (req.body.password) changes.passwordHash = await bcrypt.hash(req.body.password, 10);
  await User.updateOne({ _id: req.userId }, { $set: changes });
  res.json({ message: 'User updated successfully' });
}));

const bulkQuery = z.object({ filter: z.string().trim().max(50).default('') });

router.get('/bulk', validate({ query: bulkQuery }), asyncHandler(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.userId },
    username: { $regex: escapeRegex(req.query.filter), $options: 'i' },
  })
    .select('username email')
    .sort({ username: 1 })
    .limit(20);
  res.json({ user: users.map((u) => ({ _id: u._id, username: u.username, email: u.email })) });
}));

module.exports = router;
