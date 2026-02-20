require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  const existing = await User.findOne({ email: 'admin@prasanth.dev' });
  if (existing) {
    console.log('Admin already seeded. Skipping.');
    process.exit(0);
  }

  // Admin
  await User.create({
    name: 'Prasanth Admin',
    email: 'admin@prasanth.dev',
    password: 'Admin@123',
    role: 'admin',
  });

  // Sample Employee
  await User.create({
    name: 'Sample Employee',
    email: 'employee@prasanth.dev',
    password: 'Emp@123',
    role: 'employee',
  });

  // Sample Client
  await User.create({
    name: 'Sample Client',
    email: 'client@prasanth.dev',
    password: 'Client@123',
    role: 'client',
  });

  console.log('✅ Seed complete — Admin, Employee, Client created');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
