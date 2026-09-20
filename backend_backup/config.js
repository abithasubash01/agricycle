/**
 * AGRICYCLE Backend Configuration
 * 
 * Note: Coefficients, distances, and rates are MVP assumptions
 * designed for demonstration and hackathon use.
 */

// Configurable residue coefficients (MVP assumptions, illustrative estimates)
const residueCoefficients = {
  rice: 0.70,       // 70% of harvest (illustrative)
  wheat: 0.65,      // 65% of harvest (illustrative)
  sugarcane: 0.25,  // 25% of harvest (illustrative)
  corn: 0.50,       // 50% of harvest (illustrative)
  other: 0.50       // 50% default (illustrative)
};

const validCropTypes = Object.keys(residueCoefficients);

// Simple distance lookup matrix (in km)
const distanceMatrix = {
  "Cuddalore-Chennai": 150,
  "Cuddalore-Villupuram": 50,
  "Chennai-Villupuram": 100,
  "Chennai-Kanchipuram": 80,
  "Villupuram-Kanchipuram": 60
};

// Known locations for quick validation
const knownLocations = [
  "Cuddalore",
  "Chennai",
  "Villupuram",
  "Kanchipuram"
];

/**
 * Look up distance between two locations (bidirectional, case-insensitive)
 * @param {string} from 
 * @param {string} to 
 * @returns {number|null} distance in km or null if not found
 */
function getDistance(from, to) {
  if (!from || !to) return null;
  const f = from.trim();
  const t = to.trim();
  
  if (f.toLowerCase() === t.toLowerCase()) {
    return 0;
  }

  for (const [route, distance] of Object.entries(distanceMatrix)) {
    const [cityA, cityB] = route.split("-");
    if (
      (cityA.toLowerCase() === f.toLowerCase() && cityB.toLowerCase() === t.toLowerCase()) ||
      (cityB.toLowerCase() === f.toLowerCase() && cityA.toLowerCase() === t.toLowerCase())
    ) {
      return distance;
    }
  }

  return null;
}

// Demo buyers for testing and matching
const demoBuyers = [
  {
    buyerId: "buyer_001",
    name: "Eco Fuels Ltd",
    location: "Chennai",
    residueType: "rice_straw",
    acceptedResidueTypes: ["rice_straw", "rice", "straw", "wheat_straw"],
    requiredQuantity: 2000,
    offeredPrice: 3,
    priceUnit: "₹/kg",
    type: "biomass_fuel"
  },
  {
    buyerId: "buyer_002",
    name: "Green Compost Co",
    location: "Villupuram",
    residueType: "rice_straw",
    acceptedResidueTypes: ["rice_straw", "rice", "straw", "corn_stalks", "other"],
    requiredQuantity: 5000,
    offeredPrice: 2.5,
    priceUnit: "₹/kg",
    type: "compost"
  },
  {
    buyerId: "buyer_003",
    name: "Bio Energy Systems",
    location: "Chennai",
    residueType: "sugarcane_bagasse",
    acceptedResidueTypes: ["sugarcane_bagasse", "sugarcane", "bagasse", "corn_stalks"],
    requiredQuantity: 1000,
    offeredPrice: 4,
    priceUnit: "₹/kg",
    type: "biogas"
  }
];

// Transportation cost parameters
const ratePerKm = 2.5; // ₹ per km (configurable, MVP estimate)

// Default handling cost percentage
const defaultHandlingCostPercent = 5; // 5% of gross value (configurable)

module.exports = {
  port: process.env.PORT || 5000,
  residueCoefficients,
  validCropTypes,
  distanceMatrix,
  knownLocations,
  getDistance,
  demoBuyers,
  ratePerKm,
  defaultHandlingCostPercent
};
