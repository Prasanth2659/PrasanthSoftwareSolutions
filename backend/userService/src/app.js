require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('UserService: MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

app.use('/api/users', userRoutes);
app.get('/health', (req, res) => res.json({ status: 'UserService OK' }));

app.listen(PORT, () => console.log(`UserService running on port ${PORT}`));
