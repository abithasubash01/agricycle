// src/components/buyer/BuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  fetchListings,
  fetchBuyerRequirements,
  fetchTransactions,
  fetchConversations,
  calculateMatch,
  subscribeToData
} from '../../api/dataLayer';
import StatCard from '../common/StatCard';
import ListingDetailsModal from '../common/ListingDetailsModal';
import {
  Search,
  Scale,
  FileText,
  Heart,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Truck
} from 'lucide-react';

export default function BuyerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedListingForModal, setSelectedListingForModal] = useState(null);

  const load = () => {
    const allListings = fetchListings();
    setListings(allListings);
    setRequirements(fetchBuyerRequirements().filter((r) => r.buyerId === user.id));
    setTransactions(fetchTransactions().filter((tr) => tr.buyerId === user.id));
    setConversations(fetchConversations());
  };

  useEffect(() => {
    load();
    return subscribeToData(load);
  }, [user.id]);

  // Aggregate metrics
  const totalAvailableWasteTons = listings.reduce((sum, l) => sum + (Number(l.quantityTons) || 0), 0);
  const activeReqsCount = requirements.length;
  const interestedListings = listings.filter((l) =>
    (l.interestedBuyers || []).some((b) => b.buyerId === user.id)
  );
  const totalPotentialSupply = interestedListings.reduce((sum, l) => sum + (Number(l.quantityTons) || 0), 0);

  // Recommended Listings: Highest match scores based on buyer industry & requirements
  const recommendedListings = [...listings]
    .map((l) => {
      const match = calculateMatch(l, requirements[0] || {
        cropType: 'paddy',
        wasteType: 'straw',
        maxPricePerTon: 1600,
        preferredLocation: 'Punjab',
      });
      return { ...l, matchScore: match.score, matchReasons: match.reasons };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">{t('buyerDashboard')}</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user.name}</strong>. Raw material procurement overview, biomass supply pipeline, and farmer inquiries.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => onNavigate('discover-waste')}>
          <Search size={18} /> Discover Farm Residue
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        <StatCard
          title="Market Biomass Available"
          value={`${totalAvailableWasteTons} Tons`}
          subtitle="Across active verified farms"
          icon={Scale}
          color="#15803d"
          badge="Live Supply"
        />
        <StatCard
          title="Active Requirements"
          value={activeReqsCount}
          subtitle="Procurement notices posted"
          icon={FileText}
          color="#0284c7"
        />
        <StatCard
          title="Interested Inquiries"
          value={interestedListings.length}
          subtitle="Shortlisted farm lots"
          icon={Heart}
          color="#ea580c"
          badge="In Pipeline"
        />
        <StatCard
          title="Potential Supply Pipeline"
          value={`${totalPotentialSupply} Tons`}
          subtitle="Residue under active review"
          icon={Truck}
          color="#9333ea"
        />
      </div>

      {/* Recommended Sourcing Opportunities */}
      <div className="card mt-2">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1">
            <Sparkles size={20} color="var(--color-accent)" />
            <h3 style={{ margin: 0 }}>Recommended Biomass Lots For Your Facility</h3>
          </div>
          <button className="btn-link flex items-center gap-1" onClick={() => onNavigate('discover-waste')}>
            View All Residue <ArrowRight size={15} />
          </button>
        </div>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          AI-matched with your industrial procurement requirements and manufacturing feedstock specs.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {recommendedListings.map((l) => (
            <div key={l.id} className="recommended-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="badge badge-primary">{l.cropType?.toUpperCase()}</span>
                  <span className="badge badge-accent flex items-center gap-1">
                    <Sparkles size={12} /> {l.matchScore}% Match
                  </span>
                </div>

                <h4 style={{ textTransform: 'capitalize', fontSize: '1.1rem', margin: '4px 0' }}>
                  {l.wasteType} Residue
                </h4>

                <div className="text-muted flex items-center gap-1" style={{ fontSize: '0.85rem' }}>
                  <MapPin size={14} color="var(--color-brand-primary)" /> {l.location}
                </div>

                <div className="flex justify-between items-center mt-2 pt-1" style={{ borderTop: '1px dashed var(--color-border)' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Volume:</span>
                    <div className="font-bold">{l.quantityTons} Tons</div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Offered Rate:</span>
                    <div className="font-bold text-accent">₹{l.pricePerTon}/T</div>
                  </div>
                </div>
              </div>

              <button
                className="btn-outline w-full mt-2"
                onClick={() => setSelectedListingForModal(l)}
              >
                View Listing Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Procurement Activity & Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {/* Recent Procurement Activity */}
        <div className="card">
          <div className="flex justify-between items-center mb-1">
            <h3>Recent Procurement Deals</h3>
            <button className="btn-link" onClick={() => onNavigate('procurement')}>
              Full Pipeline
            </button>
          </div>

          {transactions.length === 0 ? (
            <p className="text-muted p-2">No procurement activity yet. Browse residues and click "I'm Interested" to initiate off-take discussions.</p>
          ) : (
            <div className="timeline-list">
              {transactions.slice(0, 3).map((tr) => (
                <div key={tr.id} className="timeline-item flex items-start gap-1">
                  <div className="timeline-marker" />
                  <div style={{ flex: 1 }}>
                    <div className="flex justify-between items-center">
                      <strong style={{ textTransform: 'capitalize' }}>
                        {tr.quantityTons}T {tr.cropType} {tr.wasteType}
                      </strong>
                      <span className={`badge badge-status-${tr.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {tr.status}
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      Farmer: {tr.farmerName} ({tr.location})
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                      Estimated Value: ₹{tr.totalValue?.toLocaleString('en-IN')} (Demo Tracking)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="mb-1">Buyer Procurement Workflows</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Procure farmgate biomass directly from verified farmers
            </p>

            <div className="flex flex-col gap-1">
              <button
                className="action-tile flex items-center justify-between"
                onClick={() => onNavigate('discover-waste')}
              >
                <div className="flex items-center gap-1">
                  <Search size={18} color="var(--color-brand-primary)" />
                  <span>Discover Farm Waste in Marketplace</span>
                </div>
                <ArrowRight size={16} />
              </button>

              <button
                className="action-tile flex items-center justify-between"
                onClick={() => onNavigate('my-requirements')}
              >
                <div className="flex items-center gap-1">
                  <FileText size={18} color="var(--color-accent)" />
                  <span>Post Procurement Demand Notice</span>
                </div>
                <span className="badge badge-primary">{activeReqsCount}</span>
              </button>

              <button
                className="action-tile flex items-center justify-between"
                onClick={() => onNavigate('interested-listings')}
              >
                <div className="flex items-center gap-1">
                  <Heart size={18} color="#e11d48" />
                  <span>View Shortlisted Lots</span>
                </div>
                <span className="badge badge-subtle">{interestedListings.length}</span>
              </button>

              <button
                className="action-tile flex items-center justify-between"
                onClick={() => onNavigate('messages')}
              >
                <div className="flex items-center gap-1">
                  <MessageSquare size={18} color="#0284c7" />
                  <span>Farmer Inquiries & Chats</span>
                </div>
                <span className="badge badge-accent">{conversations.length}</span>
              </button>
            </div>
          </div>

          <div className="text-muted text-center mt-2" style={{ fontSize: '0.75rem' }}>
            {t('liveSyncNotice')}
          </div>
        </div>
      </div>

      {/* Listing Details Modal */}
      {selectedListingForModal && (
        <ListingDetailsModal
          listing={selectedListingForModal}
          onClose={() => setSelectedListingForModal(null)}
          onNavigateToChat={() => onNavigate('messages')}
        />
      )}
    </div>
  );
}
