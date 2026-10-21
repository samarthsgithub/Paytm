const { AppError } = require('../utils/errors');

// validate({ body: schema, query: schema }) parses and replaces the request parts with the cleaned values.
const validate = (schemas) => (req, _res, next) => {
  for (const part of ['body', 'query', 'params']) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part]);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join('.') || part}: ${i.message}`).join('; ');
      return next(new AppError(400, message, 'VALIDATION_ERROR'));
    }
    Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true });
  }
  next();
};

module.exports = { validate };
