// src/api/dataLayer.js
// Single source of truth for prototype state, using localStorage + Pub/Sub.
// Live prototype UI synchronization using Pub/Sub.

const STORE_KEY = 'agricycle_data';
let listeners = [];

const MOCK_USERS = [
  {
    id: 'u1',
    role: 'farmer',
    name: 'Ravi Kumar',
    username: 'Ravi Kumar',
    password: 'farmer123',
    location: 'Ludhiana, Punjab',
    farmArea: 25,
    primaryCrops: ['Paddy', 'Wheat'],
    phone: '+91 98765 43210',
    bio: 'Paddy and wheat farmer practicing sustainable residue management and zero burning.',
  },
  {
    id: 'u2',
    role: 'buyer',
    name: 'GreenBio Industries',
    username: 'GreenBio Industries',
    password: 'buyer123',
    industry: 'Biofuel & Pellet Manufacturing',
    location: 'Ambala, Haryana',
    phone: '+91 91234 56789',
    bio: 'Leading manufacturer of biomass briquettes and bio-coal pellets procuring agricultural residue.',
    materialsNeeded: ['Paddy Straw', 'Sugarcane Bagasse', 'Cotton Stalks'],
  },
  {
    id: 'u3',
    role: 'farmer',
    name: 'Anita Devi',
    username: 'Anita Devi',
    password: 'farmer123',
    location: 'Karnal, Haryana',
    farmArea: 15,
    primaryCrops: ['Sugarcane', 'Paddy'],
    phone: '+91 98111 22334',
    bio: 'Sugarcane and paddy grower supplying clean bagasse and straw for commercial bio-energy.',
  },
  {
    id: 'u4',
    role: 'buyer',
    name: 'EcoPack Circular Solutions',
    username: 'EcoPack Solutions',
    password: 'buyer123',
    industry: 'Biodegradable Packaging',
    location: 'Patiala, Punjab',
    phone: '+91 97888 44556',
    bio: 'Molded fiber tableware and sustainable packaging unit requiring agri-residue pulp.',
    materialsNeeded: ['Wheat Straw', 'Paddy Straw'],
  }
];

const MOCK_LISTINGS = [
  {
    id: 'l1',
    farmerId: 'u1',
    farmerName: 'Ravi Kumar',
    location: 'Ludhiana, Punjab',
    cropType: 'paddy',
    wasteType: 'straw',
    farmArea: 10,
    quantityTons: 15,
    pricePerTon: 1500,
    aiEstimatedTons: 15,
    status: 'Interest Received', // Draft, Published, Interest Received, In Discussion, Matched, Closed
    createdAt: Date.now() - 3600000 * 24 * 2,
    interestedBuyers: [
      { buyerId: 'u2', buyerName: 'GreenBio Industries', interestedAt: Date.now() - 3600000 * 12 }
    ],
  },
  {
    id: 'l2',
    farmerId: 'u3',
    farmerName: 'Anita Devi',
    location: 'Karnal, Haryana',
    cropType: 'sugarcane',
    wasteType: 'bagasse',
    farmArea: 8,
    quantityTons: 25,
    pricePerTon: 950,
    aiEstimatedTons: 28,
    status: 'Published',
    createdAt: Date.now() - 3600000 * 24 * 4,
    interestedBuyers: [],
  },
  {
    id: 'l3',
    farmerId: 'u1',
    farmerName: 'Ravi Kumar',
    location: 'Ludhiana, Punjab',
    cropType: 'wheat',
    wasteType: 'straw',
    farmArea: 12,
    quantityTons: 18,
    pricePerTon: 1350,
    aiEstimatedTons: 16,
    status: 'In Discussion',
    createdAt: Date.now() - 3600000 * 24 * 6,
    interestedBuyers: [
      { buyerId: 'u4', buyerName: 'EcoPack Circular Solutions', interestedAt: Date.now() - 3600000 * 20 }
    ],
  },
  {
    id: 'l4',
    farmerId: 'u1',
    farmerName: 'Ravi Kumar',
    location: 'Ludhiana, Punjab',
    cropType: 'maize',
    wasteType: 'stalks',
    farmArea: 6,
    quantityTons: 10,
    pricePerTon: 1100,
    aiEstimatedTons: 9,
    status: 'Matched',
    createdAt: Date.now() - 3600000 * 24 * 10,
    interestedBuyers: [
      { buyerId: 'u2', buyerName: 'GreenBio Industries', interestedAt: Date.now() - 3600000 * 48 }
    ],
  },
];

