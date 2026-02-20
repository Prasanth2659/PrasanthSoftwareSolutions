require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const serviceRoutes = require('./routes/serviceRoutes');
const companyRoutes = require('./routes/companyRoutes');

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('ServiceCatalogService: MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

app.use('/api/services',  serviceRoutes);
app.use('/api/companies', companyRoutes);
app.get('/health', (req, res) => res.json({ status: 'ServiceCatalogService OK' }));

app.listen(PORT, () => console.log(`ServiceCatalogService running on port ${PORT}`));
