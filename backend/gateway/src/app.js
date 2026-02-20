require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const proxy = require('express-http-proxy');
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Public routes — no auth needed
app.use('/api/auth', proxy(process.env.AUTH_SERVICE_URL));

// Protected routes — verify JWT then proxy
app.use('/api/users',           verifyToken, proxy(process.env.USER_SERVICE_URL));
app.use('/api/projects',        verifyToken, proxy(process.env.PROJECT_SERVICE_URL));
app.use('/api/services',        verifyToken, proxy(process.env.SERVICE_CATALOG_URL));
app.use('/api/companies',       verifyToken, proxy(process.env.SERVICE_CATALOG_URL));
app.use('/api/service-requests',verifyToken, proxy(process.env.SERVICE_REQUEST_URL));
app.use('/api/messages',        verifyToken, proxy(process.env.MESSAGING_SERVICE_URL));

app.get('/health', (req, res) => res.json({ status: 'Gateway OK' }));

app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
