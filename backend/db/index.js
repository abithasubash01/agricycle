const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL } = process.env;

let supabaseClient = null;
let pgPool = null;
let dbMode = 'local';

// Initialize Supabase if credentials exist
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL.startsWith('http')) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    dbMode = 'supabase';
    console.log('✅ Database connected: Supabase Hosted PostgreSQL (' + SUPABASE_URL + ')');
  } catch (err) {
    console.warn('⚠️ Supabase client initialization failed, falling back to local persistent store:', err.message);
  }
} else if (DATABASE_URL && DATABASE_URL.startsWith('postgres')) {
  try {
    const { Pool } = require('pg');
    pgPool = new Pool({ connectionString: DATABASE_URL });
    dbMode = 'postgres';
    console.log('✅ Database connected: PostgreSQL Pool');
  } catch (err) {
    console.warn('⚠️ PostgreSQL connection failed, falling back to local persistent store:', err.message);
  }
}

const os = require('os');

// Local / Serverless Store Setup
// In serverless environments (e.g. Vercel / AWS Lambda), the deployment bundle directory is read-only.
// We resolve writable storage to os.tmpdir() when in serverless or when root directory is not writable.
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const bundledDataFilePath = path.join(__dirname, '..', 'data', 'agricycle_data.json');
const targetDataDir = isServerless ? os.tmpdir() : path.join(__dirname, '..', 'data');
const dataFilePath = isServerless ? path.join(os.tmpdir(), 'agricycle_data.json') : bundledDataFilePath;

// In-memory fallback to guarantee zero crash in read-only environments
let memoryStore = {
  users: [],
  farmer_listings: [],
  buyer_requirements: [],
  opportunities: []
};

// Pre-populate memory store from bundled seed data if available
try {
  if (fs.existsSync(bundledDataFilePath)) {
    const raw = fs.readFileSync(bundledDataFilePath, 'utf-8');
    memoryStore = JSON.parse(raw);
  }
} catch (e) {
  // Ignore pre-populate error
}

function initLocalStore() {
  try {
    if (!fs.existsSync(targetDataDir)) {
      fs.mkdirSync(targetDataDir, { recursive: true });
    }
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify(memoryStore, null, 2), 'utf-8');
    }
  } catch (err) {
    // If filesystem is read-only, silently fallback to memoryStore
  }
}

function readLocalData() {
  initLocalStore();
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    // Return memoryStore
  }
  return memoryStore;
}

function writeLocalData(data) {
  memoryStore = data;
  try {
    initLocalStore();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Maintained in memoryStore
  }
}

if (dbMode === 'local') {
  initLocalStore();
  console.log(`ℹ️ Database running in local store mode (${isServerless ? 'serverless /tmp' : 'local file'}). Set SUPABASE_URL in .env to connect to hosted Supabase.`);
}

