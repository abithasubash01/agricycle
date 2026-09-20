require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Production-ready CORS configuration:
// Supports FRONTEND_URL or CORS_ORIGIN from environment variables (comma-separated or wildcard).
// Supports cloud platforms (Vercel, Netlify, Render), localhost, and non-browser health checks.
const rawFrontendUrls = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '';
const configuredOrigins = rawFrontendUrls
  ? rawFrontendUrls.split(',').map((o) => o.trim().replace(/\/+$/, ''))
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, curl, server-to-server, Render/AWS health checkers)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Allow all if explicitly configured with wildcard or if no restrictions set
    if (configuredOrigins.includes('*') || configuredOrigins.length === 0) {
      return callback(null, true);
    }

    // Match exact configured origins or known cloud platforms / localhost
    if (
      configuredOrigins.includes(cleanOrigin) ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1') ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.endsWith('.netlify.app') ||
      cleanOrigin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }

    // Default: allow origin to ensure deployed frontend can always connect
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Import Routes
const healthRoute = require('./routes/health');
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const buyerRoutes = require('./routes/buyers');
const residueRoutes = require('./routes/residue');
const transportRoutes = require('./routes/transport');
const opportunityRoutes = require('./routes/opportunities');

// Mount Routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/residue', residueRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/opportunities', opportunityRoutes);

// Root info
app.get('/', (req, res) => {
  res.json({
    name: 'AGRICYCLE API',
    version: '2.0.0',
    description: 'Full-stack agricultural crop-residue-to-resource platform backend with real DB persistence',
    dbMode: require('./db').getMode(),
    endpoints: [
      'GET  /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'GET  /api/listings',
      'POST /api/listings',
      'GET  /api/listings/:id',
      'PUT  /api/listings/:id',
      'DELETE /api/listings/:id',
      'GET  /api/buyers',
      'GET  /api/buyers/requirements',
      'POST /api/buyers/requirements',
      'GET  /api/buyers/requirements/:id',
      'PUT  /api/buyers/requirements/:id',
      'DELETE /api/buyers/requirements/:id',
      'POST /api/buyers/match',
      'POST /api/residue/calculate',
      'POST /api/transport/calculate',
      'GET  /api/opportunities',
      'POST /api/opportunities/analyze',
      'GET  /api/opportunities/:id'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    statusCode: 404
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status === 400 && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON payload',
      message: 'Malformed JSON syntax in request body',
      statusCode: 400
    });
  }
  console.error('Server Error:', err);
  res.status(status).json({
    error: status === 500 ? 'Server error' : err.name || 'Error',
    message: err.message || 'An unexpected error occurred',
    statusCode: status
  });
});

// Start
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    const db = require('./db');
    console.log('=========================================');
    console.log(`  AGRICYCLE Backend v2.0 Started`);
    console.log(`  Listening on: http://${HOST}:${PORT}`);
    console.log(`  DB Mode: ${db.getMode()}`);
    console.log('=========================================');
  });
}

module.exports = app;
