require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 5006;

app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MessagingService: MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

app.use('/api/messages', messageRoutes);
app.get('/health', (req, res) => res.json({ status: 'MessagingService OK' }));

app.listen(PORT, () => console.log(`MessagingService running on port ${PORT}`));
