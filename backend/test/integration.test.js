const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

let server;
let baseUrl;

// Shared state across the full 17-step test
let farmerToken, farmerUser;
let buyerToken, buyerUser;
let listing, requirement, opportunity;

describe('AGRICYCLE Full-Stack Integration Test Suite (17-step scenario)', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  // ─── Health ─────────────────────────────────────────────────────────────────
  test('0. Health check returns ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.ok(data.dbMode);
  });

  // ─── Step 1: Register Farmer ─────────────────────────────────────────────────
  test('1. Register Farmer', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Farmer',
        email: `farmer_${Date.now()}@test.com`,
        password: 'test123',
        role: 'farmer',
        location: 'Cuddalore',
        phone: '+91 90000 00001'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.user.role, 'farmer');
    assert.equal(data.user.location, 'Cuddalore');
    farmerToken = data.token;
    farmerUser = data.user;
  });

  // ─── Step 2: Login as Farmer ─────────────────────────────────────────────────
  test('2. Login as Farmer', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: farmerUser.email, password: 'test123' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.user.id, farmerUser.id);
    farmerToken = data.token;
  });

  // ─── Step 3: Create Rice listing (harvest = 5000 kg, Cuddalore) ───────────────
  test('3. Create Rice listing → backend calculates residue → saved to DB', async () => {
    const res = await fetch(`${baseUrl}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        crop: 'rice',
        harvest_quantity_kg: 5000,
        location: 'Cuddalore'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.listing.crop, 'rice');
    assert.equal(data.listing.harvest_quantity_kg, 5000);
    assert.equal(data.listing.residue_quantity_kg, 3500);     // 5000 × 0.70
    assert.equal(data.listing.residue_type, 'rice_straw');
    assert.equal(data.listing.location, 'Cuddalore');
    assert.equal(data.listing.farmer_id, farmerUser.id);
    assert.ok(data.listing.id);
    listing = data.listing;
  });

  // ─── Step 4: GET /api/listings confirms persistence ───────────────────────────
  test('4. Listing persists — GET /api/listings returns new listing', async () => {
    const res = await fetch(`${baseUrl}/api/listings?farmer_id=${farmerUser.id}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.listings.some(l => l.id === listing.id));
  });

  // ─── Step 5: Register Buyer ───────────────────────────────────────────────────
  test('5. Register Buyer', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Buyer',
        email: `buyer_${Date.now()}@test.com`,
        password: 'buyer123',
        role: 'buyer',
        location: 'Chennai',
        phone: '+91 90000 00002'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.user.role, 'buyer');
    buyerToken = data.token;
    buyerUser = data.user;
  });

  // ─── Step 6: Login as Buyer ───────────────────────────────────────────────────
  test('6. Login as Buyer', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: buyerUser.email, password: 'buyer123' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    buyerToken = data.token;
  });

  // ─── Step 7: Buyer creates requirement ───────────────────────────────────────
  test('7. Buyer creates requirement — Rice Straw, 3000 kg, ₹3/kg, Biomass Fuel, Chennai', async () => {
    const res = await fetch(`${baseUrl}/api/buyers/requirements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        residue_type: 'rice_straw',
        required_quantity_kg: 3000,
        use_type: 'Biomass Fuel',
        price_per_kg: 3,
        location: 'Chennai'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.requirement.residue_type, 'rice_straw');
    assert.equal(data.requirement.price_per_kg, 3);
    assert.equal(data.requirement.location, 'Chennai');
    assert.equal(data.requirement.buyer_id, buyerUser.id);
    requirement = data.requirement;
  });

  // ─── Step 8: Backend finds matching listing ───────────────────────────────────
  test('8. Backend matches listing with buyer requirement', async () => {
    const res = await fetch(`${baseUrl}/api/buyers/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing_id: listing.id,
        residue_type: 'rice_straw',
        quantity: 3500,
        farmerLocation: 'Cuddalore'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.matches.length > 0);
    const match = data.matches[0];
    assert.ok(match.requirementId === requirement.id);
    assert.equal(match.buyerId, buyerUser.id);
    assert.ok(match.distance > 0);             // Real distance calculated
    assert.ok(match.transportCost > 0);
    assert.ok(match.grossValue > 0);
    assert.ok(typeof match.netValue === 'number');
  });

  // ─── Step 9: Distance calculation Cuddalore → Chennai ────────────────────────
  test('9. Transport calculation — Cuddalore to Chennai uses Haversine distance', async () => {
    const res = await fetch(`${baseUrl}/api/transport/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromLocation: 'Cuddalore', toLocation: 'Chennai', quantity: 3000 })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.distance > 0);
    assert.ok(data.totalTransportCost > 0);
    // Cuddalore → Chennai real road distance should be in range 100-250 km
    assert.ok(data.distance > 50 && data.distance < 400, `Distance ${data.distance}km unexpected`);
  });

  // ─── Step 10: Analyze opportunity → store to DB ───────────────────────────────
  test('10. Analyze & store opportunity with correct math', async () => {
    // Get the distance first
    const transportRes = await fetch(`${baseUrl}/api/transport/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromLocation: 'Cuddalore', toLocation: 'Chennai', quantity: 3000 })
    });
    const tData = await transportRes.json();
    const transportCost = tData.totalTransportCost;
    const quantity = Math.min(3500, 3000); // min of listing and requirement
    const pricePerKg = 3;

    const res = await fetch(`${baseUrl}/api/opportunities/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing_id: listing.id,
        buyer_requirement_id: requirement.id,
        quantity,
        buyerPricePerKg: pricePerKg,
        transportCost,
        handlingCostPercent: 5
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();

    // Verify correct math
    const expectedGross = quantity * pricePerKg;                           // 9000
    const expectedHandling = Math.round(expectedGross * 0.05 * 100) / 100; // 450
    const expectedNet = Math.round((expectedGross - transportCost - expectedHandling) * 100) / 100;

    assert.equal(data.grossValue, expectedGross);
    assert.equal(data.handlingCost, expectedHandling);
    assert.equal(data.netValue, expectedNet);
    assert.equal(data.persisted, true);
    assert.ok(data.id);
    opportunity = data;
  });

  // ─── Step 11: Opportunity survives page refresh (DB fetch) ────────────────────
  test('11. Opportunity survives page refresh — GET /api/opportunities', async () => {
    const res = await fetch(`${baseUrl}/api/opportunities?farmer_id=${farmerUser.id}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.opportunities.length > 0);
    const found = data.opportunities.find(o => o.id === opportunity.id);
    assert.ok(found, 'Opportunity not found after page refresh');
  });

  // ─── Step 12: Buyer sees farmer listing ───────────────────────────────────────
  test('12. Buyer sees farmer listing via GET /api/listings', async () => {
    const res = await fetch(`${baseUrl}/api/listings`);
    assert.equal(res.status, 200);
    const data = await res.json();
    const found = data.listings.find(l => l.id === listing.id);
    assert.ok(found, 'Farmer listing not visible to buyer');
  });

  // ─── Step 13: Farmer can see opportunity ─────────────────────────────────────
  test('13. Farmer dashboard opportunity retrieval', async () => {
    const res = await fetch(`${baseUrl}/api/opportunities?farmer_id=${farmerUser.id}`);
    const data = await res.json();
    assert.ok(data.total > 0);
    const opp = data.opportunities.find(o => o.id === opportunity.id);
    assert.ok(opp);
    assert.ok(opp.listing);
    assert.equal(opp.listing.id, listing.id);
  });

  // ─── Step 14: Buyer opportunities ─────────────────────────────────────────────
  test('14. Buyer can see their matched opportunity', async () => {
    const res = await fetch(`${baseUrl}/api/opportunities?buyer_id=${buyerUser.id}`);
    const data = await res.json();
    assert.ok(data.total > 0);
  });

  // ─── Step 15: Residue calculation edge cases ──────────────────────────────────
  test('15. Residue calculation — invalid crop type returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/residue/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop: 'unicorn_grass', harvest_quantity_kg: 5000 })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.validTypes);
  });

  // ─── Step 16: Auth token is verified ─────────────────────────────────────────
  test('16. Protected route rejects unauthenticated request', async () => {
    const res = await fetch(`${baseUrl}/api/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop: 'rice', harvest_quantity_kg: 1000, location: 'Chennai' })
    });
    assert.equal(res.status, 401);
  });

  // ─── Step 17: Data in DB — GET buyer requirements ─────────────────────────────
  test('17. Buyer requirement persists — GET /api/buyers/requirements', async () => {
    const res = await fetch(`${baseUrl}/api/buyers/requirements?buyer_id=${buyerUser.id}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    const found = data.requirements.find(r => r.id === requirement.id);
    assert.ok(found, 'Buyer requirement not found in DB');
    assert.equal(found.price_per_kg, 3);
    assert.equal(found.location, 'Chennai');
  });
});
