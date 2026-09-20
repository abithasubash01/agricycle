const express = require("express");
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "AGRICYCLE backend running"
  });
});

module.exports = router;
