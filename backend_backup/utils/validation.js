const { validCropTypes, knownLocations } = require("../config");

/**
 * Check if a crop type is supported (case-insensitive)
 * @param {string} cropType 
 * @returns {string|null} normalized crop type or null if invalid
 */
function validateCropType(cropType) {
  if (!cropType || typeof cropType !== "string") return null;
  const normalized = cropType.trim().toLowerCase();
  return validCropTypes.includes(normalized) ? normalized : null;
}

/**
 * Check if a value is a valid positive number
 * @param {any} val 
 * @returns {boolean}
 */
function isPositiveNumber(val) {
  if (val === undefined || val === null || val === "") return false;
  const num = Number(val);
  return !isNaN(num) && num > 0;
}

/**
 * Check if a location is recognized
 * @param {string} loc 
 * @returns {boolean}
 */
function isValidLocation(loc) {
  if (!loc || typeof loc !== "string") return false;
  const normalized = loc.trim().toLowerCase();
  return knownLocations.some(k => k.toLowerCase() === normalized);
}

/**
 * Normalize residue type string
 * @param {string} type 
 * @returns {string}
 */
function normalizeResidueType(type) {
  if (!type || typeof type !== "string") return "";
  return type.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

module.exports = {
  validateCropType,
  isPositiveNumber,
  isValidLocation,
  normalizeResidueType
};
