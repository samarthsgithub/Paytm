const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

const accountSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // integer paise; the floor of 0 is also enforced by the conditional debit in the transfer
    balance: { type: Number, required: true, min: 0, validate: Number.isInteger },
  },
  { timestamps: true },
);

const transactionSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1, validate: Number.isInteger },
    idempotencyKey: { type: String },
  },
  { timestamps: true },
);
// A retried request with the same key from the same sender must not move money twice.
transactionSchema.index({ from: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } });

module.exports = {
  User: mongoose.model('User', userSchema),
  Account: mongoose.model('Account', accountSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
};
