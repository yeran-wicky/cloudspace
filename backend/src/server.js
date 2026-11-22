require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const erpRoutes = require('./routes/erpRoutes');
const pool = require('./config/db');

const app = express();

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost', 'http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} blocked by CORS policy`));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10kb' }));

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api', erpRoutes);

app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
    console.error('[Server Error]', err.message || err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ERP] Enterprise Secure Server running on port ${PORT}`);
});

const shutdown = (signal) => {
    console.log(`[ERP] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
        console.log('[ERP] HTTP server closed.');
        try {
            await pool.end();
            console.log('[ERP] Database pool drained and closed.');
            process.exit(0);
        } catch (err) {
            console.error('[ERP] Error closing database pool:', err.message);
            process.exit(1);
        }
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
