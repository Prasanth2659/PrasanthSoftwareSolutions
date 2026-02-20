require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const srRoutes = require('./routes/serviceRequestRoutes');

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('ServiceRequestService: MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

app.use('/api/service-requests', srRoutes);
app.get('/health', (req, res) => res.json({ status: 'ServiceRequestService OK' }));

app.listen(PORT, () => console.log(`ServiceRequestService running on port ${PORT}`));
