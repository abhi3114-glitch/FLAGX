import { body, validationResult } from 'express-validator';

export const validateFlag = [
  body('name').notEmpty().withMessage('Name is required'),
  body('environment').optional().isIn(['development', 'staging', 'production']),
  body('enabled').optional().isBoolean(),
  body('rules').optional().isArray(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];