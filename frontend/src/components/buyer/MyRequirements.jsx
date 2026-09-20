// src/components/buyer/MyRequirements.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  fetchBuyerRequirements,
  createBuyerRequirement,
  deleteBuyerRequirement,
  fetchListings,
  calculateMatch,
  subscribeToData
} from '../../api/dataLayer';
import ListingDetailsModal from '../common/ListingDetailsModal';
import {
  PlusCircle,
  FileText,
  Calendar,
  MapPin,
  Sparkles,
  Trash2,
  Layers,
  CheckCircle2,
  X,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function MyRequirements({ onNavigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [requirements, setRequirements] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedListingForModal, setSelectedListingForModal] = useState(null);
  const [activeReqForMatching, setActiveReqForMatching] = useState(null);

  // Form state
  const [cropType, setCropType] = useState('paddy');
  const [wasteType, setWasteType] = useState('straw');
  const [quantityTons, setQuantityTons] = useState('50');
  const [preferredLocation, setPreferredLocation] = useState('Punjab');
  const [maxPricePerTon, setMaxPricePerTon] = useState('1600');
  const [requiredDate, setRequiredDate] = useState('2026-10-15');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    const reqs = fetchBuyerRequirements().filter((r) => r.buyerId === user.id);
    setRequirements(reqs);
    setAllListings(fetchListings());
    if (reqs.length > 0 && !activeReqForMatching) {
      setActiveReqForMatching(reqs[0]);
    }
  };

  useEffect(() => {
    load();
    return subscribeToData(load);
  }, [user.id]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreateRequirement = (e) => {
    e.preventDefault();
    setError('');

    const qty = parseFloat(quantityTons);
    const price = parseFloat(maxPricePerTon);

    if (qty <= 0 || price <= 0) {
      setError('Quantity and maximum price must be positive numbers');
      return;
    }

    try {
      const created = createBuyerRequirement({
        cropType,
        wasteType,
        quantityTons: qty,
        preferredLocation,
        maxPricePerTon: price,
        requiredDate,
      });
      setShowCreateModal(false);
      setActiveReqForMatching(created);
      showToastMsg('Procurement requirement posted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (reqId) => {
    if (window.confirm('Delete this procurement requirement?')) {
      try {
        deleteBuyerRequirement(reqId);
        showToastMsg('Requirement removed.');
        if (activeReqForMatching?.id === reqId) {
          setActiveReqForMatching(null);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Find matching listings for active requirement
  const matchingListings = activeReqForMatching
    ? allListings
        .map((l) => ({
          ...l,
          match: calculateMatch(l, activeReqForMatching),
        }))
        .filter((l) => l.match.score >= 40)
        .sort((a, b) => b.match.score - a.match.score)
    : [];

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header flex justify-between items-center mb-2">
        <div>
          <h1 className="page-title">{t('myRequirements')}</h1>
          <p className="page-subtitle">
            Manage your industrial biomass procurement specifications and discover instantly matched farmer harvests.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => setShowCreateModal(true)}>
          <PlusCircle size={18} /> {t('createRequirement')}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Left: Requirements List */}
        <div className="card" style={{ padding: '1rem' }}>
          <h3 className="mb-1">Active Sourcing Notices ({requirements.length})</h3>
          <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
            Select a requirement to inspect matching farm listings.
          </p>

          {requirements.length === 0 ? (
            <div className="text-center p-3 text-muted" style={{ fontSize: '0.9rem' }}>
              No requirements posted yet. Click <strong>"Post Procurement Requirement"</strong> to publish demand specs.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {requirements.map((req) => {
                const isSelected = activeReqForMatching?.id === req.id;
                return (
                  <div
                    key={req.id}
                    className={`requirement-item-box ${isSelected ? 'active' : ''}`}
                    onClick={() => setActiveReqForMatching(req)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-brand" style={{ textTransform: 'capitalize' }}>
                          {req.cropType} {req.wasteType}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          Volume: <strong>{req.quantityTons} Tons</strong> • Ceiling: ₹{req.maxPricePerTon}/T
                        </div>
                        <div className="text-muted flex items-center gap-1 mt-1" style={{ fontSize: '0.75rem' }}>
                          <MapPin size={12} /> {req.preferredLocation} • By {req.requiredDate}
                        </div>
                      </div>

                      <button
                        className="btn-icon text-danger"
                        title="Delete Requirement"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(req.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Center & Right: Matching Listings for Selected Requirement */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          {activeReqForMatching ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                    Matching Residue Lots for: {activeReqForMatching.cropType} {activeReqForMatching.wasteType}
                  </h3>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Requirement Target: {activeReqForMatching.quantityTons} Tons in {activeReqForMatching.preferredLocation}
                  </span>
                </div>
                <span className="badge badge-accent">
                  {matchingListings.length} Matches Found
                </span>
              </div>

              {matchingListings.length === 0 ? (
                <div className="text-center p-3 text-muted">
                  No listings found matching this requirement specification yet.
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-2">
                  {matchingListings.map((l) => (
                    <div
                      key={l.id}
                      className="matched-listing-row flex justify-between items-center p-2"
                      style={{ background: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)' }}
                    >
                      <div>
                        <div className="flex items-center gap-1">
                          <strong style={{ fontSize: '1.05rem', textTransform: 'capitalize' }}>
                            {l.wasteType} ({l.cropType})
                          </strong>
                          <span className="badge badge-accent flex items-center gap-1" style={{ fontSize: '0.75rem' }}>
                            <Sparkles size={11} /> {l.match.score}% Match
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                          Farmer: <strong>{l.farmerName}</strong> • Location: {l.location}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                          Available: <strong>{l.quantityTons} Tons</strong> @ <strong className="text-accent">₹{l.pricePerTon}/T</strong>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          className="btn-outline"
                          onClick={() => setSelectedListingForModal(l)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4 text-muted">
              Select or create a requirement to view matching farmer listings.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Requirement */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center">
              <h2>Post Procurement Requirement</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRequirement}>
              <div className="modal-body">
                {error && (
                  <div className="alert-error mb-2 flex items-center gap-1">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label">{t('cropType')}</label>
                    <select
                      value={cropType}
                      onChange={(e) => {
                        setCropType(e.target.value);
                        if (e.target.value === 'paddy') setWasteType('straw');
                        if (e.target.value === 'sugarcane') setWasteType('bagasse');
                        if (e.target.value === 'wheat') setWasteType('straw');
                        if (e.target.value === 'cotton') setWasteType('stalks');
                      }}
                      className="form-select"
                    >
                      <option value="paddy">Paddy</option>
                      <option value="wheat">Wheat</option>
                      <option value="sugarcane">Sugarcane</option>
                      <option value="cotton">Cotton</option>
                      <option value="maize">Maize</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">{t('wasteType')}</label>
                    <input
                      type="text"
                      value={wasteType}
                      onChange={(e) => setWasteType(e.target.value)}
                      className="form-input"
                      placeholder="e.g. straw, bagasse, husk"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Required Quantity (Tons)</label>
                    <input
                      type="number"
                      step="1"
                      value={quantityTons}
                      onChange={(e) => setQuantityTons(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Maximum Price Ceiling (₹/Ton)</label>
                    <input
                      type="number"
                      step="10"
                      value={maxPricePerTon}
                      onChange={(e) => setMaxPricePerTon(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Preferred Sourcing Region</label>
                    <input
                      type="text"
                      value={preferredLocation}
                      onChange={(e) => setPreferredLocation(e.target.value)}
                      className="form-input"
                      placeholder="e.g. Punjab, Haryana"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Required By Date</label>
                    <input
                      type="date"
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="notice-banner mt-2">
                  <strong>Notice:</strong> {t('liveSyncNotice')}
                </div>
              </div>

              <div className="modal-footer flex justify-end gap-1">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Publish Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Listing Details Modal */}
      {selectedListingForModal && (
        <ListingDetailsModal
          listing={selectedListingForModal}
          onClose={() => setSelectedListingForModal(null)}
          onNavigateToChat={() => onNavigate('messages')}
          userRequirement={activeReqForMatching}
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