const MOCK_BUYER_REQUIREMENTS = [
  {
    id: 'br1',
    buyerId: 'u2',
    buyerName: 'GreenBio Industries',
    cropType: 'paddy',
    wasteType: 'straw',
    quantityTons: 50,
    preferredLocation: 'Punjab',
    maxPricePerTon: 1600,
    requiredDate: '2026-10-15',
    status: 'Active',
    createdAt: Date.now() - 3600000 * 24 * 3,
  },
  {
    id: 'br2',
    buyerId: 'u2',
    buyerName: 'GreenBio Industries',
    cropType: 'sugarcane',
    wasteType: 'bagasse',
    quantityTons: 100,
    preferredLocation: 'Haryana',
    maxPricePerTon: 1000,
    requiredDate: '2026-11-01',
    status: 'Active',
    createdAt: Date.now() - 3600000 * 24 * 5,
  },
  {
    id: 'br3',
    buyerId: 'u4',
    buyerName: 'EcoPack Circular Solutions',
    cropType: 'wheat',
    wasteType: 'straw',
    quantityTons: 30,
    preferredLocation: 'Punjab',
    maxPricePerTon: 1400,
    requiredDate: '2026-10-25',
    status: 'Active',
    createdAt: Date.now() - 3600000 * 24 * 2,
  },
];

const MOCK_TRANSACTIONS = [
  {
    id: 't1',
    listingId: 'l1',
    buyerId: 'u2',
    buyerName: 'GreenBio Industries',
    farmerId: 'u1',
    farmerName: 'Ravi Kumar',
    wasteType: 'straw',
    cropType: 'paddy',
    quantityTons: 15,
    pricePerTon: 1500,
    totalValue: 22500,
    date: new Date(Date.now() - 3600000 * 12).toISOString().split('T')[0],
    status: 'Interested', // Interested, In Discussion, Matched, Completed
    location: 'Ludhiana, Punjab',
  },
  {
    id: 't2',
    listingId: 'l3',
    buyerId: 'u4',
    buyerName: 'EcoPack Circular Solutions',
    farmerId: 'u1',
    farmerName: 'Ravi Kumar',
    wasteType: 'straw',
    cropType: 'wheat',
    quantityTons: 18,
    pricePerTon: 1350,
    totalValue: 24300,
    date: new Date(Date.now() - 3600000 * 20).toISOString().split('T')[0],
    status: 'In Discussion',
    location: 'Ludhiana, Punjab',
  },
  {
    id: 't3',
    listingId: 'l4',
    buyerId: 'u2',
    buyerName: 'GreenBio Industries',
    farmerId: 'u1',
    farmerName: 'Ravi Kumar',
    wasteType: 'stalks',
    cropType: 'maize',
    quantityTons: 10,
    pricePerTon: 1100,
    totalValue: 11000,
    date: new Date(Date.now() - 3600000 * 48).toISOString().split('T')[0],
    status: 'Matched',
    location: 'Ludhiana, Punjab',
  }
];

const MOCK_CONVERSATIONS = [
  {
    id: 'c1',
    listingId: 'l1',
    farmerId: 'u1',
    farmerName: 'Ravi Kumar',
    buyerId: 'u2',
    buyerName: 'GreenBio Industries',
    messages: [
      { id: 'm1', senderId: 'u2', text: 'Namaste Ravi ji, GreenBio Industries is interested in your 15 tons of Paddy straw. Is baling already completed?', timestamp: Date.now() - 3600000 * 10 },
      { id: 'm2', senderId: 'u1', text: 'Sat Sri Akal! Yes, the field has been harvested using combine with super SMS and baler is scheduled tomorrow. Moisture is under 14%.', timestamp: Date.now() - 3600000 * 8 },
      { id: 'm3', senderId: 'u2', text: 'Great. Can we schedule dispatch pickup towards Ambala pellet facility next Tuesday?', timestamp: Date.now() - 3600000 * 4 }
    ],
  },
];

