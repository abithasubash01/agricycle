const express = require("express");
const router = express.Router();
const { residueCoefficients, validCropTypes } = require("../config");
const { validateCropType, isPositiveNumber } = require("../utils/validation");

/**
 * @route   POST /api/residue/calculate
 * @desc    Calculate estimated crop residue quantity
 * @access  Public
 */
router.post("/calculate", (req, res) => {
  const { cropType, cultivatedArea, estimatedHarvestQuantity } = req.body;

  const validCrop = validateCropType(cropType);
  if (!validCrop) {
    return res.status(400).json({
      error: "Invalid crop type",
      validTypes: validCropTypes,
      statusCode: 400
    });
  }

  if (!isPositiveNumber(cultivatedArea) || !isPositiveNumber(estimatedHarvestQuantity)) {
    return res.status(400).json({
      error: "Invalid input",
      message: "cultivatedArea and estimatedHarvestQuantity must be positive numbers",
      statusCode: 400
    });
  }

  const area = Number(cultivatedArea);
  const harvestQty = Number(estimatedHarvestQuantity);
  const coefficient = residueCoefficients[validCrop];
  const estimatedResidue = Math.round(harvestQty * coefficient);

  return res.status(200).json({
    cropType: validCrop,
    cultivatedArea: area,
    harvestQuantity: harvestQty,
    estimatedResidueQuantity: estimatedResidue,
    residueCoefficient: coefficient,
    unit: "kg",
    explanation: "Estimated residue based on crop type (MVP assumption, not scientifically universal)"
  });
});

module.exports = router;
