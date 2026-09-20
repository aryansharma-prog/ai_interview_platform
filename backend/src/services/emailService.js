const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;
if (env.smtp.user && env.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 4000,
  });
}

async function sendMail({ to, subject, html }) {
  if (!transporter) {
    logger.warn(`SMTP not configured — email not sent. Would have sent "${subject}" to ${to}`);
    return;
  }
  try {
    await transporter.sendMail({ from: env.smtp.from, to, subject, html });
  } catch (err) {
    logger.warn(`Failed to send email to ${to}: ${err.message}`);
  }
}

const sendVerificationEmail = (to, token) =>
  sendMail({
    to,
    subject: 'Verify your email — AI Interview Platform',
    html: `<p>Welcome! Please verify your email by visiting:</p>
           <a href="${env.clientUrl}/verify-email?token=${token}">${env.clientUrl}/verify-email?token=${token}</a>
           <p>This link expires in 24 hours.</p>`,
  });

const sendPasswordResetEmail = (to, token) =>
  sendMail({
    to,
    subject: 'Reset your password — AI Interview Platform',
    html: `<p>You requested a password reset. Click below to set a new password:</p>
           <a href="${env.clientUrl}/reset-password?token=${token}">${env.clientUrl}/reset-password?token=${token}</a>
           <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>`,
  });

module.exports = { sendMail, sendVerificationEmail, sendPasswordResetEmail };
