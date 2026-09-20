# AGRICYCLE Backend API

The backend for **AGRICYCLE** — an AI-powered agricultural crop-residue-to-resource platform designed for farmers to calculate residue output, connect with verified industrial buyers, estimate transportation logistics, and maximize net earnings.

---

## Quick Start

```bash
cd backend
npm install
npm start
```
The server will start at: `http://localhost:5000`

For local development with auto-reload:
```bash
npm run dev
```

To run the automated test suite:
```bash
npm test
```

---

## API Base URL
```
http://localhost:5000
```
> **CORS is enabled** across all routes so your frontend (e.g. Next.js, Vite, React on ports 3000, 5173, etc.) can make requests without cross-origin issues.

---

## API Endpoints & Contracts

### 1. Health Check
Check backend operational status.

- **Method:** `GET`
- **URL:** `/api/health`

#### Success Response (200 OK):
```json
{
  "status": "ok",
  "message": "AGRICYCLE backend running"
}
```

#### Curl:
```bash
curl http://localhost:5000/api/health
```

#### Frontend JavaScript:
```javascript
const response = await fetch('http://localhost:5000/api/health');
const data = await response.json();
console.log(data.status); // "ok"
```

---

### 2. Residue Estimation
Accepts crop information and calculates the estimated residue quantity based on crop coefficients.

- **Method:** `POST`
- **URL:** `/api/residue/calculate`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "cropType": "rice",
  "cultivatedArea": 2,
  "estimatedHarvestQuantity": 5000
}
```

#### Success Response (200 OK):
```json
{
  "cropType": "rice",
  "cultivatedArea": 2,
  "harvestQuantity": 5000,
  "estimatedResidueQuantity": 3500,
  "residueCoefficient": 0.7,
  "unit": "kg",
  "explanation": "Estimated residue based on crop type (MVP assumption, not scientifically universal)"
}
```

#### Error Response (400 Bad Request):
```json
{
  "error": "Invalid crop type",
  "validTypes": ["rice", "wheat", "sugarcane", "corn", "other"],
  "statusCode": 400
}
```

#### Curl:
```bash
curl -X POST http://localhost:5000/api/residue/calculate \
  -H "Content-Type: application/json" \
  -d '{"cropType":"rice","cultivatedArea":2,"estimatedHarvestQuantity":5000}'
```

#### Frontend JavaScript:
```javascript
const response = await fetch('http://localhost:5000/api/residue/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cropType: 'rice',
    cultivatedArea: 2,
    estimatedHarvestQuantity: 5000
  })
});
const data = await response.json();
console.log(`Estimated residue: ${data.estimatedResidueQuantity} kg`);
```

---

### 3. Buyer Matching
Finds suitable industrial buyers based on residue type, quantity, quality, and farmer location.

- **Method:** `POST`
- **URL:** `/api/buyers/match`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "residueType": "rice_straw",
  "quantity": 3000,
  "quality": "good",
  "farmerLocation": "Cuddalore"
}
```

#### Success Response (200 OK):
```json
{
  "matches": [
    {
      "buyerId": "buyer_001",
      "buyerName": "Eco Fuels Ltd",
      "buyerLocation": "Chennai",
      "requiredQuantity": 2000,
      "offeredPrice": 3,
      "priceUnit": "₹/kg",
      "buyerType": "biomass_fuel",
      "distance": 150,
      "distanceUnit": "km",
      "matchReason": "Matches residue type and quantity; reasonable distance"
    },
    {
      "buyerId": "buyer_002",
      "buyerName": "Green Compost Co",
      "buyerLocation": "Villupuram",
      "requiredQuantity": 5000,
      "offeredPrice": 2.5,
      "priceUnit": "₹/kg",
      "buyerType": "compost",
      "distance": 50,
      "distanceUnit": "km",
      "matchReason": "Closest buyer; good quantity match"
    }
  ],
  "totalMatches": 2
}
```

#### Error Response (400 Bad Request):
```json
{
  "error": "Invalid residue type",
  "statusCode": 400
}
```

#### Error Response (404 Not Found):
```json
{
  "error": "No buyers found matching your criteria",
  "statusCode": 404
}
```

#### Curl:
```bash
curl -X POST http://localhost:5000/api/buyers/match \
  -H "Content-Type: application/json" \
  -d '{"residueType":"rice_straw","quantity":3000,"quality":"good","farmerLocation":"Cuddalore"}'
```

#### Frontend JavaScript:
```javascript
const response = await fetch('http://localhost:5000/api/buyers/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    residueType: 'rice_straw',
    quantity: 3000,
    quality: 'good',
    farmerLocation: 'Cuddalore'
  })
});
const data = await response.json();
if (response.ok) {
  data.matches.forEach(buyer => {
    console.log(`${buyer.buyerName}: ₹${buyer.offeredPrice}/kg (${buyer.distance} km)`);
  });
}
```

---

### 4. Transportation Cost Calculation
Calculates transportation logistics cost based on route distance and cargo rate.

- **Method:** `POST`
- **URL:** `/api/transport/calculate`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "fromLocation": "Cuddalore",
  "toLocation": "Chennai",
  "quantity": 3000
}
```

#### Success Response (200 OK):
```json
{
  "fromLocation": "Cuddalore",
  "toLocation": "Chennai",
  "distance": 150,
  "distanceUnit": "km",
  "quantity": 3000,
  "quantityUnit": "kg",
  "ratePerKm": 2.5,
  "ratePerKmUnit": "₹/km",
  "totalTransportCost": 375,
  "costUnit": "₹",
  "note": "Cost calculated as: distance × ratePerKm. These are MVP estimates and may vary with actual logistics."
}
```

#### Error Response (400 Bad Request):
```json
{
  "error": "Unknown location",
  "message": "fromLocation or toLocation not recognized",
  "statusCode": 400
}
```

#### Curl:
```bash
curl -X POST http://localhost:5000/api/transport/calculate \
  -H "Content-Type: application/json" \
  -d '{"fromLocation":"Cuddalore","toLocation":"Chennai","quantity":3000}'
