-- AGRICYCLE Database Schema
-- Compatible with PostgreSQL / Supabase

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'buyer')),
    phone VARCHAR(50),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmer Listings Table
CREATE TABLE IF NOT EXISTS farmer_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop VARCHAR(100) NOT NULL,
    residue_type VARCHAR(100) NOT NULL,
    harvest_quantity_kg NUMERIC(12, 2) NOT NULL,
    residue_quantity_kg NUMERIC(12, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buyer Requirements Table
CREATE TABLE IF NOT EXISTS buyer_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    residue_type VARCHAR(100) NOT NULL,
    required_quantity_kg NUMERIC(12, 2) NOT NULL,
    use_type VARCHAR(100) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES farmer_listings(id) ON DELETE CASCADE,
    buyer_requirement_id UUID NOT NULL REFERENCES buyer_requirements(id) ON DELETE CASCADE,
    distance_km NUMERIC(10, 2) NOT NULL,
    transport_cost NUMERIC(12, 2) NOT NULL,
    handling_cost NUMERIC(12, 2) NOT NULL,
    gross_value NUMERIC(12, 2) NOT NULL,
    net_value NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_farmer_listings_farmer_id ON farmer_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_listings_status ON farmer_listings(status);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_buyer_id ON buyer_requirements(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_status ON buyer_requirements(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_listing_id ON opportunities(listing_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_buyer_requirement_id ON opportunities(buyer_requirement_id);
