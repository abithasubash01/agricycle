// src/components/farmer/BuyerRequests.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchBuyerRequirements, fetchListings, calculateMatch, startConversation, subscribeToData } from '../../api/dataLayer';
import {
  Building2,
  Calendar,
  MapPin,
  Sparkles,
  MessageSquare,
  Search,
  CheckCircle,
  TrendingUp,
  X
} from 'lucide-react';

export default function BuyerRequests({ onNavigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [buyerReqs, setBuyerReqs] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  const load = () => {
    setBuyerReqs(fetchBuyerRequirements());
    setMyListings(fetchListings().filter((l) => l.farmerId === user.id));
  };

  useEffect(() => {
    load();
    return subscribeToData(load);
  }, [user.id]);

  const filtered = buyerReqs.filter((req) => {
    const q = filterQuery.toLowerCase();
    return (
      req.buyerName?.toLowerCase().includes(q) ||
      req.cropType?.toLowerCase().includes(q) ||
      req.wasteType?.toLowerCase().includes(q) ||
      req.preferredLocation?.toLowerCase().includes(q)
    );
  });

  const handleConnect = (req, bestListing) => {
    if (!bestListing) {
      alert('Create a listing first to connect with this buyer demand.');
      onNavigate('my-listings');
      return;
    }
    try {
      startConversation(bestListing.id, user.id);
      onNavigate('messages');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">{t('buyerRequests')}</h1>
          <p className="page-subtitle">
            Commercial procurement requirements posted by industrial buyers. Matching scores are dynamically computed against your crop residues.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-1 mt-2 mb-2 search-box-wrapper">
        <Search size={18} color="var(--color-text-muted)" />
        <input
          type="text"
          placeholder="Filter requirements by company, crop, residue, or region..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="search-box-input"
        />
      </div>

      {/* Grid of Buyer Requests */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.length === 0 ? (
          <div className="card text-center p-3 text-muted" style={{ gridColumn: 'span 2' }}>
            No buyer procurement requirements matching the query.
          </div>
        ) : (
          filtered.map((req) => {
            // Find best matching listing from farmer's inventory
            let bestScore = 60;
            let bestReasons = ['General crop residue match'];
            let matchedListing = null;

            if (myListings.length > 0) {
              myListings.forEach((listing) => {
                const res = calculateMatch(listing, req);
                if (res.score > bestScore) {
                  bestScore = res.score;
                  bestReasons = res.reasons;
                  matchedListing = listing;
                }
              });
            }

            return (
              <div key={req.id} className="card flex flex-col justify-between buyer-request-card">
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1">
                      <div className="company-icon-badge">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{req.buyerName}</h3>
                        <span className="text-muted flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                          <MapPin size={13} /> Preferred: {req.preferredLocation}
                        </span>
                      </div>
                    </div>

                    {/* AI Match Score Badge */}
                    <div className="ai-score-pill flex items-center gap-1">
                      <Sparkles size={14} color="var(--color-accent)" />
                      <strong>{bestScore}% Match</strong>
                    </div>
                  </div>

                  {/* Requirements Body */}
                  <div className="req-specs-box mt-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Demanded Residue:</span>
                        <div className="font-bold text-brand" style={{ fontSize: '1.05rem', textTransform: 'capitalize' }}>
                          {req.cropType} {req.wasteType}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Required Quantity:</span>
                        <div className="font-bold" style={{ fontSize: '1.05rem' }}>
                          {req.quantityTons} Tons
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-1 pt-1" style={{ borderTop: '1px dashed var(--color-border)' }}>
                      <div>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Budget Ceiling:</span>
                        <div className="font-semibold text-accent">
                          Up to ₹{req.maxPricePerTon}/ton
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Delivery Window:</span>
                        <div className="font-semibold flex items-center gap-1 justify-end">
                          <Calendar size={13} color="var(--color-text-muted)" />
                          {req.requiredDate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Match Explanation */}
                  <div className="match-explanation-snippet mt-1">
                    <span style={{ fontWeight: 600, color: 'var(--color-brand-primary)' }}>Matching Logic:</span>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '1.1rem', fontSize: '0.85rem' }}>
                      {bestReasons.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex gap-1 mt-2 pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <button
                    className="btn-outline flex-1"
                    onClick={() => setSelectedReq(req)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn-primary flex-1 flex items-center justify-center gap-1"
                    onClick={() => handleConnect(req, matchedListing || myListings[0])}
                  >
                    <MessageSquare size={16} /> Contact Buyer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Requirement Details Modal */}
      {selectedReq && (
        <div className="modal-backdrop" onClick={() => setSelectedReq(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center">
              <div>
                <span className="badge badge-primary">{selectedReq.cropType?.toUpperCase()}</span>
                <h2 className="mt-1">{selectedReq.buyerName} Procurement Demands</h2>
              </div>
              <button className="btn-icon" onClick={() => setSelectedReq(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="grid grid-cols-2 gap-2">
                <div className="detail-item">
                  <span className="detail-label">Material Type</span>
                  <span className="detail-val font-bold capitalize">{selectedReq.cropType} {selectedReq.wasteType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Required Lot Volume</span>
                  <span className="detail-val font-bold">{selectedReq.quantityTons} Tons</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Max Budgeted Price</span>
                  <span className="detail-val font-bold text-accent">₹{selectedReq.maxPricePerTon} / ton</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Required By Date</span>
                  <span className="detail-val">{selectedReq.requiredDate}</span>
                </div>
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Preferred Sourcing Region</span>
                  <span className="detail-val">{selectedReq.preferredLocation}</span>
                </div>
              </div>

              <div className="notice-banner mt-2">
                <strong>Prototype Notice:</strong> {t('prototypeNotice')}
              </div>
            </div>

            <div className="modal-footer flex justify-end gap-1">
              <button className="btn-secondary" onClick={() => setSelectedReq(null)}>Close</button>
              <button
                className="btn-primary flex items-center gap-1"
                onClick={() => {
                  handleConnect(selectedReq, myListings[0]);
                  setSelectedReq(null);
                }}
              >
                <MessageSquare size={16} /> Send Supply Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
