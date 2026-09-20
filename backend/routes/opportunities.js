const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { calculateDistance } = require('../services/geoService');
const { RATE_PER_KM, HANDLING_PERCENT } = require('../services/matchingService');

/**
 * POST /api/opportunities/analyze
 * Calculate full opportunity and persist to database
 */
router.post('/analyze', async (req, res) => {
  try {
    const {
      listing_id,
      buyer_requirement_id,
      quantity,
      buyerPricePerKg,
      buyer_price_per_kg,
      transportCost,
      transport_cost,
      handlingCostPercent,
      handling_cost_percent
    } = req.body;

    const pricePerKg = Number(buyerPricePerKg || buyer_price_per_kg || 0);
    const qty = Number(quantity || 0);
    const hPercent = Number(handlingCostPercent || handling_cost_percent || HANDLING_PERCENT);

    if (qty <= 0 || pricePerKg <= 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'quantity and price must be positive numbers',
        statusCode: 400
      });
    }

    // Respect explicitly passed transport cost or compute from distance
    let distance_km = 0;
    let resolvedTransportCost = (req.body.transportCost !== undefined || req.body.transport_cost !== undefined)
      ? Number(transportCost !== undefined ? transportCost : transport_cost)
      : null;

    if (listing_id && buyer_requirement_id) {
      const listing = await db.farmerListings.findById(listing_id);
      const requirement = await db.buyerRequirements.findById(buyer_requirement_id);

      if (listing && requirement) {
        const dist = calculateDistance(listing.location, requirement.location);
        distance_km = dist !== null ? dist : 100;
        if (resolvedTransportCost === null) {
          resolvedTransportCost = Math.round(distance_km * RATE_PER_KM * 100) / 100;
        }
      }
    }

    if (resolvedTransportCost === null) {
      resolvedTransportCost = 0;
    }

    const gross_value = Math.round(qty * pricePerKg * 100) / 100;
    const handling_cost = Math.round(gross_value * hPercent / 100 * 100) / 100;
    const net_value = Math.round((gross_value - resolvedTransportCost - handling_cost) * 100) / 100;

    // Persist to database if listing and requirement IDs are provided
    let savedOpportunity = null;
    if (listing_id && buyer_requirement_id) {
      savedOpportunity = await db.opportunities.create({
        listing_id,
        buyer_requirement_id,
        distance_km,
        transport_cost: resolvedTransportCost,
        handling_cost,
        gross_value,
        net_value
      });
    }

    const netFormatted = net_value.toLocaleString('en-IN');

    return res.status(200).json({
      id: savedOpportunity ? savedOpportunity.id : null,
      quantity: qty,
      quantityUnit: 'kg',
      buyerPrice: pricePerKg,
      buyerPriceUnit: '₹/kg',
      grossValue: gross_value,
      grossValueUnit: '₹',
      transportCost: resolvedTransportCost,
      transportCostUnit: '₹',
      handlingCost: handling_cost,
      handlingCostUnit: '₹',
      handlingCostPercent: hPercent,
      netValue: net_value,
      netValueUnit: '₹',
      distanceKm: distance_km,
      calculation: {
        step1_gross: gross_value,
        step2_minus_transport: `${gross_value} - ${resolvedTransportCost} = ${gross_value - resolvedTransportCost}`,
        step3_minus_handling: `${gross_value - resolvedTransportCost} - ${handling_cost} = ${net_value}`
      },
      summary: `Farmer receives ₹${netFormatted} after all costs (₹${pricePerKg} × ${qty} kg - ₹${resolvedTransportCost} transport - ₹${handling_cost} handling)`,
      persisted: !!savedOpportunity
    });
  } catch (err) {
    console.error('Opportunity analyze error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * GET /api/opportunities
 * List opportunities with optional filters: listing_id, buyer_requirement_id, farmer_id, buyer_id
 */
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.listing_id) filters.listing_id = req.query.listing_id;
    if (req.query.buyer_requirement_id) filters.buyer_requirement_id = req.query.buyer_requirement_id;

    let opportunities = await db.opportunities.list(filters);

    // Filter by farmer_id or buyer_id if requested
    if (req.query.farmer_id) {
      opportunities = opportunities.filter(o =>
        o.listing && o.listing.farmer_id === req.query.farmer_id
      );
    }
    if (req.query.buyer_id) {
      opportunities = opportunities.filter(o =>
        o.requirement && o.requirement.buyer_id === req.query.buyer_id
      );
    }

    return res.status(200).json({ opportunities, total: opportunities.length });
  } catch (err) {
    console.error('Get opportunities error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * GET /api/opportunities/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await db.opportunities.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found', statusCode: 404 });
    }
    return res.status(200).json({ opportunity });
  } catch (err) {
    console.error('Get opportunity error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
