require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('ProjectService: MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

app.use('/api/projects', projectRoutes);
app.get('/health', (req, res) => res.json({ status: 'ProjectService OK' }));

app.listen(PORT, () => console.log(`ProjectService running on port ${PORT}`));
