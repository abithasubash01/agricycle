/**
 * Matching Service — matches farmer listings with buyer requirements
 * 
 * Scoring logic:
 *  - Residue type compatibility (hard filter)
 *  - Quantity match quality
 *  - Distance (closer = better)
 *  - Buyer price offered
 */

const { calculateDistance } = require('./geoService');

const RATE_PER_KM = 2.5;       // ₹ per km transport cost
const HANDLING_PERCENT = 5;    // 5% of gross value

/**
 * Normalise residue type strings for matching
 */
function normaliseResidue(str) {
  if (!str) return '';
  return str.toLowerCase().trim()
    .replace(/[-\s]+/g, '_')
    .replace(/paddy/g, 'rice');
}

/**
 * Check if listing residue type is compatible with requirement
 */
function isResidueCompatible(listingResidue, requirementResidue) {
  const l = normaliseResidue(listingResidue);
  const r = normaliseResidue(requirementResidue);

  if (l === r) return true;

  // Compatibility groups
  const groups = [
    ['rice', 'rice_straw', 'paddy', 'paddy_straw'],
    ['wheat', 'wheat_straw'],
    ['sugarcane', 'sugarcane_bagasse', 'bagasse'],
    ['corn', 'corn_stalks', 'maize'],
    ['other']
  ];

  for (const group of groups) {
    if (group.includes(l) && group.includes(r)) return true;
    // Cross-match: if either is a base crop name and other is its residue
    if (group.includes(l) && group.some(g => r.includes(g))) return true;
    if (group.includes(r) && group.some(g => l.includes(g))) return true;
  }

  return false;
}

/**
 * Match a farmer listing with all active buyer requirements and return ranked matches
 * @param {object} listing
 * @param {Array} requirements
 * @returns {Array} matches sorted by net_value descending
 */
function matchListingWithRequirements(listing, requirements) {
  const matches = [];

  for (const req of requirements) {
    if (!isResidueCompatible(listing.residue_type, req.residue_type)) continue;
    if (req.status !== 'active') continue;

    const quantity = Math.min(
      Number(listing.residue_quantity_kg),
      Number(req.required_quantity_kg)
    );

    const distance = calculateDistance(listing.location, req.location) || 100;
    const transport_cost = Math.round(distance * RATE_PER_KM);
    const gross_value = Math.round(quantity * Number(req.price_per_kg));
    const handling_cost = Math.round(gross_value * HANDLING_PERCENT / 100);
    const net_value = gross_value - transport_cost - handling_cost;

    const quantityScore = Math.min(quantity / Number(listing.residue_quantity_kg), 1) * 100;
    const distanceScore = Math.max(0, 100 - (distance / 5));
    const priceScore = Number(req.price_per_kg) * 10;

    const matchScore = Math.round(
      quantityScore * 0.4 + distanceScore * 0.3 + priceScore * 0.3
    );

    matches.push({
      requirement: req,
      quantity,
      distance_km: distance,
      transport_cost,
      handling_cost,
      gross_value,
      net_value,
      handling_cost_percent: HANDLING_PERCENT,
      match_score: matchScore,
      price_per_kg: Number(req.price_per_kg),
      buyer_id: req.buyer_id,
      buyer_name: req.buyer_name || 'Industrial Buyer',
      buyer_location: req.location,
      use_type: req.use_type,
      is_profitable: net_value > 0
    });
  }

  return matches.sort((a, b) => b.net_value - a.net_value);
}

/**
 * Match all listings against a buyer requirement
 */
function matchRequirementWithListings(requirement, listings) {
  const matches = [];

  for (const listing of listings) {
    if (!isResidueCompatible(listing.residue_type, requirement.residue_type)) continue;
    if (listing.status !== 'available') continue;

    const quantity = Math.min(
      Number(listing.residue_quantity_kg),
      Number(requirement.required_quantity_kg)
    );

    const distance = calculateDistance(listing.location, requirement.location) || 100;
    const transport_cost = Math.round(distance * RATE_PER_KM);
    const gross_value = Math.round(quantity * Number(requirement.price_per_kg));
    const handling_cost = Math.round(gross_value * HANDLING_PERCENT / 100);
    const net_value = gross_value - transport_cost - handling_cost;

    matches.push({
      listing,
      quantity,
      distance_km: distance,
      transport_cost,
      handling_cost,
      gross_value,
      net_value,
      handling_cost_percent: HANDLING_PERCENT,
      price_per_kg: Number(requirement.price_per_kg),
      farmer_name: listing.farmer_name || 'Farmer',
      farmer_location: listing.location
    });
  }

  return matches.sort((a, b) => b.net_value - a.net_value);
}

module.exports = {
  matchListingWithRequirements,
  matchRequirementWithListings,
  isResidueCompatible,
  RATE_PER_KM,
  HANDLING_PERCENT
};
