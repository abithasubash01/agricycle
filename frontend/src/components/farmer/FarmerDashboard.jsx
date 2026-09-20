// src/components/farmer/FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchListings, fetchConversations, fetchTransactions, fetchBuyerRequirements, subscribeToData } from '../../api/dataLayer';
import StatCard from '../common/StatCard';
import {
  Layers,
  Scale,
  Users,
  BadgeIndianRupee,
  Sparkles,
  PlusCircle,
  ArrowRight,
  MessageSquare,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function FarmerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [buyerReqs, setBuyerReqs] = useState([]);

  // AI Estimator Widget State
  const [calcCrop, setCalcCrop] = useState('paddy');
  const [calcAcres, setCalcAcres] = useState('12');
  const [calcEstimatedTons, setCalcEstimatedTons] = useState(18);
  const [calcPotentialRevenue, setCalcPotentialRevenue] = useState(27000);

  useEffect(() => {
    const load = () => {
      const allListings = fetchListings();
      const myListings = allListings.filter((l) => l.farmerId === user.id);
      setListings(myListings);
      setConversations(fetchConversations());
      setTransactions(fetchTransactions().filter((tr) => tr.farmerId === user.id));
      setBuyerReqs(fetchBuyerRequirements());
    };
    load();
    return subscribeToData(load);
  }, [user.id]);

  // Dynamic AI Estimator calculation
  useEffect(() => {
    const acres = parseFloat(calcAcres);
    if (!isNaN(acres) && acres > 0) {
      let multiplier = 1.5;
      let avgRate = 1500;
      if (calcCrop === 'sugarcane') { multiplier = 3.5; avgRate = 900; }
      if (calcCrop === 'wheat') { multiplier = 1.2; avgRate = 1350; }
      if (calcCrop === 'cotton') { multiplier = 1.8; avgRate = 1200; }
      if (calcCrop === 'maize') { multiplier = 1.6; avgRate = 1100; }

      const tons = Math.round(acres * multiplier);
      setCalcEstimatedTons(tons);
      setCalcPotentialRevenue(tons * avgRate);
    } else {
      setCalcEstimatedTons(0);
      setCalcPotentialRevenue(0);
    }
  }, [calcCrop, calcAcres]);

  // Aggregate Metrics
  const activeListingsCount = listings.filter((l) => l.status !== 'Closed').length;
  const totalWasteTons = listings.reduce((sum, l) => sum + (Number(l.quantityTons) || 0), 0);
  const totalInterestsCount = listings.reduce((sum, l) => sum + ((l.interestedBuyers || []).length), 0);
  const potentialRevenue = listings.reduce((sum, l) => sum + ((Number(l.quantityTons) || 0) * (Number(l.pricePerTon) || 0)), 0);

  return (
    <div className="portal-page">
      {/* Header Banner */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">{t('farmerDashboard')}</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user.name}</strong>. Manage residue harvests, incoming buyer interest, and biomass revenues.
          </p>
        </div>
        <div className="flex gap-1">
          <button className="btn-primary flex items-center gap-1" onClick={() => onNavigate('my-listings')}>
            <PlusCircle size={18} /> {t('createListing')}
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        <StatCard
          title="Active Listings"
          value={activeListingsCount}
          subtitle="Currently in marketplace"
          icon={Layers}
          color="#2e7d32"
          badge="Live"
        />
        <StatCard
          title="Total Waste Listed"
          value={`${totalWasteTons} Tons`}
          subtitle="Biomass diverted from burning"
          icon={Scale}
          color="#15803d"
        />
        <StatCard
          title="Buyer Inquiries"
          value={totalInterestsCount}
          subtitle="From verified biomass buyers"
          icon={Users}
          color="#ea580c"
          badge="High Demand"
        />
        <StatCard
          title="Potential Revenue"
          value={`₹${potentialRevenue.toLocaleString('en-IN')}`}
          subtitle="Estimated residue gross value"
          icon={BadgeIndianRupee}
          color="#0284c7"
        />
      </div>

      {/* Quick Actions & AI Estimator Row */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {/* AI Waste Estimator Widget */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1">
              <Sparkles size={20} color="var(--color-accent)" />
              <h3 style={{ margin: 0 }}>AI-Assisted Crop Residue Estimator</h3>
            </div>
            <span className="badge badge-accent">Interactive Heuristic</span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            Compute your potential crop residue yield and estimated market value before listing for sale.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="form-label">{t('cropType')}</label>
              <select
                value={calcCrop}
                onChange={(e) => setCalcCrop(e.target.value)}
                className="form-select"
              >
                <option value="paddy">Paddy (Rice Straw)</option>
                <option value="wheat">Wheat (Wheat Straw)</option>
                <option value="sugarcane">Sugarcane (Bagasse & Tops)</option>
                <option value="cotton">Cotton (Cotton Stalks)</option>
                <option value="maize">Maize (Corn Stalks)</option>
              </select>

              <label className="form-label mt-1">{t('farmArea')}</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={calcAcres}
                onChange={(e) => setCalcAcres(e.target.value)}
                className="form-input"
                placeholder="e.g. 10"
              />
            </div>

            <div className="ai-estimate-summary-box flex flex-col justify-between">
              <div>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Estimated Residue Yield</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                  {calcEstimatedTons} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Tons</span>
                </div>

                <div className="mt-1">
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>{t('potentialRevenue')}</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    ₹{calcPotentialRevenue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <button
                className="btn-outline flex items-center justify-center gap-1 mt-1"
                onClick={() => onNavigate('my-listings')}
              >
                List This Harvest Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="mb-1">Quick Actions</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Common producer workflows
            </p>

            <div className="flex flex-col gap-1">
              <button
                className="action-tile flex items-center justify-between"
                onClick={() => onNavigate('my-listings')}
              >
                <div className="flex items-center gap-1">
                  <Layers size={18} color="var(--color-brand-primary)" />
                  <span>Manage Active Listings</span>
                </div>
                <ArrowRight size={16} />
              </button>

              <button
                className="action-tile flex items-center justify-between"
                onClick={() => onNavigate('buyer-requests')}
              >
                <div className="flex items-center gap-1">
                  <Users size={18} color="var(--color-accent)" />
                  <span>Browse Buyer Demands</span>
                </div>
                <span className="badge badge-primary">{buyerReqs.length}</span>
              </button>

              <button
                className="action-tile flex items-center justify-between"
                onClick={() => onNavigate('sales-transactions')}
              >
                <div className="flex items-center gap-1">
                  <BadgeIndianRupee size={18} color="#0284c7" />
                  <span>Sales & Deal Tracking</span>
                </div>
                <ArrowRight size={16} />
              </button>

              <button
                className="action-tile flex items-center justify-between"
                onClick={() => onNavigate('government-support')}
              >
                <div className="flex items-center gap-1">
                  <TrendingUp size={18} color="#16a34a" />
                  <span>GoI CRM Machinery Schemes</span>
                </div>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="text-muted text-center mt-2" style={{ fontSize: '0.75rem' }}>
            {t('liveSyncNotice')}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity & Recent Messages */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {/* Recent Messages */}
        <div className="card">
          <div className="flex justify-between items-center mb-1">
            <h3>Recent Inquiries & Messages</h3>
            <button className="btn-link" onClick={() => onNavigate('messages')}>
              View All ({conversations.length})
            </button>
          </div>

          {conversations.length === 0 ? (
            <p className="text-muted p-2">No buyer messages yet. When buyers show interest in your residue, chats appear here.</p>
          ) : (
            <div className="conversation-preview-list">
              {conversations.slice(0, 3).map((c) => {
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <div
                    key={c.id}
                    className="conv-preview-item flex justify-between items-center"
                    onClick={() => onNavigate('messages')}
                  >
                    <div className="flex items-center gap-1">
                      <div className="avatar-circle">{c.buyerName?.[0] || 'B'}</div>
                      <div>
                        <div className="font-semibold" style={{ fontSize: '0.95rem' }}>{c.buyerName}</div>
                        <div className="text-muted truncate" style={{ maxWidth: '280px', fontSize: '0.85rem' }}>
                          {lastMsg?.text || 'Started conversation'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {lastMsg?.timestamp ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                      <span className="badge badge-subtle mt-1">Reply</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prototype Deal Activity */}
        <div className="card">
          <div className="flex justify-between items-center mb-1">
            <h3>Deal & Match Tracking</h3>
            <button className="btn-link" onClick={() => onNavigate('sales-transactions')}>
              Transactions Table
            </button>
          </div>

          {transactions.length === 0 ? (
            <p className="text-muted p-2">No deal activity yet.</p>
          ) : (
            <div className="timeline-list">
              {transactions.slice(0, 3).map((tr) => (
                <div key={tr.id} className="timeline-item flex items-start gap-1">
                  <div className="timeline-marker" />
                  <div style={{ flex: 1 }}>
                    <div className="flex justify-between items-center">
                      <strong style={{ textTransform: 'capitalize' }}>{tr.cropType} {tr.wasteType}</strong>
                      <span className={`badge badge-status-${tr.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {tr.status}
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      With {tr.buyerName} • {tr.quantityTons} Tons @ ₹{tr.pricePerTon}/ton
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
      </div>
    </div>
  );
}
