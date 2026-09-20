const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCoords } = require('../services/geoService');
const { matchListingWithRequirements } = require('../services/matchingService');

/**
 * POST /api/buyers/requirements
 */
router.post('/requirements', authenticateToken, requireRole('buyer'), async (req, res) => {
  try {
    const { residue_type, required_quantity_kg, use_type, price_per_kg, location, latitude, longitude } = req.body;

    if (!residue_type || !required_quantity_kg || !use_type || !price_per_kg || !location) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'residue_type, required_quantity_kg, use_type, price_per_kg, and location are required',
        statusCode: 400
      });
    }

    if (Number(price_per_kg) <= 0 || Number(required_quantity_kg) <= 0) {
      return res.status(400).json({
        error: 'Invalid values',
        message: 'price_per_kg and required_quantity_kg must be positive numbers',
        statusCode: 400
      });
    }

    const coords = getCoords(location);
    const lat = latitude || (coords ? coords.lat : null);
    const lng = longitude || (coords ? coords.lng : null);

    const requirement = await db.buyerRequirements.create({
      buyer_id: req.user.id,
      residue_type: residue_type.toLowerCase().trim(),
      required_quantity_kg: Number(required_quantity_kg),
      use_type,
      price_per_kg: Number(price_per_kg),
      location,
      latitude: lat,
      longitude: lng,
      status: 'active'
    });

    return res.status(201).json({
      message: 'Requirement created successfully',
      requirement
    });
  } catch (err) {
    console.error('Create requirement error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * GET /api/buyers/requirements
 */
router.get('/requirements', async (req, res) => {
  try {
    const { buyer_id, status, residue_type } = req.query;
    const filters = {};
    if (buyer_id) filters.buyer_id = buyer_id;
    if (status) filters.status = status;
    if (residue_type) filters.residue_type = residue_type;

    const requirements = await db.buyerRequirements.list(filters);
    return res.status(200).json({ requirements, total: requirements.length });
  } catch (err) {
    console.error('Get requirements error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * GET /api/buyers/requirements/:id
 */
router.get('/requirements/:id', async (req, res) => {
  try {
    const requirement = await db.buyerRequirements.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ error: 'Requirement not found', statusCode: 404 });
    }
    return res.status(200).json({ requirement });
  } catch (err) {
    console.error('Get requirement error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * PUT /api/buyers/requirements/:id
 */
router.put('/requirements/:id', authenticateToken, requireRole('buyer'), async (req, res) => {
  try {
    const req_record = await db.buyerRequirements.findById(req.params.id);
    if (!req_record) {
      return res.status(404).json({ error: 'Requirement not found', statusCode: 404 });
    }
    if (req_record.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your requirement', statusCode: 403 });
    }

    const allowedFields = ['required_quantity_kg', 'price_per_kg', 'use_type', 'location', 'status'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await db.buyerRequirements.update(req.params.id, updates);
    return res.status(200).json({ message: 'Requirement updated', requirement: updated });
  } catch (err) {
    console.error('Update requirement error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * DELETE /api/buyers/requirements/:id
 */
router.delete('/requirements/:id', authenticateToken, requireRole('buyer'), async (req, res) => {
  try {
    const req_record = await db.buyerRequirements.findById(req.params.id);
    if (!req_record) {
      return res.status(404).json({ error: 'Requirement not found', statusCode: 404 });
    }
    if (req_record.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your requirement', statusCode: 403 });
    }
    await db.buyerRequirements.delete(req.params.id);
    return res.status(200).json({ message: 'Requirement deleted' });
  } catch (err) {
    console.error('Delete requirement error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * POST /api/buyers/match
 * Match a farmer listing against real buyer requirements from the database
 */
router.post('/match', async (req, res) => {
  try {
    const { listing_id, residue_type, quantity, farmerLocation, farmer_location } = req.body;
    const location = farmerLocation || farmer_location;

    // Load all active requirements from real DB
    const requirements = await db.buyerRequirements.list({ status: 'active' });

    if (requirements.length === 0) {
      return res.status(404).json({
        error: 'No active buyer requirements found',
        message: 'No buyers have posted requirements yet. Showing demo matches is disabled.',
        statusCode: 404,
        matches: [],
        totalMatches: 0
      });
    }

    // Build a virtual listing for matching
    let listing;
    if (listing_id) {
      listing = await db.farmerListings.findById(listing_id);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found', statusCode: 404 });
      }
    } else {
      // Ad-hoc match from form input
      listing = {
        id: null,
        residue_type: residue_type || 'rice_straw',
        residue_quantity_kg: quantity || 0,
        location: location || 'unknown',
        status: 'available'
      };
    }

    const matches = matchListingWithRequirements(listing, requirements);

    if (matches.length === 0) {
      return res.status(404).json({
        error: 'No matching buyers found',
        message: 'No buyers currently require this type of residue',
        statusCode: 404,
        matches: [],
        totalMatches: 0
      });
    }

    return res.status(200).json({
      matches: matches.map(m => ({
        requirementId: m.requirement.id,
        buyerId: m.buyer_id,
        buyerName: m.buyer_name,
        buyerLocation: m.buyer_location,
        useType: m.use_type,
        offeredPrice: m.price_per_kg,
        priceUnit: '₹/kg',
        requiredQuantity: m.requirement.required_quantity_kg,
        matchedQuantity: m.quantity,
        distance: m.distance_km,
        distanceUnit: 'km',
        transportCost: m.transport_cost,
        handlingCost: m.handling_cost,
        grossValue: m.gross_value,
        netValue: m.net_value,
        matchScore: m.match_score,
        isProfitable: m.is_profitable
      })),
      totalMatches: matches.length
    });
  } catch (err) {
    console.error('Buyer match error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * GET /api/buyers
 * List all users with role=buyer
 */
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.users.list();
    const buyers = allUsers.filter(u => u.role === 'buyer').map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      location: u.location,
      phone: u.phone,
      created_at: u.created_at
    }));
    return res.status(200).json({ buyers, total: buyers.length });
  } catch (err) {
    console.error('Get buyers error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
