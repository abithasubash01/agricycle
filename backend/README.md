# AGRICYCLE Backend API Documentation

Full-stack Node.js + Express REST API with JWT authentication, dynamic buyer matching, Haversine geospatial calculations, and dual-mode persistence (Supabase PostgreSQL + local persistent JSON store).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```ini
PORT=5000
JWT_SECRET=agricycle_secret_key_change_in_production_2026
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```
- If `SUPABASE_URL` is omitted or empty, the backend runs in **persistent local mode** automatically (`backend/data/agricycle_data.json`), requiring no external setup.
- If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided, the backend connects directly to your hosted PostgreSQL database on Supabase.

### 3. Run the Backend Server
```bash
npm start
# or for development auto-restart:
npm run dev
```

### 4. Run Integration Test Suite
```bash
npm test
```
Runs 18 automated end-to-end integration tests validating:
- Authentication & JWT issuance
- Farmer listing creation & residue calculation
- Buyer requirement creation & listing queries
- Multi-factor buyer-farmer matching
- Distance calculation & road curvature transport costs
- Financial opportunity profit calculations
- Database persistence & retrieval

---

## 🗄️ Database Architecture

### SQL Schema (`schema.sql`)
Run `schema.sql` in your Supabase SQL Editor to create tables with indexes and foreign keys:

1. **`users`**
   - `id` UUID PRIMARY KEY
   - `name` VARCHAR NOT NULL
   - `email` VARCHAR UNIQUE NOT NULL
   - `password_hash` VARCHAR NOT NULL
   - `role` VARCHAR ('farmer' | 'buyer' | 'both') NOT NULL
   - `phone` VARCHAR
   - `location` VARCHAR
   - `created_at` TIMESTAMPTZ

2. **`farmer_listings`**
   - `id` UUID PRIMARY KEY
   - `farmer_id` UUID REFERENCES users(id)
   - `crop` VARCHAR NOT NULL
   - `residue_type` VARCHAR NOT NULL
   - `harvest_quantity_kg` NUMERIC NOT NULL
   - `residue_quantity_kg` NUMERIC NOT NULL
   - `location` VARCHAR NOT NULL
   - `latitude` NUMERIC
   - `longitude` NUMERIC
   - `status` VARCHAR ('available' | 'reserved' | 'completed')
   - `created_at` TIMESTAMPTZ

3. **`buyer_requirements`**
   - `id` UUID PRIMARY KEY
   - `buyer_id` UUID REFERENCES users(id)
   - `residue_type` VARCHAR NOT NULL
   - `required_quantity_kg` NUMERIC NOT NULL
   - `price_per_kg` NUMERIC NOT NULL
   - `use_type` VARCHAR NOT NULL
   - `location` VARCHAR NOT NULL
   - `status` VARCHAR ('active' | 'fulfilled')
   - `created_at` TIMESTAMPTZ

4. **`opportunities`**
   - `id` UUID PRIMARY KEY
   - `listing_id` UUID REFERENCES farmer_listings(id)
   - `buyer_requirement_id` UUID REFERENCES buyer_requirements(id)
   - `distance_km` NUMERIC NOT NULL
   - `transport_cost` NUMERIC NOT NULL
   - `handling_cost` NUMERIC NOT NULL
   - `gross_value` NUMERIC NOT NULL
   - `net_value` NUMERIC NOT NULL
   - `status` VARCHAR ('matched' | 'accepted' | 'completed')
   - `created_at` TIMESTAMPTZ

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register new user (Farmer / Buyer). Returns user object + JWT token.
- `POST /api/auth/login` — Sign in with email and password. Returns JWT token.
- `GET /api/auth/me` — Return currently authenticated user profile (requires `Authorization: Bearer <token>`).

### Residue Estimation
- `POST /api/residue/estimate` — Calculate crop residue from harvest weight.
  - Body: `{ "cropType": "Rice", "harvestQuantity": 5000, "quantityUnit": "kg" }`
  - Formula: Harvest weight × residue coefficient (Rice Straw: 0.70, Wheat Straw: 0.80, Sugarcane Bagasse: 0.30, Corn Stover: 1.00, Cotton Stalk: 1.20).

### Farmer Listings
- `GET /api/listings` — List all available farmer listings (supports `?farmer_id=...` & `?residue_type=...`).
- `GET /api/listings/:id` — Get listing details.
- `POST /api/listings` — Create new listing (Auto-calculates `residue_quantity_kg` if omitted). Authenticated.
- `DELETE /api/listings/:id` — Delete listing (Authenticated, owner only).

### Buyer Requirements & Matching
- `GET /api/buyers/requirements` — List active buyer requirements (supports `?buyer_id=...`).
- `POST /api/buyers/requirements` — Create new requirement. Authenticated.
- `POST /api/buyers/match` — Match farmer listing or parameters against active buyer requirements.
  - Calculates compatibility, distance, transport cost, handling cost, and multi-factor match score.
- `GET /api/buyers/requirements/:id/matches` — Find matching farmer listings for a buyer requirement.

### Transportation
- `POST /api/transport/calculate` — Haversine distance with 1.3× Indian road factor & transport cost at ₹2.5/km.
  - Body: `{ "fromLocation": "Cuddalore", "toLocation": "Chennai", "quantity": 3000 }`

### Financial Opportunities
- `POST /api/opportunities/analyze` — Compute gross revenue, transport cost, handling fee, and farmer net earnings; persists result to database.
- `GET /api/opportunities` — List opportunities (supports `?farmer_id=...` & `?buyer_id=...`).
- `GET /api/opportunities/:id` — Fetch opportunity by ID.
