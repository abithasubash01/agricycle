const express = require('express');
const router = express.Router();
const { calculateDistance } = require('../services/geoService');
const { RATE_PER_KM } = require('../services/matchingService');

/**
 * POST /api/transport/calculate
 */
router.post('/calculate', (req, res) => {
  const { fromLocation, toLocation, from_location, to_location, quantity } = req.body;
  const from = (fromLocation || from_location || '').trim();
  const to = (toLocation || to_location || '').trim();

  if (!from || !to) {
    return res.status(400).json({
      error: 'Missing locations',
      message: 'fromLocation and toLocation are required',
      statusCode: 400
    });
  }

  const distance = calculateDistance(from, to);

  if (distance === null) {
    return res.status(400).json({
      error: 'Unknown location',
      message: `Cannot determine distance between "${from}" and "${to}". Ensure locations are valid cities.`,
      statusCode: 400
    });
  }

  const qty = Number(quantity || 0);
  const totalTransportCost = Math.round(distance * RATE_PER_KM * 100) / 100;

  return res.status(200).json({
    fromLocation: from,
    toLocation: to,
    distance,
    distanceUnit: 'km',
    quantity: qty,
    quantityUnit: 'kg',
    ratePerKm: RATE_PER_KM,
    ratePerKmUnit: '₹/km',
    totalTransportCost,
    costUnit: '₹',
    note: 'Distance calculated using Haversine formula with 1.3× road curvature factor. Cost = distance × ₹2.5/km.'
  });
});

module.exports = router;