// Unified Database API
const db = {
  getMode: () => dbMode,

  // Users
  users: {
    async findByEmail(email) {
      if (!email) return null;
      const normalizedEmail = email.toLowerCase().trim();

      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        return res.rows[0] || null;
      }

      const store = readLocalData();
      return store.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
    },

    async findById(id) {
      if (!id) return null;

      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
      }

      const store = readLocalData();
      return store.users.find(u => u.id === id) || null;
    },

    async create({ name, email, password_hash, role, phone, location }) {
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      const userRecord = {
        id,
        name,
        email: email.toLowerCase().trim(),
        password_hash,
        role,
        phone: phone || null,
        location: location || null,
        created_at
      };

      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('users')
          .insert([userRecord])
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const query = `
          INSERT INTO users (id, name, email, password_hash, role, phone, location, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `;
        const res = await pgPool.query(query, [id, name, userRecord.email, password_hash, role, phone, location, created_at]);
        return res.rows[0];
      }

      const store = readLocalData();
      store.users.push(userRecord);
      writeLocalData(store);
      return userRecord;
    },

    async list() {
      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient.from('users').select('*');
        if (error) throw error;
        return data;
      }
      if (dbMode === 'postgres') {
        const res = await pgPool.query('SELECT * FROM users');
        return res.rows;
      }
      return readLocalData().users;
    }
  },

  // Farmer Listings
  farmerListings: {
    async create({ farmer_id, crop, residue_type, harvest_quantity_kg, residue_quantity_kg, location, latitude, longitude, status = 'available' }) {
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      const listingRecord = {
        id,
        farmer_id,
        crop,
        residue_type,
        harvest_quantity_kg: Number(harvest_quantity_kg),
        residue_quantity_kg: Number(residue_quantity_kg),
        location,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        status,
        created_at
      };

      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('farmer_listings')
          .insert([listingRecord])
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const query = `
          INSERT INTO farmer_listings (id, farmer_id, crop, residue_type, harvest_quantity_kg, residue_quantity_kg, location, latitude, longitude, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `;
        const res = await pgPool.query(query, [
          id, farmer_id, crop, residue_type, listingRecord.harvest_quantity_kg, listingRecord.residue_quantity_kg, location, listingRecord.latitude, listingRecord.longitude, status, created_at
        ]);
        return res.rows[0];
      }

      const store = readLocalData();
      store.farmer_listings.push(listingRecord);
      writeLocalData(store);
      return listingRecord;
    },

    async findById(id) {
      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('farmer_listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const res = await pgPool.query('SELECT * FROM farmer_listings WHERE id = $1', [id]);
        return res.rows[0] || null;
      }

      const store = readLocalData();
      return store.farmer_listings.find(l => l.id === id) || null;
    },

    async list(filters = {}) {
      if (dbMode === 'supabase') {
        let query = supabaseClient.from('farmer_listings').select('*, users(name, phone, location)');
        if (filters.farmer_id) query = query.eq('farmer_id', filters.farmer_id);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.residue_type) query = query.ilike('residue_type', `%${filters.residue_type}%`);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        let queryStr = `
          SELECT l.*, u.name as farmer_name, u.phone as farmer_phone
          FROM farmer_listings l
          LEFT JOIN users u ON l.farmer_id = u.id
          WHERE 1=1
        `;
        const params = [];
        if (filters.farmer_id) {
          params.push(filters.farmer_id);
          queryStr += ` AND l.farmer_id = $${params.length}`;
        }
        if (filters.status) {
          params.push(filters.status);
          queryStr += ` AND l.status = $${params.length}`;
        }
        queryStr += ' ORDER BY l.created_at DESC';
        const res = await pgPool.query(queryStr, params);
        return res.rows;
      }

      const store = readLocalData();
      let results = [...store.farmer_listings];
      if (filters.farmer_id) results = results.filter(l => l.farmer_id === filters.farmer_id);
      if (filters.status) results = results.filter(l => l.status === filters.status);
      if (filters.residue_type) {
        const rLower = filters.residue_type.toLowerCase();
        results = results.filter(l => l.residue_type.toLowerCase().includes(rLower));
      }

      // Attach farmer details
      return results.map(l => {
        const farmer = store.users.find(u => u.id === l.farmer_id);
        return {
          ...l,
          farmer_name: farmer ? farmer.name : 'Unknown Farmer',
          farmer_phone: farmer ? farmer.phone : null
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async update(id, updates) {
      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('farmer_listings')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const keys = Object.keys(updates);
        if (keys.length === 0) return this.findById(id);
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = [id, ...keys.map(k => updates[k])];
        const res = await pgPool.query(`UPDATE farmer_listings SET ${setClause} WHERE id = $1 RETURNING *`, values);
        return res.rows[0];
      }

      const store = readLocalData();
      const index = store.farmer_listings.findIndex(l => l.id === id);
      if (index === -1) return null;
      store.farmer_listings[index] = { ...store.farmer_listings[index], ...updates };
      writeLocalData(store);
      return store.farmer_listings[index];
    },

    async delete(id) {
      if (dbMode === 'supabase') {
        const { error } = await supabaseClient.from('farmer_listings').delete().eq('id', id);
        if (error) throw error;
        return true;
      }

      if (dbMode === 'postgres') {
        await pgPool.query('DELETE FROM farmer_listings WHERE id = $1', [id]);
        return true;
      }

      const store = readLocalData();
      store.farmer_listings = store.farmer_listings.filter(l => l.id !== id);
      // Cascade delete opportunities
      store.opportunities = store.opportunities.filter(o => o.listing_id !== id);
      writeLocalData(store);
      return true;
    }
  },

  // Buyer Requirements
  buyerRequirements: {
    async create({ buyer_id, residue_type, required_quantity_kg, use_type, price_per_kg, location, latitude, longitude, status = 'active' }) {
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      const reqRecord = {
        id,
        buyer_id,
        residue_type,
        required_quantity_kg: Number(required_quantity_kg),
        use_type,
        price_per_kg: Number(price_per_kg),
        location,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        status,
        created_at
      };

      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('buyer_requirements')
          .insert([reqRecord])
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const query = `
          INSERT INTO buyer_requirements (id, buyer_id, residue_type, required_quantity_kg, use_type, price_per_kg, location, latitude, longitude, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `;
        const res = await pgPool.query(query, [
          id, buyer_id, residue_type, reqRecord.required_quantity_kg, use_type, reqRecord.price_per_kg, location, reqRecord.latitude, reqRecord.longitude, status, created_at
        ]);
        return res.rows[0];
      }

      const store = readLocalData();
      store.buyer_requirements.push(reqRecord);
      writeLocalData(store);
      return reqRecord;
    },

    async findById(id) {
      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('buyer_requirements')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const res = await pgPool.query('SELECT * FROM buyer_requirements WHERE id = $1', [id]);
        return res.rows[0] || null;
      }

      const store = readLocalData();
      return store.buyer_requirements.find(b => b.id === id) || null;
    },

    async list(filters = {}) {
      if (dbMode === 'supabase') {
        let query = supabaseClient.from('buyer_requirements').select('*, users(name, phone, location)');
        if (filters.buyer_id) query = query.eq('buyer_id', filters.buyer_id);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.residue_type) query = query.ilike('residue_type', `%${filters.residue_type}%`);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        let queryStr = `
          SELECT r.*, u.name as buyer_name, u.phone as buyer_phone
          FROM buyer_requirements r
          LEFT JOIN users u ON r.buyer_id = u.id
          WHERE 1=1
        `;
        const params = [];
        if (filters.buyer_id) {
          params.push(filters.buyer_id);
          queryStr += ` AND r.buyer_id = $${params.length}`;
        }
        if (filters.status) {
          params.push(filters.status);
          queryStr += ` AND r.status = $${params.length}`;
        }
        queryStr += ' ORDER BY r.created_at DESC';
        const res = await pgPool.query(queryStr, params);
        return res.rows;
      }

      const store = readLocalData();
      let results = [...store.buyer_requirements];
      if (filters.buyer_id) results = results.filter(b => b.buyer_id === filters.buyer_id);
      if (filters.status) results = results.filter(b => b.status === filters.status);
      if (filters.residue_type) {
        const rLower = filters.residue_type.toLowerCase();
        results = results.filter(b => b.residue_type.toLowerCase().includes(rLower));
      }

      return results.map(b => {
        const buyer = store.users.find(u => u.id === b.buyer_id);
        return {
          ...b,
          buyer_name: buyer ? buyer.name : 'Unknown Buyer',
          buyer_phone: buyer ? buyer.phone : null
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async update(id, updates) {
      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('buyer_requirements')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const keys = Object.keys(updates);
        if (keys.length === 0) return this.findById(id);
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = [id, ...keys.map(k => updates[k])];
        const res = await pgPool.query(`UPDATE buyer_requirements SET ${setClause} WHERE id = $1 RETURNING *`, values);
        return res.rows[0];
      }

      const store = readLocalData();
      const index = store.buyer_requirements.findIndex(b => b.id === id);
      if (index === -1) return null;
      store.buyer_requirements[index] = { ...store.buyer_requirements[index], ...updates };
      writeLocalData(store);
      return store.buyer_requirements[index];
    },

    async delete(id) {
      if (dbMode === 'supabase') {
        const { error } = await supabaseClient.from('buyer_requirements').delete().eq('id', id);
        if (error) throw error;
        return true;
      }

      if (dbMode === 'postgres') {
        await pgPool.query('DELETE FROM buyer_requirements WHERE id = $1', [id]);
        return true;
      }

      const store = readLocalData();
      store.buyer_requirements = store.buyer_requirements.filter(b => b.id !== id);
      store.opportunities = store.opportunities.filter(o => o.buyer_requirement_id !== id);
      writeLocalData(store);
      return true;
    }
  },

  // Opportunities
  opportunities: {
    async create({ listing_id, buyer_requirement_id, distance_km, transport_cost, handling_cost, gross_value, net_value }) {
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      const oppRecord = {
        id,
        listing_id,
        buyer_requirement_id,
        distance_km: Number(distance_km),
        transport_cost: Number(transport_cost),
        handling_cost: Number(handling_cost),
        gross_value: Number(gross_value),
        net_value: Number(net_value),
        created_at
      };

      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('opportunities')
          .insert([oppRecord])
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const query = `
          INSERT INTO opportunities (id, listing_id, buyer_requirement_id, distance_km, transport_cost, handling_cost, gross_value, net_value, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `;
        const res = await pgPool.query(query, [
          id, listing_id, buyer_requirement_id, oppRecord.distance_km, oppRecord.transport_cost, oppRecord.handling_cost, oppRecord.gross_value, oppRecord.net_value, created_at
        ]);
        return res.rows[0];
      }

      const store = readLocalData();
      // Avoid duplicate opportunity records for same listing & requirement
      const existingIdx = store.opportunities.findIndex(
        o => o.listing_id === listing_id && o.buyer_requirement_id === buyer_requirement_id
      );
      if (existingIdx >= 0) {
        store.opportunities[existingIdx] = oppRecord;
      } else {
        store.opportunities.push(oppRecord);
      }
      writeLocalData(store);
      return oppRecord;
    },

    async findById(id) {
      if (dbMode === 'supabase') {
        const { data, error } = await supabaseClient
          .from('opportunities')
          .select('*, farmer_listings(*), buyer_requirements(*)')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      }

      if (dbMode === 'postgres') {
        const res = await pgPool.query('SELECT * FROM opportunities WHERE id = $1', [id]);
        return res.rows[0] || null;
      }

      const store = readLocalData();
      const opp = store.opportunities.find(o => o.id === id);
      if (!opp) return null;
      const listing = store.farmer_listings.find(l => l.id === opp.listing_id) || null;
      const req = store.buyer_requirements.find(b => b.id === opp.buyer_requirement_id) || null;
      return { ...opp, listing, requirement: req };
    },

    async list(filters = {}) {
      if (dbMode === 'supabase') {
        let query = supabaseClient.from('opportunities').select('*, farmer_listings(*), buyer_requirements(*)');
        if (filters.listing_id) query = query.eq('listing_id', filters.listing_id);
        if (filters.buyer_requirement_id) query = query.eq('buyer_requirement_id', filters.buyer_requirement_id);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }

      const store = readLocalData();
      let results = [...store.opportunities];
      if (filters.listing_id) results = results.filter(o => o.listing_id === filters.listing_id);
      if (filters.buyer_requirement_id) results = results.filter(o => o.buyer_requirement_id === filters.buyer_requirement_id);

      return results.map(opp => {
        const listing = store.farmer_listings.find(l => l.id === opp.listing_id) || null;
        const req = store.buyer_requirements.find(b => b.id === opp.buyer_requirement_id) || null;
        const buyer = req ? store.users.find(u => u.id === req.buyer_id) : null;
        const farmer = listing ? store.users.find(u => u.id === listing.farmer_id) : null;
        return {
          ...opp,
          listing,
          requirement: req,
          buyer_name: buyer ? buyer.name : 'Industrial Buyer',
          farmer_name: farmer ? farmer.name : 'Farmer'
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }
};

module.exports = db;
