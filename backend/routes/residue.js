const express = require('express');
const router = express.Router();
const { calculateDistance } = require('../services/geoService');
const { RATE_PER_KM } = require('../services/matchingService');

// Residue coefficients — retain transparent calculation
const residueCoefficients = {
  rice: 0.70, paddy: 0.70,
  wheat: 0.65,
  sugarcane: 0.25,
  corn: 0.50, maize: 0.50,
  other: 0.50
};

const validCropTypes = Object.keys(residueCoefficients);

/**
 * POST /api/residue/calculate and /api/residue/estimate
 */
router.post(['/calculate', '/estimate'], (req, res) => {
  const { cropType, crop, cultivatedArea, estimatedHarvestQuantity, harvest_quantity_kg } = req.body;
  const cropInput = (cropType || crop || '').toLowerCase().trim();
  const harvestQty = Number(estimatedHarvestQuantity || harvest_quantity_kg || 0);

  if (!cropInput || !residueCoefficients[cropInput]) {
    return res.status(400).json({
      error: 'Invalid crop type',
      validTypes: validCropTypes,
      statusCode: 400
    });
  }

  if (harvestQty <= 0) {
    return res.status(400).json({
      error: 'Invalid input',
      message: 'Harvest quantity must be a positive number',
      statusCode: 400
    });
  }

  const coeff = residueCoefficients[cropInput];
  const estimatedResidue = Math.round(harvestQty * coeff);

  const residueTypeMap = {
    rice: 'rice_straw', paddy: 'rice_straw',
    wheat: 'wheat_straw',
    sugarcane: 'sugarcane_bagasse',
    corn: 'corn_stalks', maize: 'corn_stalks',
    other: 'crop_residue'
  };

  return res.status(200).json({
    cropType: cropInput,
    cultivatedArea: Number(cultivatedArea || 0),
    harvestQuantity: harvestQty,
    estimatedResidueQuantity: estimatedResidue,
    residueType: residueTypeMap[cropInput] || `${cropInput}_residue`,
    residueCoefficient: coeff,
    unit: 'kg',
    explanation: 'Estimated residue based on crop type (MVP assumption, not scientifically universal)'
  });
});

module.exports = router;
