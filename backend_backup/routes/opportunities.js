const express = require("express");
const router = express.Router();
const { defaultHandlingCostPercent } = require("../config");
const { isPositiveNumber } = require("../utils/validation");

/**
 * @route   POST /api/opportunities/analyze
 * @desc    Analyze farmer opportunity and calculate net earnings after transport & handling
 * @access  Public
 */
router.post("/analyze", (req, res) => {
  const { quantity, buyerPricePerKg, transportCost, handlingCostPercent } = req.body;

  // Validate inputs
  if (
    !isPositiveNumber(quantity) ||
    !isPositiveNumber(buyerPricePerKg) ||
    transportCost === undefined ||
    isNaN(Number(transportCost)) ||
    Number(transportCost) < 0
  ) {
    return res.status(400).json({
      error: "Invalid input",
      message: "Quantity and prices must be positive numbers",
      statusCode: 400
    });
  }

  const hPercent = handlingCostPercent !== undefined ? Number(handlingCostPercent) : defaultHandlingCostPercent;
  if (isNaN(hPercent) || hPercent < 0) {
    return res.status(400).json({
      error: "Invalid input",
      message: "handlingCostPercent must be a non-negative number",
      statusCode: 400
    });
  }

  const qty = Number(quantity);
  const price = Number(buyerPricePerKg);
  const transport = Number(transportCost);

  const grossValue = Math.round(qty * price * 100) / 100;
  const handlingCost = Math.round(((grossValue * hPercent) / 100) * 100) / 100;
  const afterTransport = Math.round((grossValue - transport) * 100) / 100;
  const netValue = Math.round((afterTransport - handlingCost) * 100) / 100;

  const formattedNet = netValue.toLocaleString("en-IN");

  return res.status(200).json({
    quantity: qty,
    quantityUnit: "kg",
    buyerPrice: price,
    buyerPriceUnit: "₹/kg",
    grossValue,
    grossValueUnit: "₹",
    transportCost: transport,
    transportCostUnit: "₹",
    handlingCost,
    handlingCostUnit: "₹",
    handlingCostPercent: hPercent,
    netValue,
    netValueUnit: "₹",
    calculation: {
      step1_gross: grossValue,
      step2_minus_transport: `${grossValue} - ${transport} = ${afterTransport}`,
      step3_minus_handling: `${afterTransport} - ${handlingCost} = ${netValue}`
    },
    summary: `Farmer receives ₹${formattedNet} after all costs (₹${price} × ${qty} kg - ₹${transport} transport - ₹${handlingCost} handling)`
  });
});

module.exports = router;