// Helper to get or init DB
function getDB() {
  const data = localStorage.getItem(STORE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      // Ensure new collections exist in case of old localStorage version
      if (!parsed.buyerRequirements) parsed.buyerRequirements = MOCK_BUYER_REQUIREMENTS;
      if (!parsed.transactions) parsed.transactions = MOCK_TRANSACTIONS;
      return parsed;
    } catch (e) {
      console.error('Error parsing localStorage DB, resetting:', e);
      return resetDemoData();
    }
  }
  return resetDemoData();
}

function saveDB(db) {
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
  notifyListeners();
}

// Pub/Sub
export function subscribeToData(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Pub/Sub subscriber error:', e);
    }
  });
}

// --------------------------------------------------
// DEMO / SYSTEM (e.g. POST /system/reset)
// --------------------------------------------------
export function resetDemoData() {
  const initialData = {
    users: MOCK_USERS,
    listings: MOCK_LISTINGS,
    buyerRequirements: MOCK_BUYER_REQUIREMENTS,
    transactions: MOCK_TRANSACTIONS,
    conversations: MOCK_CONVERSATIONS,
    sessionUserId: null,
  };
  localStorage.setItem(STORE_KEY, JSON.stringify(initialData));
  notifyListeners();
  return initialData;
}

// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------
export function login(username, password) {
  const db = getDB();
  const user = db.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim());
  if (user) {
    db.sessionUserId = user.id;
    saveDB(db);
    return user;
  }
  throw new Error('Invalid credentials. Use demo credentials: Ravi Kumar (farmer123) or GreenBio Industries (buyer123)');
}

export function logout() {
  const db = getDB();
  db.sessionUserId = null;
  saveDB(db);
}

export function getCurrentUser() {
  const db = getDB();
  if (!db.sessionUserId) return null;
  return db.users.find((u) => u.id === db.sessionUserId) || null;
}

export function updateUserProfile(userId, updates) {
  const db = getDB();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('User not found');
  db.users[index] = { ...db.users[index], ...updates };
  saveDB(db);
  return db.users[index];
}

// --------------------------------------------------
// LISTINGS
// --------------------------------------------------
export function fetchListings() {
  const db = getDB();
  return (db.listings || []).sort((a, b) => b.createdAt - a.createdAt);
}

export function fetchListingById(listingId) {
  const db = getDB();
  return (db.listings || []).find((l) => l.id === listingId) || null;
}

export function createListing(listingData) {
  const db = getDB();
  const user = getCurrentUser();
  if (!user || user.role !== 'farmer') throw new Error('Only farmers can create listings');

  const newListing = {
    id: 'l_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    farmerId: user.id,
    farmerName: user.name,
    createdAt: Date.now(),
    interestedBuyers: [],
    status: 'Published',
    ...listingData,
  };

  db.listings.push(newListing);
  saveDB(db);
  return newListing;
}

export function updateListing(listingId, updates) {
  const db = getDB();
  const index = db.listings.findIndex((l) => l.id === listingId);
  if (index === -1) throw new Error('Listing not found');
  db.listings[index] = { ...db.listings[index], ...updates };
  saveDB(db);
  return db.listings[index];
}

export function deleteListing(listingId) {
  const db = getDB();
  db.listings = db.listings.filter((l) => l.id !== listingId);
  // Also clean up transactions referring to this listing
  db.transactions = (db.transactions || []).filter((t) => t.listingId !== listingId);
  saveDB(db);
}

