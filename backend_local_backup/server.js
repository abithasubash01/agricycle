const express = require("express");
const cors = require("cors");
const config = require("./config");

// Import route modules
const healthRoutes = require("./routes/health");
const residueRoutes = require("./routes/residue");
const buyersRoutes = require("./routes/buyers");
const transportRoutes = require("./routes/transport");
const opportunitiesRoutes = require("./routes/opportunities");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend developer
app.use(express.json()); // Parse JSON request bodies

// Mount API routes
app.use("/api/health", healthRoutes);
app.use("/api/residue", residueRoutes);
app.use("/api/buyers", buyersRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/opportunities", opportunitiesRoutes);

// Root route for convenience
app.get("/", (req, res) => {
  res.json({
    name: "AGRICYCLE API",
    version: "1.0.0",
    description: "AI-powered agricultural crop-residue-to-resource platform backend",
    endpoints: [
      "GET  /api/health",
      "POST /api/residue/calculate",
      "GET  /api/buyers",
      "POST /api/buyers/match",
      "POST /api/transport/calculate",
      "POST /api/opportunities/analyze"
    ]
  });
});

// Handle 404 for unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    statusCode: 404
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status === 400 && err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON payload",
      message: "Malformed JSON syntax in request body",
      statusCode: 400
    });
  }

  console.error("Server Error:", err);
  res.status(status).json({
    error: status === 500 ? "Server error" : err.name || "Error",
    message: err.message || "An unexpected error occurred",
    statusCode: status
  });
});

// Start server if executed directly
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  AGRICYCLE Backend Server Started`);
    console.log(`  Listening on: http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });
}

module.exports = app;
