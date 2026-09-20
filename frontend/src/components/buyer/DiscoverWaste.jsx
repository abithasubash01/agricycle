// src/components/buyer/DiscoverWaste.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  fetchListings,
  fetchBuyerRequirements,
  expressInterest,
  startConversation,
  calculateMatch,
  subscribeToData
} from '../../api/dataLayer';
import ListingDetailsModal from '../common/ListingDetailsModal';
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  Eye,
  MessageSquare,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export default function DiscoverWaste({ onNavigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [buyerReqs, setBuyerReqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [selectedListingForModal, setSelectedListingForModal] = useState(null);
  const [toast, setToast] = useState('');

  const load = () => {
    setListings(fetchListings());
    setBuyerReqs(fetchBuyerRequirements().filter((r) => r.buyerId === user.id));
  };

  useEffect(() => {
    load();
    return subscribeToData(load);
  }, [user.id]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleInterest = (listingId) => {
    try {
      expressInterest(listingId);
      showToastMsg('Interest expressed! Farmer has been notified.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleChat = (listingId, farmerId) => {
    try {
      startConversation(listingId, farmerId);
      onNavigate('messages');
    } catch (e) {
      console.error(e);
    }
  };

  // Filter listings
  const filtered = listings.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      l.cropType.toLowerCase().includes(q) ||
      l.wasteType.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      l.farmerName.toLowerCase().includes(q);

    const matchesCrop = selectedCrop === 'all' || l.cropType.toLowerCase() === selectedCrop.toLowerCase();
    const matchesLocation = selectedLocation === 'all' || l.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesPrice = !maxPrice || Number(l.pricePerTon) <= Number(maxPrice);
    const matchesQty = !minQuantity || Number(l.quantityTons) >= Number(minQuantity);

    return matchesSearch && matchesCrop && matchesLocation && matchesPrice && matchesQty;
  });

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header flex justify-between items-center mb-2">
        <div>
          <h1 className="page-title">{t('discoverWaste')}</h1>
          <p className="page-subtitle">
            Browse verified agricultural residues directly from farmers with AI-assisted match scoring.
          </p>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="marketplace-filter-card card mb-2">
        <div className="grid grid-cols-5 gap-1 items-end">
          {/* Search Box */}
          <div style={{ gridColumn: 'span 2' }}>
            <label className="form-label">{t('search')}</label>
            <div className="flex items-center search-input-container">
              <Search size={18} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search residue, farmer, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-bare"
              />
            </div>
          </div>

          {/* Crop Filter */}
          <div>
            <label className="form-label">{t('cropType')}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="form-select"
            >
              <option value="all">All Crops</option>
              <option value="paddy">Paddy</option>
              <option value="wheat">Wheat</option>
              <option value="sugarcane">Sugarcane</option>
              <option value="cotton">Cotton</option>
              <option value="maize">Maize</option>
              <option value="coconut">Coconut</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="form-label">{t('location')}</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="form-select"
            >
              <option value="all">All Regions</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label className="form-label">Max Price (₹/T)</label>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Clear Filters helper */}
        {(searchTerm || selectedCrop !== 'all' || selectedLocation !== 'all' || maxPrice || minQuantity) && (
          <div className="flex justify-end mt-1">
            <button
              className="btn-link"
              onClick={() => {
                setSearchTerm('');
                setSelectedCrop('all');
                setSelectedLocation('all');
                setMaxPrice('');
                setMinQuantity('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Meta */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-muted" style={{ fontSize: '0.9rem' }}>
          Found <strong>{filtered.length}</strong> farm residue lots available for procurement
        </span>
      </div>

      {/* Marketplace Listings Grid */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.length === 0 ? (
          <div className="card text-center p-3 text-muted" style={{ gridColumn: 'span 3' }}>
            No listings found matching your search criteria. Try adjusting the filters or search term.
          </div>
        ) : (
          filtered.map((l) => {
            const isInterested = (l.interestedBuyers || []).some((b) => b.buyerId === user.id);
            const match = calculateMatch(l, buyerReqs[0] || {
              cropType: l.cropType,
              wasteType: l.wasteType,
              maxPricePerTon: l.pricePerTon + 200,
              preferredLocation: l.location,
            });

            return (
              <div key={l.id} className="card marketplace-card flex flex-col justify-between">
                <div>
                  {/* Card Header: Crop & AI Match Score */}
                  <div className="flex justify-between items-start mb-1">
                    <span className="badge badge-primary">{l.cropType?.toUpperCase()}</span>
                    <span className="badge badge-accent flex items-center gap-1">
                      <Sparkles size={12} /> {match.score}% Match
                    </span>
                  </div>

                  {/* Title & Residue Type */}
                  <h3 style={{ textTransform: 'capitalize', fontSize: '1.2rem', margin: '4px 0' }}>
                    {l.wasteType} Residue
                  </h3>

                  {/* Farmer & Location */}
                  <div className="flex items-center gap-1 text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                    <MapPin size={15} color="var(--color-brand-primary)" /> {l.location}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    Farmer: <strong>{l.farmerName}</strong>
                  </div>

                  {/* Pricing and Volume Box */}
                  <div className="lot-price-box flex justify-between items-center">
                    <div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Available Volume:</span>
                      <div className="font-bold text-brand" style={{ fontSize: '1.15rem' }}>
                        {l.quantityTons} Tons
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Expected Rate:</span>
                      <div className="font-bold text-accent" style={{ fontSize: '1.15rem' }}>
                        ₹{l.pricePerTon}<span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ton</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Match Reason snippet */}
                  <div className="match-tag-snippet mt-1">
                    <Sparkles size={12} color="var(--color-accent)" />
                    <span>{match.reasons[0]}</span>
                  </div>
                </div>

                {/* Explicit Flow: View Listing -> Listing Details -> Express Interest -> Chat */}
                <div className="marketplace-card-actions flex flex-col gap-1 mt-2 pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <button
                    className="btn-outline w-full flex items-center justify-center gap-1"
                    onClick={() => setSelectedListingForModal(l)}
                  >
                    <Eye size={16} /> View Listing Details
                  </button>

                  <div className="flex gap-1">
                    <button
                      className={isInterested ? 'btn-success flex-1 flex items-center justify-center gap-1' : 'btn-primary flex-1 flex items-center justify-center gap-1'}
                      onClick={() => handleInterest(l.id)}
                      disabled={isInterested}
                    >
                      <CheckCircle2 size={16} />
                      {isInterested ? t('interested') : t('imInterested')}
                    </button>

                    {isInterested && (
                      <button
                        className="btn-accent flex items-center justify-center"
                        title="Chat with Farmer"
                        onClick={() => handleChat(l.id, l.farmerId)}
                      >
                        <MessageSquare size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reusable Listing Details Modal */}
      {selectedListingForModal && (
        <ListingDetailsModal
          listing={selectedListingForModal}
          onClose={() => setSelectedListingForModal(null)}
          onNavigateToChat={() => onNavigate('messages')}
          userRequirement={buyerReqs[0]}
        />
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}
