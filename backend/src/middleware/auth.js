const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AppError } = require('../utils/errors');

function requireAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(new AppError(401, 'Authentication required', 'UNAUTHENTICATED'));
  try {
    const { userId } = jwt.verify(token, env.JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN'));
  }
}

module.exports = { requireAuth };