```

#### Frontend JavaScript:
```javascript
const response = await fetch('http://localhost:5000/api/transport/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fromLocation: 'Cuddalore',
    toLocation: 'Chennai',
    quantity: 3000
  })
});
const data = await response.json();
console.log(`Transport cost: ₹${data.totalTransportCost}`);
```

---

### 5. Net Value Analysis
Performs complete financial analysis showing gross revenue, transport deductions, handling fees, and net farmer income.

- **Method:** `POST`
- **URL:** `/api/opportunities/analyze`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "quantity": 3000,
  "buyerPricePerKg": 3,
  "transportCost": 375,
  "handlingCostPercent": 5
}
```

#### Success Response (200 OK):
```json
{
  "quantity": 3000,
  "quantityUnit": "kg",
  "buyerPrice": 3,
  "buyerPriceUnit": "₹/kg",
  "grossValue": 9000,
  "grossValueUnit": "₹",
  "transportCost": 375,
  "transportCostUnit": "₹",
  "handlingCost": 450,
  "handlingCostUnit": "₹",
  "handlingCostPercent": 5,
  "netValue": 8175,
  "netValueUnit": "₹",
  "calculation": {
    "step1_gross": 9000,
    "step2_minus_transport": "9000 - 375 = 8625",
    "step3_minus_handling": "8625 - 450 = 8175"
  },
  "summary": "Farmer receives ₹8,175 after all costs (₹3 × 3000 kg - ₹375 transport - ₹450 handling)"
}
```

#### Error Response (400 Bad Request):
```json
{
  "error": "Invalid input",
  "message": "Quantity and prices must be positive numbers",
  "statusCode": 400
}
```

#### Curl:
```bash
curl -X POST http://localhost:5000/api/opportunities/analyze \
  -H "Content-Type: application/json" \
  -d '{"quantity":3000,"buyerPricePerKg":3,"transportCost":375,"handlingCostPercent":5}'
```

#### Frontend JavaScript:
```javascript
const response = await fetch('http://localhost:5000/api/opportunities/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quantity: 3000,
    buyerPricePerKg: 3,
    transportCost: 375,
    handlingCostPercent: 5
  })
});
const data = await response.json();
console.log(`Net value: ₹${data.netValue}`);
console.log(`Summary: ${data.summary}`);
```

---

### 6. Get Demo Buyers
List all registered demo buyers.

- **Method:** `GET`
- **URL:** `/api/buyers`

#### Success Response (200 OK):
```json
{
  "buyers": [
    {
      "buyerId": "buyer_001",
      "name": "Eco Fuels Ltd",
      "location": "Chennai",
      "residueType": "rice_straw",
      "requiredQuantity": 2000,
      "offeredPrice": 3,
      "priceUnit": "₹/kg",
      "type": "biomass_fuel"
    },
    {
      "buyerId": "buyer_002",
      "name": "Green Compost Co",
      "location": "Villupuram",
      "residueType": "rice_straw",
      "requiredQuantity": 5000,
      "offeredPrice": 2.5,
      "priceUnit": "₹/kg",
      "type": "compost"
    },
    {
      "buyerId": "buyer_003",
      "name": "Bio Energy Systems",
      "location": "Chennai",
      "residueType": "sugarcane_bagasse",
      "requiredQuantity": 1000,
      "offeredPrice": 4,
      "priceUnit": "₹/kg",
      "type": "biogas"
    }
  ],
  "totalBuyers": 3
}
```

#### Curl:
```bash
curl http://localhost:5000/api/buyers
```

#### Frontend JavaScript:
```javascript
const response = await fetch('http://localhost:5000/api/buyers');
const data = await response.json();
data.buyers.forEach(buyer => {
  console.log(`${buyer.name} at ${buyer.location}`);
});
```

---

## Configuration & MVP Assumptions

All mock data, coefficients, and logistical rates are centralized in [`config.js`](file:///c:/Users/Abitha/OneDrive/Desktop/agricycle/backend/config.js):

- **Residue Coefficients:**
  - `rice`: `0.70` (70% of harvest quantity)
  - `wheat`: `0.65` (65% of harvest quantity)
  - `sugarcane`: `0.25` (25% of harvest quantity)
  - `corn`: `0.50` (50% of harvest quantity)
  - `other`: `0.50` (50% of harvest quantity)
- **Distance Matrix:**
  - `Cuddalore <-> Chennai`: 150 km
  - `Cuddalore <-> Villupuram`: 50 km
  - `Chennai <-> Villupuram`: 100 km
  - `Chennai <-> Kanchipuram`: 80 km
  - `Villupuram <-> Kanchipuram`: 60 km
- **Transport Rate:** ₹2.5 / km
- **Default Handling Cost:** 5% of gross value

---

## Common Error Status Codes

| Code | Meaning | Description |
|---|---|---|
| `400` | Bad Request | Missing required body fields or invalid parameter types |
| `404` | Not Found | Route does not exist or no matching buyers found |
| `500` | Server Error | Unhandled backend exception |
