const { ZodError } = require('zod');

const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}`, code: 'NOT_FOUND' });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ message: 'Invalid input', code: 'VALIDATION_ERROR' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Malformed JSON body', code: 'BAD_JSON' });
  if (err.code === 11000) return res.status(409).json({ message: 'Resource already exists', code: 'DUPLICATE' });
  if (err.status && err.status < 500) return res.status(err.status).json({ message: err.message, code: err.code });

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(500).json({ message: 'Internal server error', code: 'INTERNAL' });
};

module.exports = { notFound, errorHandler };
