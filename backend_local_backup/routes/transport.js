const express = require("express");
const router = express.Router();
const { ratePerKm, getDistance, isValidLocation } = require("../config");
const { isPositiveNumber } = require("../utils/validation");

/**
 * @route   POST /api/transport/calculate
 * @desc    Calculate transportation cost between two locations
 * @access  Public
 */
router.post("/calculate", (req, res) => {
  const { fromLocation, toLocation, quantity } = req.body;

  if (!fromLocation || !toLocation || typeof fromLocation !== "string" || typeof toLocation !== "string") {
    return res.status(400).json({
      error: "Unknown location",
      message: "fromLocation or toLocation not recognized",
      statusCode: 400
    });
  }

  const distance = getDistance(fromLocation, toLocation);
  if (distance === null) {
    return res.status(400).json({
      error: "Unknown location",
      message: "fromLocation or toLocation not recognized",
      statusCode: 400
    });
  }

  if (quantity !== undefined && !isPositiveNumber(quantity)) {
    return res.status(400).json({
      error: "Invalid input",
      message: "quantity must be a positive number",
      statusCode: 400
    });
  }

  const qty = quantity ? Number(quantity) : 0;
  // Formula as defined in MVP specification: distance × ratePerKm
  const totalTransportCost = Math.round(distance * ratePerKm * 100) / 100;

  return res.status(200).json({
    fromLocation: fromLocation.trim(),
    toLocation: toLocation.trim(),
    distance,
    distanceUnit: "km",
    quantity: qty,
    quantityUnit: "kg",
    ratePerKm,
    ratePerKmUnit: "₹/km",
    totalTransportCost,
    costUnit: "₹",
    note: "Cost calculated as: distance × ratePerKm. These are MVP estimates and may vary with actual logistics."
  });
});

module.exports = router;