// Buyer expresses interest
export function expressInterest(listingId) {
  const db = getDB();
  const user = getCurrentUser();
  if (!user || user.role !== 'buyer') throw new Error('Only buyers can express interest');

  const listingIndex = db.listings.findIndex((l) => l.id === listingId);
  if (listingIndex === -1) throw new Error('Listing not found');

  const listing = db.listings[listingIndex];
  if (!listing.interestedBuyers) listing.interestedBuyers = [];
  const alreadyInterested = listing.interestedBuyers.some((b) => b.buyerId === user.id);

  if (!alreadyInterested) {
    listing.interestedBuyers.push({
      buyerId: user.id,
      buyerName: user.name,
      interestedAt: Date.now(),
    });

    // Update listing status if currently Published
    if (listing.status === 'Published') {
      listing.status = 'Interest Received';
    }

    // Automatically record a prototype transaction entry
    if (!db.transactions) db.transactions = [];
    const exists = db.transactions.some((t) => t.listingId === listing.id && t.buyerId === user.id);
    if (!exists) {
      db.transactions.push({
        id: 't_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        listingId: listing.id,
        buyerId: user.id,
        buyerName: user.name,
        farmerId: listing.farmerId,
        farmerName: listing.farmerName,
        wasteType: listing.wasteType,
        cropType: listing.cropType,
        quantityTons: listing.quantityTons,
        pricePerTon: listing.pricePerTon,
        totalValue: (listing.quantityTons || 0) * (listing.pricePerTon || 0),
        date: new Date().toISOString().split('T')[0],
        status: 'Interested',
        location: listing.location,
      });
    }

    saveDB(db);
  }
}

// --------------------------------------------------
// BUYER REQUIREMENTS
// --------------------------------------------------
export function fetchBuyerRequirements() {
  const db = getDB();
  return (db.buyerRequirements || []).sort((a, b) => b.createdAt - a.createdAt);
}

export function createBuyerRequirement(reqData) {
  const db = getDB();
  const user = getCurrentUser();
  if (!user || user.role !== 'buyer') throw new Error('Only buyers can create procurement requirements');

  const newReq = {
    id: 'br_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    buyerId: user.id,
    buyerName: user.name,
    createdAt: Date.now(),
    status: 'Active',
    ...reqData,
  };

  if (!db.buyerRequirements) db.buyerRequirements = [];
  db.buyerRequirements.push(newReq);
  saveDB(db);
  return newReq;
}

export function updateBuyerRequirement(reqId, updates) {
  const db = getDB();
  const index = (db.buyerRequirements || []).findIndex((r) => r.id === reqId);
  if (index === -1) throw new Error('Requirement not found');
  db.buyerRequirements[index] = { ...db.buyerRequirements[index], ...updates };
  saveDB(db);
  return db.buyerRequirements[index];
}

export function deleteBuyerRequirement(reqId) {
  const db = getDB();
  db.buyerRequirements = (db.buyerRequirements || []).filter((r) => r.id !== reqId);
  saveDB(db);
}

