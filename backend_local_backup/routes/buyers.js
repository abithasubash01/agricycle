const express = require("express");
const router = express.Router();
const { demoBuyers, getDistance } = require("../config");
const { normalizeResidueType, isPositiveNumber } = require("../utils/validation");

const validResidueTypes = [
  "rice_straw",
  "rice",
  "straw",
  "sugarcane_bagasse",
  "sugarcane",
  "bagasse",
  "wheat_straw",
  "wheat",
  "corn_stalks",
  "corn",
  "other"
];

/**
 * @route   GET /api/buyers
 * @desc    Get demo list of all buyers
 * @access  Public
 */
router.get("/", (req, res) => {
  try {
    const formattedBuyers = demoBuyers.map(b => ({
      buyerId: b.buyerId,
      name: b.name,
      location: b.location,
      residueType: b.residueType,
      requiredQuantity: b.requiredQuantity,
      offeredPrice: b.offeredPrice,
      priceUnit: b.priceUnit,
      type: b.type
    }));

    return res.status(200).json({
      buyers: formattedBuyers,
      totalBuyers: formattedBuyers.length
    });
  } catch (err) {
    return res.status(500).json({
      error: "Unable to fetch buyers",
      statusCode: 500
    });
  }
});

/**
 * @route   POST /api/buyers/match
 * @desc    Match farmers with potential buyers
 * @access  Public
 */
router.post("/match", (req, res) => {
  const { residueType, quantity, quality, farmerLocation } = req.body;

  if (!residueType || typeof residueType !== "string") {
    return res.status(400).json({
      error: "Invalid residue type",
      statusCode: 400
    });
  }

  const normalizedResidue = normalizeResidueType(residueType);
  const isValidResidue = validResidueTypes.some(t => 
    t === normalizedResidue || normalizedResidue.includes(t) || t.includes(normalizedResidue)
  );

  if (!isValidResidue) {
    return res.status(400).json({
      error: "Invalid residue type",
      statusCode: 400
    });
  }

  // Filter buyers accepting this residue type
  const matchedBuyers = demoBuyers.filter(buyer => {
    const buyerResidue = normalizeResidueType(buyer.residueType);
    if (buyerResidue === normalizedResidue) return true;
    if (buyer.acceptedResidueTypes && buyer.acceptedResidueTypes.some(art => 
      art === normalizedResidue || normalizedResidue.includes(art) || art.includes(normalizedResidue)
    )) {
      return true;
    }
    return false;
  });

  if (matchedBuyers.length === 0) {
    return res.status(404).json({
      error: "No buyers found matching your criteria",
      statusCode: 404
    });
  }

  // Calculate distance & craft matchReason
  const matches = matchedBuyers.map(buyer => {
    const dist = farmerLocation ? getDistance(farmerLocation, buyer.location) : null;
    const distanceVal = dist !== null ? dist : 100; // Fallback estimate if not in matrix

    let matchReason = "Matches residue type and buyer requirements";
    if (distanceVal <= 50) {
      matchReason = "Closest buyer; good quantity match";
    } else if (buyer.buyerId === "buyer_001") {
      matchReason = "Matches residue type and quantity; reasonable distance";
    } else if (dist !== null) {
      matchReason = "Matches residue type and quantity; reasonable distance";
    }

    return {
      buyerId: buyer.buyerId,
      buyerName: buyer.name,
      buyerLocation: buyer.location,
      requiredQuantity: buyer.requiredQuantity,
      offeredPrice: buyer.offeredPrice,
      priceUnit: buyer.priceUnit,
      buyerType: buyer.type,
      distance: distanceVal,
      distanceUnit: "km",
      matchReason
    };
  });

  return res.status(200).json({
    matches,
    totalMatches: matches.length
  });
});

module.exports = router;
