const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

const env = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());

const clientUrlClean = (env.clientUrl || '').trim().replace(/\/+$/, '');
const allowedOrigins = [
  clientUrlClean,
  'https://ai-interview-platform-one-lyart.vercel.app',
  'https://ai-interview-platform-dich1x738-aryansharma-progs-projects.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.trim().replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        env.nodeEnv === 'development'
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: This origin is not allowed'), false);
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.nodeEnv !== 'test') app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

app.use('/uploads', express.static(path.join(process.cwd(), env.upload.dir)));

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
