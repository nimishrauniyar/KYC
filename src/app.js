const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const openApiDocument = require('../docs/openapi.json');
const mongoose = require('mongoose');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { corsOrigin } = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = corsOrigin.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigin === '*' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS policy'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/v1/health', (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 'ok' : 'degraded';
  const statusCode = isDbConnected ? 200 : 503;
  return res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: isDbConnected ? 'connected' : 'disconnected',
    },
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);


module.exports = app;
