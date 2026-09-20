const { body } = require('express-validator');

const createInterviewValidator = [
  body('category')
    .optional()
    .isIn([
      'HR',
      'Technical',
      'DSA',
      'Behavioral',
      'System Design',
      'Mixed',
      'Company-specific',
      'OOP',
      'DBMS',
      'OS',
      'CN',
      'Resume Based',
    ])
    .withMessage('Invalid interview category'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard', 'Adaptive'])
    .withMessage('Invalid difficulty'),
  body('mode').optional().isIn(['Voice', 'Text', 'Camera']).withMessage('Invalid interview mode'),
];

module.exports = { createInterviewValidator };