// --------------------------------------------------
// TRANSACTIONS / PROCUREMENT TRACKING (Demo Only)
// --------------------------------------------------
export function fetchTransactions() {
  const db = getDB();
  return (db.transactions || []).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function updateTransactionStatus(transId, newStatus) {
  const db = getDB();
  const index = (db.transactions || []).findIndex((t) => t.id === transId);
  if (index === -1) throw new Error('Transaction not found');
  
  db.transactions[index].status = newStatus;

  // Also sync listing status if matching
  const listingIndex = (db.listings || []).findIndex((l) => l.id === db.transactions[index].listingId);
  if (listingIndex !== -1) {
    if (newStatus === 'Matched' || newStatus === 'In Discussion') {
      db.listings[listingIndex].status = newStatus;
    }
  }

  saveDB(db);
  return db.transactions[index];
}

// --------------------------------------------------
// CHAT
// --------------------------------------------------
export function fetchConversations() {
  const db = getDB();
  const user = getCurrentUser();
  if (!user) return [];

  return (db.conversations || []).filter(
    (c) => c.farmerId === user.id || c.buyerId === user.id
  ).sort((a, b) => {
    const lastMsgA = a.messages[a.messages.length - 1]?.timestamp || 0;
    const lastMsgB = b.messages[b.messages.length - 1]?.timestamp || 0;
    return lastMsgB - lastMsgA;
  });
}

export function startConversation(listingId, farmerId) {
  const db = getDB();
  const user = getCurrentUser();
  if (!user) throw new Error('Must be logged in');

  const listing = (db.listings || []).find((l) => l.id === listingId);
  const farmer = (db.users || []).find((u) => u.id === farmerId);

  let conv = (db.conversations || []).find((c) => c.listingId === listingId && c.buyerId === user.id);
  if (!conv) {
    conv = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      listingId,
      farmerId: farmerId,
      farmerName: farmer ? farmer.name : (listing ? listing.farmerName : 'Farmer'),
      buyerId: user.id,
      buyerName: user.name,
      messages: [
        {
          id: 'm_' + Date.now(),
          senderId: user.id,
          text: `Hello ${farmer ? farmer.name : 'Farmer'}, I am inquiring about your ${listing ? listing.wasteType : 'residue'} listing.`,
          timestamp: Date.now(),
        }
      ],
    };
    if (!db.conversations) db.conversations = [];
    db.conversations.push(conv);

    // If transaction status is Interested, move it to In Discussion
    if (db.transactions) {
      const trans = db.transactions.find((t) => t.listingId === listingId && t.buyerId === user.id);
      if (trans && trans.status === 'Interested') {
        trans.status = 'In Discussion';
      }
    }

    saveDB(db);
  }
  return conv.id;
}

export function sendMessage(conversationId, text) {
  const db = getDB();
  const user = getCurrentUser();
  if (!user) throw new Error('Must be logged in');

  const conv = (db.conversations || []).find((c) => c.id === conversationId);
  if (!conv) throw new Error('Conversation not found');

  conv.messages.push({
    id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    senderId: user.id,
    text,
    timestamp: Date.now(),
  });
  
  saveDB(db);
}

// --------------------------------------------------
// AI MATCHING ENGINE (Rule + Heuristic Match Score)
// --------------------------------------------------
export function calculateMatch(listing, requirement) {
  let score = 50; // base score for agricultural residue
  const reasons = [];

  // Match crop type
  if (requirement.cropType && listing.cropType) {
    if (requirement.cropType.toLowerCase() === listing.cropType.toLowerCase()) {
      score += 25;
      reasons.push(`Direct crop match: ${listing.cropType.toUpperCase()}`);
    } else {
      score -= 10;
    }
  }

  // Match waste type
  if (requirement.wasteType && listing.wasteType) {
    if (requirement.wasteType.toLowerCase().includes(listing.wasteType.toLowerCase()) || 
        listing.wasteType.toLowerCase().includes(requirement.wasteType.toLowerCase())) {
      score += 15;
      reasons.push(`Material compatibility: ${listing.wasteType}`);
    }
  }

  // Price compatibility
  if (requirement.maxPricePerTon && listing.pricePerTon) {
    if (listing.pricePerTon <= requirement.maxPricePerTon) {
      score += 10;
      reasons.push(`Within price threshold (₹${listing.pricePerTon} ≤ ₹${requirement.maxPricePerTon}/ton)`);
    } else {
      score -= 15;
      reasons.push(`Price exceeds requirement budget by ₹${listing.pricePerTon - requirement.maxPricePerTon}/ton`);
    }
  }

  // Location / State proximity heuristic
  if (requirement.preferredLocation && listing.location) {
    const pref = requirement.preferredLocation.toLowerCase();
    const loc = listing.location.toLowerCase();
    if (loc.includes(pref) || pref.includes(loc.split(',')[0].trim().toLowerCase())) {
      score += 10;
      reasons.push(`Optimal logistics: Supply within ${requirement.preferredLocation} region`);
    } else {
      reasons.push(`Inter-state transport required`);
    }
  }

  const finalScore = Math.min(Math.max(score, 30), 99);
  return {
    score: finalScore,
    reasons: reasons.length > 0 ? reasons : ['General agricultural residue match for industrial feedstock'],
  };
}
