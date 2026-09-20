/* Seeds an admin user for local development. Run with `npm run seed`. */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const logger = require('./logger');

(async () => {
  await mongoose.connect(env.mongoUri);

  const existing = await User.findOne({ email: 'admin@aiinterview.com' });
  if (existing) {
    logger.info('Admin user already exists. Skipping seed.');
    process.exit(0);
  }

  await User.create({
    name: 'Platform Admin',
    email: 'admin@aiinterview.com',
    password: 'Admin@12345',
    role: 'admin',
    isEmailVerified: true,
  });

  logger.info('Admin user created: admin@aiinterview.com / Admin@12345');
  process.exit(0);
})();
