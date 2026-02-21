const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");

const envFile = ".env." + (process.env.NODE_ENV || "development");
const envPath = path.resolve(__dirname, "..", envFile);
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5003;

const { verifyToken } = require("./middlewares/authMiddleware");
const { initializeLogger } = require("./utils/logger");
const { connectDatabase } = require("./config/database.js");

const projectRoutes = require("./routes/projectRoutes");

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(morgan("combined"));

const logger = initializeLogger();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "projectService running", version: "1.0.0" });
});

app.use("/api", verifyToken);
app.use("/api/projects", projectRoutes);

app.use("*", (req, res) => res.status(404).json({ success: false, message: "Route not found" }));

app.use((err, req, res, next) => {
  logger.error("Service error:", { error: err.message });
  res.status(500).json({ success: false, message: "Internal server error" });
});

connectDatabase().then(() => logger.info("DB connected")).catch(err => { logger.error("DB fail"); process.exit(1); });

const server = app.listen(PORT, () => console.log("🚀 projectService running on port " + PORT));

const gracefulShutdown = () => server.close(() => mongoose.connection.close().then(() => process.exit(0)));
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

module.exports = app;