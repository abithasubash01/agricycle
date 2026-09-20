# AGRICYCLE — AI-Powered Crop Residue Resource Platform

**AGRICYCLE** is a full-stack platform that transforms agricultural waste into high-value bio-economy resources. It connects farmers with industrial buyers, prevents stubble burning, and maximizes farm income through AI-driven residue estimation, automated buyer matching, and transparent net-value calculations.

---

## 🏗️ Architecture Overview

```
agricycle/
├── frontend/                     ← React 18 + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── api/index.js          ← Centralized Axios API client (JWT-attached)
│   │   ├── context/AuthContext   ← Real authentication state & session persistence
│   │   ├── components/
│   │   │   ├── pages/
│   │   │   │   ├── LandingPage.jsx     ← Clean marketing landing page
│   │   │   │   ├── AuthPage.jsx        ← Register & Login (Role-based)
│   │   │   │   ├── FarmerDashboard.jsx ← Real estimation, listing CRUD, live matches
│   │   │   │   └── BuyerDashboard.jsx  ← Buyer requirements CRUD, live farmer listings
│   │   │   └── Navigation.jsx          ← Dynamic user menu, badges & session logout
├── backend/                      ← Node.js + Express REST API
│   ├── db/                       ← Dual-mode persistence (Supabase PostgreSQL + Local JSON)
│   ├── middleware/auth.js        ← JWT authentication & role-based access control
│   ├── routes/
│   │   ├── auth.js               ← Register, Login, Me (/api/auth)
│   │   ├── residue.js            ← Residue estimation (/api/residue)
│   │   ├── listings.js           ← Farmer listings CRUD (/api/listings)
│   │   ├── buyers.js             ← Buyer requirements & matching (/api/buyers)
│   │   ├── transport.js          ← Haversine route & cost (/api/transport)
│   │   └── opportunities.js      ← Net-value analytics & history (/api/opportunities)
│   ├── services/
│   │   ├── geoService.js         ← Indian agricultural hubs coordinate lookup + Haversine
│   │   └── matchingService.js    ← Multi-factor scoring (compatibility, distance, price, quantity)
│   ├── schema.sql                ← PostgreSQL database schema with indexes
│   ├── server.js                 ← Express app entry point
│   └── test/integration.test.js  ← 18-step end-to-end integration test suite
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+ (tested on Node v20+)
- npm

### 1. Start the Backend
```bash
cd backend
npm install
npm start
```
The backend starts on `http://localhost:5000`. By default, it operates in **local persistent JSON mode** with pre-seeded users and listings, or automatically switches to Supabase PostgreSQL when credentials are provided in `backend/.env`.

### 2. Run Integration Tests
```bash
cd backend
npm test
```
Executes all 18 automated integration tests verifying authentication, listings, buyer requirements, matching logic, transport formulas, and opportunity persistence.

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Credentials (Pre-seeded)

| Role | Email | Password | Pre-loaded Data |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@agricycle.org` | `Farmer@123` | Rice & Wheat crop listings in Cuddalore |
| **Buyer** | `buyer@agricycle.org` | `Buyer@123` | Active Biomass & Paper requirements in Chennai |

*You can also register any new Farmer or Buyer account instantly from the Auth page.*

---

## ⚙️ Connecting Hosted Supabase (Optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the contents of [`backend/schema.sql`](backend/schema.sql).
3. Copy your project URL and service role key into `backend/.env`:
   ```ini
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   JWT_SECRET=your-secure-jwt-secret
   ```
4. Restart the backend server. The database layer automatically detects the credentials and runs against your cloud PostgreSQL database.

---

## 🌟 Key Features

1. **Scientific Residue Estimation:** Computes residue tonnage from crop harvest weights using standardized agricultural coefficients.
2. **Intelligent Buyer Matching:** Multi-factor scoring combines residue type compatibility, distance penalty, required volume fulfillment, and buyer price.
3. **Geospatial Logistics Calculator:** Uses the Haversine formula with a 1.3× road curvature correction factor to calculate accurate highway distances between agricultural clusters and industrial hubs.
4. **Complete Financial Breakdown:** Computes gross crop residue value, transportation logistics, handling overheads, and true farmer net take-home earnings.
5. **Full Database Persistence:** Every listing, requirement, and opportunity is saved, retrievable across reloads, and associated with authenticated user profiles.
