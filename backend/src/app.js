const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // behind Render's proxy: needed for correct client IPs in rate limiting

app.use(helmet());
app.use(cors({
  origin(origin, cb) {
    // Allow non-browser clients (no Origin header) and the configured frontends.
    if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
}));
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));

// Liveness + database readiness. Point the uptime monitor here: it also keeps Atlas from idling.
app.get('/health', async (_req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
  } catch {
    res.status(503).json({ status: 'degraded' });
  }
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: env.NODE_ENV === 'test' ? 1000 : 30, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many attempts, try again later', code: 'RATE_LIMITED' } });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: env.NODE_ENV === 'test' ? 10000 : 120, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many requests', code: 'RATE_LIMITED' } });

app.use('/api/v1', apiLimiter);
app.use('/api/v1/user/signin', authLimiter);
app.use('/api/v1/user/signup', authLimiter);
app.use('/api/v1/user', require('./routes/auth'));
app.use('/api/v1/user', require('./routes/user'));
app.use('/api/v1/account', require('./routes/account'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
