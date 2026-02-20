require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('AuthService: MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

app.use('/api/auth', authRoutes);
app.get('/health', (req, res) => res.json({ status: 'AuthService OK' }));

app.listen(PORT, () => console.log(`AuthService running on port ${PORT}`));
