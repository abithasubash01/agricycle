import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { listingsApi, buyersApi, opportunitiesApi } from '../../api/index';
import {
  Loader2, Package, TrendingUp, RefreshCw, Plus, X,
  MapPin, ChevronRight, ShoppingCart, CheckCircle2, Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RESIDUE_TYPES = [
  { value: 'rice_straw', label: 'Rice Straw' },
  { value: 'wheat_straw', label: 'Wheat Straw' },
  { value: 'sugarcane_bagasse', label: 'Sugarcane Bagasse' },
  { value: 'corn_stalks', label: 'Corn Stalks' },
  { value: 'other', label: 'Other' },
];

const USE_TYPES = [
  'Biomass Fuel', 'Compost', 'Biogas',
  'Animal Feed', 'Packaging Material', 'Other',
];

// ── Summary Card
function SummaryCard({ icon: Icon, label, value, sub, color = '#edf7f0', iconColor = '#2a8a48' }) {
  return (
    <div className="summary-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div className="summary-card-icon" style={{ background: color }}>
          <Icon size={20} color={iconColor} />
        </div>
        <div>
          <p style={{ fontSize: '13px', color: '#838b96', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
          <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#14181f', fontFamily: 'Poppins, sans-serif', lineHeight: 1.1 }}>
            {value}
          </p>
          {sub && <p style={{ fontSize: '11px', color: '#adb2ba', marginTop: '4px' }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Residue Listing Details Modal
function ResidueListingModal({ listing, onClose, onOpportunitySaved }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'empty' | 'error'
  const [matches, setMatches] = useState([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [savingContract, setSavingContract] = useState(false);

  // Keyboard accessibility: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!listing) return null;

  const handleAnalyze = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await buyersApi.match({
        listing_id: listing.id,
        residue_type: listing.residue_type,
        quantity: Number(listing.residue_quantity_kg),
        farmerLocation: listing.location,
      });

      const foundMatches = res.data?.matches || [];
      if (foundMatches.length === 0) {
        setMatches([]);
        setStatus('empty');
      } else {
        setMatches(foundMatches);
        setSelectedMatchIndex(0);
        setStatus('success');
        toast.success(`Found ${foundMatches.length} matching opportunit${foundMatches.length > 1 ? 'ies' : 'y'}!`);
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.data?.matches?.length === 0) {
        setMatches([]);
        setStatus('empty');
      } else {
        setStatus('error');
        setErrorMessage(err.userMessage || 'Failed to match buyer requirements. Please try again.');
      }
    }
  };

  const handleSaveOpportunity = async (match) => {
    setSavingContract(true);
    try {
      await opportunitiesApi.analyze({
        listing_id: listing.id,
        buyer_requirement_id: match.requirementId,
        quantity: match.matchedQuantity,
        buyerPricePerKg: match.offeredPrice,
        transportCost: match.transportCost,
        handlingCostPercent: 5,
      });
      toast.success('Opportunity saved to your dashboard!');
      if (onOpportunitySaved) onOpportunitySaved();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to save opportunity');
    } finally {
      setSavingContract(false);
    }
  };

  const activeMatch = matches[selectedMatchIndex] || null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-details-title"
    >
      <div
        className="modal-panel"
        style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px 28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '4px' }}>Listing Inspection</div>
              <h2 id="listing-details-title" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#14181f' }}>
                Residue Listing Details
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#838b96' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#14181f'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#838b96'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Listing Details Card */}
          <div style={{ background: '#f5f8f6', borderRadius: '14px', border: '1px solid #e1ebe4', padding: '18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0d2e18', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {listing.crop}
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#4e5662', background: '#e1ebe4', padding: '2px 8px', borderRadius: '6px' }}>
                    {listing.residue_type?.replace(/_/g, ' ')}
                  </span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#667085', fontSize: '13px', marginTop: '4px' }}>
                  <MapPin size={13} color="#2a8a48" /> {listing.location}
                </div>
              </div>
              <span className={listing.status === 'available' ? 'badge-available' : 'badge-matched'}>
                {listing.status || 'Available'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', paddingTop: '10px', borderTop: '1px solid #e1ebe4' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#838b96', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Residue Quantity</p>
                <p style={{ fontWeight: 700, fontSize: '15px', color: '#1e6e38', marginTop: '2px' }}>
                  {Number(listing.residue_quantity_kg).toLocaleString('en-IN')} kg
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#838b96', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Farmer</p>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#14181f', marginTop: '2px' }}>
                  {listing.farmer_name || 'Registered Farmer'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#838b96', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Harvest Quantity</p>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#3d434d', marginTop: '2px' }}>
                  {listing.harvest_quantity_kg ? `${Number(listing.harvest_quantity_kg).toLocaleString('en-IN')} kg` : 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#838b96', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Listing Date</p>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#3d434d', marginTop: '2px' }}>
                  {new Date(listing.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button: Analyze Opportunity */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleAnalyze}
              disabled={status === 'loading'}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(42, 138, 72, 0.25)',
              }}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing Opportunity with Backend API...
                </>
              ) : (
                <>
                  <TrendingUp size={16} />
                  Analyze Opportunity
                </>
              )}
            </button>
          </div>

          {/* State 1: Loading */}
          {status === 'loading' && (
            <div style={{ textAlign: 'center', padding: '36px 16px', background: '#fcfdfd', borderRadius: '12px', border: '1px dashed #cce8d4' }}>
              <Loader2 size={32} color="#2a8a48" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, color: '#17562c', fontSize: '15px', marginBottom: '4px' }}>
                Querying Real-Time Market Demand
              </p>
              <p style={{ fontSize: '13px', color: '#838b96' }}>
                Matching residue type ({listing.residue_type?.replace(/_/g, ' ')}) with buyer requirements and calculating transport cost from {listing.location}...
              </p>
            </div>
          )}

          {/* State 2: Error */}
          {status === 'error' && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 600, marginBottom: '6px' }}>
                <X size={16} /> Analysis Error
              </div>
              <p style={{ color: '#7f1d1d', fontSize: '13px', marginBottom: '12px' }}>{errorMessage}</p>
              <button
                onClick={handleAnalyze}
                className="btn-ghost"
                style={{ fontSize: '12px', padding: '6px 14px', color: '#991b1b', borderColor: '#fca5a5' }}
              >
                Retry Analysis
              </button>
            </div>
          )}

          {/* State 3: Empty (No Opportunities Found) */}
          {status === 'empty' && (
            <div className="empty-state" style={{ padding: '32px 16px', border: '1px dashed #d0d5dd', borderRadius: '14px', background: '#fafafa' }}>
              <Package size={36} color="#98a2b3" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#1f242e', marginBottom: '4px' }}>
                No Matching Opportunities Found
              </h4>
              <p style={{ fontSize: '13px', color: '#667085', maxWidth: '400px', margin: '0 auto 16px' }}>
                No active buyer requirements currently match <strong>{listing.residue_type?.replace(/_/g, ' ')}</strong> in proximity to <strong>{listing.location}</strong>.
              </p>
              <p style={{ fontSize: '12px', color: '#98a2b3' }}>
                You can post a new requirement for this residue type in the "My Requirements" tab.
              </p>
            </div>
          )}

          {/* State 4: Successful Results */}
          {status === 'success' && activeMatch && (
            <div>
              {/* If multiple matches, show comparison selector */}
              {matches.length > 1 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#17562c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Compare Opportunities ({matches.length} Found)
                    </p>
                    <span style={{ fontSize: '11px', color: '#667085' }}>Select an option to inspect formula</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${matches.length}, 1fr)`, gap: '10px' }}>
                    {matches.map((m, idx) => {
                      const isSelected = idx === selectedMatchIndex;
                      return (
                        <div
                          key={m.requirementId || idx}
                          onClick={() => setSelectedMatchIndex(idx)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedMatchIndex(idx); }}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #2a8a48' : '1px solid #e1ebe4',
                            background: isSelected ? '#edf7f0' : '#ffffff',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: isSelected ? '#17562c' : '#14181f' }}>
                              Option {idx + 1}: {m.buyerName}
                            </span>
                            {idx === 0 && (
                              <span style={{ fontSize: '10px', fontWeight: 700, background: '#2a8a48', color: '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
                                Top Profit
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#667085' }}>
                            <span>₹{m.offeredPrice}/kg · {m.distance} km</span>
                            <span style={{ fontWeight: 700, color: isSelected ? '#1e6e38' : '#14181f' }}>
                              ₹{Number(m.netValue).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Opportunity Card */}
              <div style={{ border: '1px solid #d5eddb', borderRadius: '16px', padding: '20px', background: '#fcfdfc', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: '#0d2e18' }}>
                        {activeMatch.buyerName}
                      </h4>
                      <span className="badge-available" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {activeMatch.matchScore}% Match
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#667085', fontSize: '13px', marginTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#2a8a48" /> {activeMatch.buyerLocation}
                      </span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Truck size={12} color="#2563eb" /> {activeMatch.distance} km away
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: '#838b96', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Net Value</p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#1e6e38', lineHeight: 1.1 }}>
                      ₹{Number(activeMatch.netValue).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Opportunity Spec Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ background: '#f5f8f6', padding: '10px 12px', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#838b96' }}>Buyer Price</p>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#14181f' }}>₹{activeMatch.offeredPrice}/kg</p>
                  </div>
                  <div style={{ background: '#f5f8f6', padding: '10px 12px', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#838b96' }}>Potential Use</p>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#14181f' }}>{activeMatch.useType || 'Industrial'}</p>
                  </div>
                  <div style={{ background: '#f5f8f6', padding: '10px 12px', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#838b96' }}>Matched Quantity</p>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#1e6e38' }}>{Number(activeMatch.matchedQuantity).toLocaleString('en-IN')} kg</p>
                  </div>
                  <div style={{ background: '#f5f8f6', padding: '10px 12px', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#838b96' }}>Status</p>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: activeMatch.isProfitable ? '#1e6e38' : '#dc2626' }}>
                      {activeMatch.isProfitable ? 'Profitable' : 'Deficit'}
                    </p>
                  </div>
                </div>

                {/* ── Formula Section ─────────────────────────────── */}
                <div style={{ background: '#ffffff', border: '1px solid #e1ebe4', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#17562c' }}>
                      Economic Formula Breakdown
                    </span>
                    <span style={{ fontSize: '11px', color: '#838b96' }}>
                      Standardized AgriCycle Model
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8faf9', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#3d434d' }}>
                        <strong>Gross Value</strong> ({Number(activeMatch.matchedQuantity).toLocaleString('en-IN')} kg × ₹{activeMatch.offeredPrice}/kg)
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#14181f' }}>
                        ₹{Number(activeMatch.grossValue).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8faf9', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#3d434d' }}>
                        <strong>− Transport Cost</strong> ({activeMatch.distance} km @ ₹2.5/km)
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#dc2626' }}>
                        −₹{Number(activeMatch.transportCost).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8faf9', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#3d434d' }}>
                        <strong>− Handling Cost</strong> (5% handling & storage)
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#dc2626' }}>
                        −₹{Number(activeMatch.handlingCost).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#edf7f0', borderRadius: '8px', border: '1px solid #cce8d4', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#17562c' }}>
                        = Estimated Net Value
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '16px', color: '#1e6e38' }}>
                        ₹{Number(activeMatch.netValue).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Opportunity Action */}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleSaveOpportunity(activeMatch)}
                    disabled={savingContract}
                    className="btn-primary"
                    style={{ fontSize: '13px', padding: '8px 18px', gap: '6px' }}
                  >
                    {savingContract ? (
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    {savingContract ? 'Saving...' : 'Save Opportunity'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer with Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #eef2ef', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ fontSize: '13px', padding: '9px 24px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Opportunity Modal
function OpportunityModal({ opportunity: o, onClose }) {
  if (!o) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '28px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#14181f' }}>
              Opportunity Details
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#838b96" />
            </button>
          </div>
          <div className="net-value-hero" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Estimated Net Value
            </p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#78c49e', fontFamily: 'Poppins, sans-serif' }}>
              ₹{Number(o.net_value ?? o.netValue ?? 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { label: 'Gross Value', value: `₹${Number(o.gross_value ?? o.grossValue ?? 0).toLocaleString('en-IN')}` },
            { label: 'Transport Cost', value: `−₹${Number(o.transport_cost ?? o.transportCost ?? 0).toLocaleString('en-IN')}`, negative: true },
            { label: 'Handling Cost', value: `−₹${Number(o.handling_cost ?? o.handlingCost ?? 0).toLocaleString('en-IN')}`, negative: true },
            { label: 'Estimated Net Value', value: `₹${Number(o.net_value ?? o.netValue ?? 0).toLocaleString('en-IN')}`, net: true },
          ].map((row) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderRadius: '10px',
              background: row.net ? '#edf7f0' : '#f5f8f6',
            }}>
              <span style={{ fontSize: '14px', color: row.net ? '#17562c' : '#3d434d', fontWeight: row.net ? 700 : 500 }}>{row.label}</span>
              <span style={{ fontWeight: 700, fontSize: row.net ? '16px' : '14px', color: row.net ? '#1e6e38' : row.negative ? '#dc2626' : '#14181f' }}>
                {row.value}
              </span>
            </div>
          ))}
          {o.distance_km && (
            <p style={{ fontSize: '12px', color: '#adb2ba', marginTop: '12px', textAlign: 'center' }}>
              Distance: {o.distance_km} km
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BuyerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('listings');

  const [farmerListings, setFarmerListings] = useState([]);
  const [myRequirements, setMyRequirements] = useState([]);
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [reqForm, setReqForm] = useState({
    residue_type: 'rice_straw',
    required_quantity_kg: '',
    use_type: 'Biomass Fuel',
    price_per_kg: '',
    location: user?.location || '',
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [listRes, reqRes, oppRes] = await Promise.all([
        listingsApi.list({ status: 'available' }),
        buyersApi.listRequirements({ buyer_id: user.id }),
        opportunitiesApi.list({ buyer_id: user.id }),
      ]);
      setFarmerListings(listRes.data.listings || []);
      setMyRequirements(reqRes.data.requirements || []);
      setMyOpportunities(oppRes.data.opportunities || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    if (!reqForm.required_quantity_kg || !reqForm.price_per_kg || !reqForm.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    setFormLoading(true);
    try {
      const res = await buyersApi.createRequirement({
        ...reqForm,
        required_quantity_kg: Number(reqForm.required_quantity_kg),
        price_per_kg: Number(reqForm.price_per_kg),
      });
      toast.success('Requirement posted!');
      setShowForm(false);
      setMyRequirements((prev) => [res.data.requirement, ...prev]);
      setTab('requirements');
    } catch (err) {
      toast.error(err.userMessage || 'Failed to create requirement');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRequirement = async (id) => {
    try {
      await buyersApi.deleteRequirement(id);
      setMyRequirements((prev) => prev.filter((r) => r.id !== id));
      toast.success('Requirement removed');
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete');
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', marginBottom: '16px' }}>
          You are not logged in
        </h2>
        <Link to="/login" className="btn-primary" style={{ justifyContent: 'center' }}>Sign In</Link>
      </div>
    );
  }

  if (user.role !== 'buyer') {
    return (
      <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', marginBottom: '16px' }}>
          Buyer account required
        </h2>
        <Link to="/farmer" style={{ color: '#1e6e38', textDecoration: 'underline' }}>Go to Farmer Dashboard</Link>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '6px' }}>Buyer Dashboard</div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#0d2e18', lineHeight: 1.2 }}>
                Source Agricultural Residue
              </h1>
              <p style={{ color: '#4e5662', fontSize: '14px', marginTop: '6px' }}>
                Welcome, {user.name} {user.location && `· ${user.location}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={fetchData} className="btn-ghost" style={{ fontSize: '13px' }}>
                <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
                style={{ fontSize: '13px', padding: '9px 20px' }}
              >
                <Plus size={15} /> Post Requirement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Requirement Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#14181f' }}>
                  Post Residue Requirement
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#838b96" />
                </button>
              </div>
              <p style={{ color: '#838b96', fontSize: '14px', marginBottom: '24px' }}>
                Tell farmers what you need. They will be matched automatically.
              </p>
              <form onSubmit={handleCreateRequirement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>
                    Residue Type
                  </label>
                  <select
                    value={reqForm.residue_type}
                    onChange={(e) => setReqForm((f) => ({ ...f, residue_type: e.target.value }))}
                    className="agri-select"
                  >
                    {RESIDUE_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>
                      Quantity Needed (kg)
                    </label>
                    <input
                      type="number" min="1"
                      value={reqForm.required_quantity_kg}
                      onChange={(e) => setReqForm((f) => ({ ...f, required_quantity_kg: e.target.value }))}
                      placeholder="e.g., 3000"
                      className="agri-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>
                      Offered Price (₹/kg)
                    </label>
                    <input
                      type="number" min="0.01" step="0.01"
                      value={reqForm.price_per_kg}
                      onChange={(e) => setReqForm((f) => ({ ...f, price_per_kg: e.target.value }))}
                      placeholder="e.g., 3"
                      className="agri-input"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>
                    Intended Use
                  </label>
                  <select
                    value={reqForm.use_type}
                    onChange={(e) => setReqForm((f) => ({ ...f, use_type: e.target.value }))}
                    className="agri-select"
                  >
                    {USE_TYPES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>
                    Your Location
                  </label>
                  <input
                    type="text"
                    value={reqForm.location}
                    onChange={(e) => setReqForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g., Chennai"
                    className="agri-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {formLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                    Post Requirement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <SummaryCard icon={Package} label="Available Listings" value={farmerListings.length || 0} sub="From farmers near you" color="#edf7f0" iconColor="#2a8a48" />
          <SummaryCard icon={ShoppingCart} label="My Requirements" value={myRequirements.length || 0} sub={myRequirements.length > 0 ? 'Active requirements' : 'No requirements posted'} color="#dbeafe" iconColor="#2563eb" />
          <SummaryCard icon={TrendingUp} label="Opportunities" value={myOpportunities.length || 0} sub={myOpportunities.length > 0 ? 'Matched opportunities' : 'None matched yet'} color="#faf7f0" iconColor="#b08254" />
        </div>

        {/* Tab Bar */}
        <div className="tab-bar">
          {[
            { id: 'listings', label: `Available Listings${farmerListings.length > 0 ? ` (${farmerListings.length})` : ''}` },
            { id: 'requirements', label: `My Requirements${myRequirements.length > 0 ? ` (${myRequirements.length})` : ''}` },
            { id: 'opportunities', label: `Opportunities${myOpportunities.length > 0 ? ` (${myOpportunities.length})` : ''}` },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-item ${tab === t.id ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <Loader2 size={32} color="#2a8a48" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Available Listings */}
            {tab === 'listings' && (
              <div>
                {farmerListings.length === 0 ? (
                  <div className="empty-state">
                    <Package size={40} color="#d0d3d7" style={{ marginBottom: '12px' }} />
                    <p style={{ color: '#838b96', marginBottom: '8px' }}>No farmer listings available yet.</p>
                    <p style={{ fontSize: '13px', color: '#adb2ba' }}>Post a requirement so farmers know what you need.</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: '16px', fontSize: '13px', padding: '10px 20px' }}>
                      <Plus size={14} /> Post Requirement
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {farmerListings.map((l) => (
                      <div
                        key={l.id}
                        className="listing-card"
                        tabIndex={0}
                        role="button"
                        aria-label={`View residue listing details for ${l.crop} by ${l.farmer_name || 'Registered Farmer'}`}
                        onClick={() => setSelectedListing(l)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedListing(l);
                          }
                        }}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          outline: 'none',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                            <div>
                              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#14181f', textTransform: 'capitalize', marginBottom: '4px' }}>
                                {l.crop}
                              </h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#838b96', fontSize: '13px' }}>
                                <MapPin size={11} /> {l.location}
                              </div>
                            </div>
                            <span className="badge-available">Available</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                            {[
                              { label: 'Residue Type', value: l.residue_type?.replace(/_/g, ' ') },
                              { label: 'Quantity', value: `${Number(l.residue_quantity_kg).toLocaleString('en-IN')} kg`, highlight: true },
                              { label: 'Farmer', value: l.farmer_name || 'Registered Farmer' },
                            ].map((row) => (
                              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: '#838b96' }}>{row.label}</span>
                                <span style={{ fontWeight: row.highlight ? 700 : 500, color: row.highlight ? '#1e6e38' : '#14181f' }}>
                                  {row.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ paddingTop: '12px', borderTop: '1px solid #f0f3f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#adb2ba' }}>
                            {new Date(l.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span style={{ fontSize: '12px', color: '#1e6e38', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Analyze Listing <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Requirements */}
            {tab === 'requirements' && (
              <div>
                {myRequirements.length === 0 ? (
                  <div className="empty-state">
                    <ShoppingCart size={40} color="#d0d3d7" style={{ marginBottom: '12px' }} />
                    <p style={{ color: '#838b96', marginBottom: '16px' }}>No requirements posted yet.</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px' }}>
                      Post Your First Requirement
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {myRequirements.map((r) => (
                      <div key={r.id} className="listing-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                          <div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#14181f', textTransform: 'capitalize', marginBottom: '4px' }}>
                              {r.residue_type?.replace(/_/g, ' ')}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#838b96', fontSize: '13px' }}>
                              <MapPin size={11} /> {r.location}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteRequirement(r.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#adb2ba' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#adb2ba'}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                          {[
                            { label: 'Quantity Needed', value: `${Number(r.required_quantity_kg).toLocaleString('en-IN')} kg` },
                            { label: 'Offered Price', value: `₹${r.price_per_kg}/kg`, highlight: true },
                            { label: 'Intended Use', value: r.use_type },
                          ].map((row) => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                              <span style={{ color: '#838b96' }}>{row.label}</span>
                              <span style={{ fontWeight: row.highlight ? 700 : 500, color: row.highlight ? '#1e6e38' : '#14181f' }}>
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>
                        <span className={r.status === 'active' ? 'badge-available' : 'badge-matched'}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Opportunities */}
            {tab === 'opportunities' && (
              <div>
                {myOpportunities.length === 0 ? (
                  <div className="empty-state">
                    <TrendingUp size={40} color="#d0d3d7" style={{ marginBottom: '12px' }} />
                    <p style={{ color: '#838b96', marginBottom: '8px' }}>No opportunities yet.</p>
                    <p style={{ fontSize: '13px', color: '#adb2ba' }}>Post a requirement and farmers will be matched automatically.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {myOpportunities.map((o) => (
                      <div key={o.id} className="listing-card" style={{ cursor: 'pointer' }} onClick={() => setDetailModal(o)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#14181f', marginBottom: '4px' }}>
                              {o.farmer_name || 'Registered Farmer'}
                            </h3>
                            <p style={{ fontSize: '13px', color: '#838b96' }}>
                              {o.listing ? `${o.listing.crop} · ${o.listing.location}` : 'Listing details'}
                            </p>
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e6e38', fontFamily: 'Poppins, sans-serif' }}>
                            ₹{Number(o.net_value).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                          {[
                            { label: 'Gross', value: `₹${Number(o.gross_value).toLocaleString('en-IN')}`, color: '#14181f', bg: '#f5f8f6' },
                            { label: 'Distance', value: `${o.distance_km} km`, color: '#2563eb', bg: '#eff6ff' },
                            { label: 'Net Value', value: `₹${Number(o.net_value).toLocaleString('en-IN')}`, color: '#1e6e38', bg: '#edf7f0' },
                          ].map((item) => (
                            <div key={item.label} style={{ background: item.bg, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                              <p style={{ fontSize: '10px', color: '#adb2ba', marginBottom: '4px' }}>{item.label}</p>
                              <p style={{ fontWeight: 700, fontSize: '12px', color: item.color }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ fontSize: '11px', color: '#adb2ba' }}>
                            {new Date(o.created_at).toLocaleDateString('en-IN')}
                          </p>
                          <span style={{ fontSize: '12px', color: '#1e6e38', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View Details <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedListing && (
        <ResidueListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onOpportunitySaved={() => {
            fetchData();
          }}
        />
      )}
      {detailModal && <OpportunityModal opportunity={detailModal} onClose={() => setDetailModal(null)} />}
    </>
  );
}

export default BuyerDashboard;
