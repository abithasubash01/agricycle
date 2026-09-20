// src/components/common/ListingDetailsModal.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { expressInterest, startConversation, calculateMatch } from '../../api/dataLayer';
import { X, MapPin, Calendar, CheckCircle2, MessageSquare, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ListingDetailsModal({ listing, onClose, onNavigateToChat, userRequirement }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!listing) return null;

  const isBuyer = user?.role === 'buyer';
  const isFarmer = user?.role === 'farmer';
  const isOwner = user?.id === listing.farmerId;
  const isInterested = isBuyer && (listing.interestedBuyers || []).some(b => b.buyerId === user.id);

  // Compute AI match score and reasons based on buyer requirement or buyer industry profile
  const matchResult = calculateMatch(listing, userRequirement || {
    cropType: listing.cropType,
    wasteType: listing.wasteType,
    maxPricePerTon: listing.pricePerTon + 200,
    preferredLocation: listing.location ? listing.location.split(',')[1]?.trim() : 'India',
  });

  const handleInterest = () => {
    try {
      expressInterest(listing.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChat = () => {
    try {
      startConversation(listing.id, listing.farmerId);
      if (onNavigateToChat) {
        onNavigateToChat();
      }
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1">
              <span className="badge badge-primary">{listing.cropType?.toUpperCase()}</span>
              <span className="badge badge-outline">{listing.status || 'Published'}</span>
            </div>
            <h2 className="mt-1" style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>
              {listing.wasteType} Residue
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* AI Match Banner */}
          <div className="ai-match-card">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Sparkles size={20} color="var(--color-accent)" />
                <strong>{t('matchScore')}: {matchResult.score}%</strong>
              </div>
              <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Heuristic & Specification Matching</span>
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Why this listing matches:</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {matchResult.reasons.map((r, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="detail-item">
              <span className="detail-label">Farmer / Producer</span>
              <span className="detail-val font-bold">{listing.farmerName}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Location</span>
              <span className="detail-val flex items-center gap-1">
                <MapPin size={16} color="var(--color-brand-primary)" /> {listing.location}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Crop & Waste Type</span>
              <span className="detail-val font-semibold">{listing.cropType} • {listing.wasteType}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Farm Cultivation Area</span>
              <span className="detail-val">{listing.farmArea ? `${listing.farmArea} Acres` : 'N/A'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Available Quantity</span>
              <span className="detail-val text-brand font-bold" style={{ fontSize: '1.1rem' }}>
                {listing.quantityTons} Tons
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">AI Estimated Yield</span>
              <span className="detail-val">
                {listing.aiEstimatedTons ? `${listing.aiEstimatedTons} Tons (~${((listing.quantityTons/listing.aiEstimatedTons)*100).toFixed(0)}% harvested)` : `${listing.quantityTons} Tons`}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Expected Price</span>
              <span className="detail-val font-bold text-accent" style={{ fontSize: '1.2rem' }}>
                ₹{listing.pricePerTon} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ ton</span>
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Estimated Lot Value</span>
              <span className="detail-val font-bold" style={{ fontSize: '1.1rem' }}>
                ₹{((listing.quantityTons || 0) * (listing.pricePerTon || 0)).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Date Posted</span>
              <span className="detail-val flex items-center gap-1">
                <Calendar size={15} color="var(--color-text-muted)" />
                {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Buyer Interest Count</span>
              <span className="detail-val font-semibold">
                {(listing.interestedBuyers || []).length} Inquiries
              </span>
            </div>
          </div>

          {/* Prototype disclaimer notice */}
          <div className="notice-banner mt-2">
            <span style={{ fontWeight: 600 }}>Demo / Prototype Notice:</span> {t('prototypeNotice')}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer flex justify-between items-center mt-2">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>

          <div className="flex gap-1">
            {isBuyer && (
              <>
                <button
                  className={isInterested ? 'btn-success flex items-center gap-1' : 'btn-primary flex items-center gap-1'}
                  onClick={handleInterest}
                  disabled={isInterested}
                >
                  <CheckCircle2 size={18} />
                  {isInterested ? t('interested') : t('imInterested')}
                </button>

                <button
                  className="btn-accent flex items-center gap-1"
                  onClick={handleChat}
                  title="Direct message with farmer"
                >
                  <MessageSquare size={18} />
                  {t('startChat')}
                </button>
              </>
            )}

            {isFarmer && isOwner && (
              <span className="text-muted" style={{ fontSize: '0.9rem', alignSelf: 'center' }}>
                Your active listing
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
