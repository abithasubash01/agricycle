const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCoords } = require('../services/geoService');

// Residue coefficient map (retain existing logic)
const residueCoefficients = {
  rice: 0.70,
  paddy: 0.70,
  wheat: 0.65,
  sugarcane: 0.25,
  corn: 0.50,
  maize: 0.50,
  other: 0.50
};

const residueTypeMap = {
  rice: 'rice_straw',
  paddy: 'rice_straw',
  wheat: 'wheat_straw',
  sugarcane: 'sugarcane_bagasse',
  corn: 'corn_stalks',
  maize: 'corn_stalks',
  other: 'crop_residue'
};

/**
 * POST /api/listings
 * Create a new farmer listing with residue pre-calculated
 */
router.post('/', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const { crop, harvest_quantity_kg, location, latitude, longitude, status } = req.body;

    if (!crop || !harvest_quantity_kg || !location) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'crop, harvest_quantity_kg, and location are required',
        statusCode: 400
      });
    }

    const cropNorm = crop.toLowerCase().trim();
    const coeff = residueCoefficients[cropNorm] || 0.50;
    const residue_type = residueTypeMap[cropNorm] || `${cropNorm}_residue`;
    const residue_quantity_kg = Math.round(Number(harvest_quantity_kg) * coeff);

    // Resolve coords if not provided
    const coords = getCoords(location);
    const lat = latitude || (coords ? coords.lat : null);
    const lng = longitude || (coords ? coords.lng : null);

    const listing = await db.farmerListings.create({
      farmer_id: req.user.id,
      crop: cropNorm,
      residue_type,
      harvest_quantity_kg: Number(harvest_quantity_kg),
      residue_quantity_kg,
      location,
      latitude: lat,
      longitude: lng,
      status: status || 'available'
    });

    return res.status(201).json({
      message: 'Listing created successfully',
      listing: {
        ...listing,
        residue_coefficient: coeff,
        explanation: 'Residue estimated using crop coefficient (MVP assumption)'
      }
    });
  } catch (err) {
    console.error('Create listing error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * GET /api/listings
 * Get all listings (optionally filtered by farmer_id, status, residue_type)
 */
router.get('/', async (req, res) => {
  try {
    const { farmer_id, status, residue_type } = req.query;
    const filters = {};
    if (farmer_id) filters.farmer_id = farmer_id;
    if (status) filters.status = status;
    if (residue_type) filters.residue_type = residue_type;

    const listings = await db.farmerListings.list(filters);

    return res.status(200).json({
      listings,
      total: listings.length
    });
  } catch (err) {
    console.error('Get listings error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * GET /api/listings/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const listing = await db.farmerListings.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found', statusCode: 404 });
    }
    return res.status(200).json({ listing });
  } catch (err) {
    console.error('Get listing error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * PUT /api/listings/:id
 */
router.put('/:id', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const listing = await db.farmerListings.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found', statusCode: 404 });
    }
    if (listing.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your listing', statusCode: 403 });
    }

    const allowedFields = ['location', 'status', 'harvest_quantity_kg', 'residue_quantity_kg'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await db.farmerListings.update(req.params.id, updates);
    return res.status(200).json({ message: 'Listing updated', listing: updated });
  } catch (err) {
    console.error('Update listing error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * DELETE /api/listings/:id
 */
router.delete('/:id', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const listing = await db.farmerListings.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found', statusCode: 404 });
    }
    if (listing.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your listing', statusCode: 403 });
    }
    await db.farmerListings.delete(req.params.id);
    return res.status(200).json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('Delete listing error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
