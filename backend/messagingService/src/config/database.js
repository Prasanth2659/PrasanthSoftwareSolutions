const mongoose = require("mongoose");
const { getLogger } = require("../utils/logger");
const logger = getLogger();
async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  try {
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB");
    return mongoose.connection;
  } catch (err) { logger.error("MongoDB failed"); throw err; }
}
module.exports = { connectDatabase };