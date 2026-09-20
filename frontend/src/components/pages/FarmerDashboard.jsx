import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { residueApi, listingsApi, buyersApi, opportunitiesApi } from '../../api/index';
import {
  Loader2, Plus, ChevronRight, ArrowLeft, Sprout, TrendingUp,
  Package, RefreshCw, MapPin, Truck, DollarSign, BarChart2,
  CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CROP_OPTIONS = [
  { value: 'rice', label: 'Rice / Paddy', coefficient: 0.70, residueType: 'Rice Straw' },
  { value: 'wheat', label: 'Wheat', coefficient: 0.65, residueType: 'Wheat Straw' },
  { value: 'sugarcane', label: 'Sugarcane', coefficient: 0.25, residueType: 'Bagasse' },
  { value: 'corn', label: 'Corn / Maize', coefficient: 0.50, residueType: 'Corn Stalks' },
  { value: 'other', label: 'Other', coefficient: 0.50, residueType: 'Crop Residue' },
];

// ── Step Badge
function StepBadge({ step, current, label }) {
  const done = current > step;
  const active = current === step;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '13px', transition: 'all 0.25s ease',
        background: done ? '#2a8a48' : active ? '#2a8a48' : '#e9eaec',
        color: done || active ? 'white' : '#838b96',
        boxShadow: active ? '0 0 0 4px rgba(42,138,72,0.18)' : 'none',
      }}>
        {done ? <CheckCircle2 size={16} /> : step}
      </div>
      <span style={{
        fontSize: '11px', fontWeight: active ? 700 : done ? 600 : 500,
        color: active ? '#1e6e38' : done ? '#3d434d' : '#adb2ba',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Summary Card
function SummaryCard({ icon: Icon, label, value, sub, color = '#edf7f0', iconColor = '#2a8a48' }) {
  return (
    <div className="summary-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div className="summary-card-icon" style={{ background: color }}>
          <Icon size={20} color={iconColor} />
        </div>
        <div>
          <p style={{ fontSize: '13px', color: '#838b96', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#14181f', fontFamily: 'Poppins, sans-serif', lineHeight: 1.1 }}>
            {value}
          </p>
          {sub && <p style={{ fontSize: '11px', color: '#adb2ba', marginTop: '4px' }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Opportunity Detail Modal
function OpportunityModal({ opportunity, onClose }) {
  if (!opportunity) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '28px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#14181f' }}>
              Opportunity Details
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} color="#838b96" />
            </button>
          </div>

          {/* Net Value Hero */}
          <div className="net-value-hero" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Estimated Net Value
            </p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#78c49e', fontFamily: 'Poppins, sans-serif', marginBottom: '8px' }}>
              ₹{Number(opportunity.net_value ?? opportunity.netValue ?? 0).toLocaleString('en-IN')}
            </p>
            {opportunity.persisted && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '999px', padding: '4px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.9)',
              }}>
                <CheckCircle2 size={12} /> Saved to database
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '0 28px 28px' }}>
          {/* Cost Breakdown */}
          {[
            { label: 'Gross Value', value: `₹${Number(opportunity.gross_value ?? opportunity.grossValue ?? 0).toLocaleString('en-IN')}`, positive: true },
            { label: `Transport Cost (${opportunity.distance_km ?? opportunity.distanceKm ?? 0} km)`, value: `−₹${Number(opportunity.transport_cost ?? opportunity.transportCost ?? 0).toLocaleString('en-IN')}`, negative: true },
            { label: 'Handling Cost (5%)', value: `−₹${Number(opportunity.handling_cost ?? opportunity.handlingCost ?? 0).toLocaleString('en-IN')}`, negative: true },
            { label: 'Estimated Net Value', value: `₹${Number(opportunity.net_value ?? opportunity.netValue ?? 0).toLocaleString('en-IN')}`, net: true },
          ].map((row) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', marginBottom: '4px',
              background: row.net ? '#edf7f0' : '#f5f8f6',
              borderRadius: '10px',
            }}>
              <span style={{ fontSize: '14px', color: row.net ? '#17562c' : '#3d434d', fontWeight: row.net ? 700 : 500 }}>
                {row.label}
              </span>
              <span style={{
                fontWeight: 700, fontSize: row.net ? '17px' : '14px',
                color: row.net ? '#1e6e38' : row.negative ? '#dc2626' : '#14181f',
              }}>
                {row.value}
              </span>
            </div>
          ))}

          {opportunity.summary && (
            <p style={{ fontSize: '12px', color: '#adb2ba', textAlign: 'center', marginTop: '16px' }}>
              {opportunity.summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FarmerDashboard() {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loadingAction, setLoadingAction] = useState('');

  const [estimateForm, setEstimateForm] = useState({ crop: 'rice', harvest_quantity_kg: '', location: user?.location || '' });
  const [estimateResult, setEstimateResult] = useState(null);
  const [savedListing, setSavedListing] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [opportunity, setOpportunity] = useState(null);

  const [myListings, setMyListings] = useState([]);
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [tab, setTab] = useState('create');
  const [loadingListings, setLoadingListings] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const fetchMyData = useCallback(async () => {
    if (!user) return;
    setLoadingListings(true);
    try {
      const [listRes, oppRes] = await Promise.all([
        listingsApi.list({ farmer_id: user.id }),
        opportunitiesApi.list({ farmer_id: user.id }),
      ]);
      setMyListings(listRes.data.listings || []);
      setMyOpportunities(oppRes.data.opportunities || []);
    } catch {
      toast.error('Failed to load your data');
    } finally {
      setLoadingListings(false);
    }
  }, [user]);

  useEffect(() => {
    if (tab !== 'create') fetchMyData();
  }, [tab, fetchMyData]);

  const handleEstimate = async (e) => {
    e.preventDefault();
    if (!estimateForm.harvest_quantity_kg || !estimateForm.location) {
      toast.error('Please fill in harvest quantity and location');
      return;
    }
    setLoadingAction('estimate');
    try {
      const res = await residueApi.calculate({
        crop: estimateForm.crop,
        harvest_quantity_kg: Number(estimateForm.harvest_quantity_kg),
      });
      setEstimateResult(res.data);
      setStep(2);
      toast.success('Residue estimated!');
    } catch (err) {
      toast.error(err.userMessage || 'Estimation failed');
    } finally {
      setLoadingAction('');
    }
  };

  const handleSaveListing = async () => {
    setLoadingAction('save');
    try {
      const res = await listingsApi.create({
        crop: estimateForm.crop,
        harvest_quantity_kg: Number(estimateForm.harvest_quantity_kg),
        location: estimateForm.location,
      });
      setSavedListing(res.data.listing);
      toast.success('Listing saved!');
      setLoadingAction('match');
      const matchRes = await buyersApi.match({
        listing_id: res.data.listing.id,
        residue_type: estimateResult.residueType,
        quantity: estimateResult.estimatedResidueQuantity,
        farmerLocation: estimateForm.location,
      });
      setMatches(matchRes.data.matches || []);
      setStep(3);
      if (matchRes.data.matches?.length > 0) {
        toast.success(`Found ${matchRes.data.matches.length} matching buyer${matchRes.data.matches.length > 1 ? 's' : ''}!`);
      } else {
        toast.info('No buyer requirements found yet.');
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to save listing');
    } finally {
      setLoadingAction('');
    }
  };

  const handleSelectMatch = async (match) => {
    setSelectedMatch(match);
    setLoadingAction('analyze');
    try {
      const res = await opportunitiesApi.analyze({
        listing_id: savedListing?.id,
        buyer_requirement_id: match.requirementId,
        quantity: match.matchedQuantity,
        buyerPricePerKg: match.offeredPrice,
        transportCost: match.transportCost,
        handlingCostPercent: 5,
      });
      setOpportunity(res.data);
      setStep(4);
      toast.success('Opportunity analysis complete!');
    } catch (err) {
      toast.error(err.userMessage || 'Analysis failed');
    } finally {
      setLoadingAction('');
    }
  };

  const reset = () => {
    setStep(1); setEstimateResult(null); setSavedListing(null);
    setMatches([]); setSelectedMatch(null); setOpportunity(null);
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

  if (user.role !== 'farmer') {
    return (
      <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', marginBottom: '16px' }}>
          Farmer account required
        </h2>
        <Link to="/buyer" style={{ color: '#1e6e38', textDecoration: 'underline' }}>Go to Buyer Dashboard</Link>
      </div>
    );
  }

  const totalResidueKg = myListings.reduce((s, l) => s + Number(l.residue_quantity_kg || 0), 0);
  const bestNetValue = myOpportunities.reduce((best, o) => Math.max(best, Number(o.net_value || 0)), 0);

  return (
    <>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '6px' }}>Farmer Dashboard</div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#0d2e18', lineHeight: 1.2 }}>
                Welcome back, {user.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', color: '#4e5662', fontSize: '14px' }}>
                {user.location && <><MapPin size={13} /> {user.location}</>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={fetchMyData}
                className="btn-ghost"
                style={{ fontSize: '13px' }}
                title="Refresh data"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => setTab('create')}
                className="btn-primary"
                style={{ fontSize: '13px', padding: '9px 20px' }}
              >
                <Plus size={15} /> New Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <SummaryCard icon={Package} label="Total Residue Listed" value={`${totalResidueKg.toLocaleString('en-IN')} kg`} sub="Across all listings" color="#edf7f0" iconColor="#2a8a48" />
          <SummaryCard icon={Sprout} label="Active Listings" value={myListings.filter(l => l.status === 'available').length || 0} sub={myListings.length > 0 ? `${myListings.length} total listings` : 'No listings yet'} color="#f0f7f2" iconColor="#1e6e38" />
          <SummaryCard icon={TrendingUp} label="Opportunities" value={myOpportunities.length || 0} sub={myOpportunities.length > 0 ? 'Analyzed opportunities' : 'None analyzed yet'} color="#faf7f0" iconColor="#b08254" />
          <SummaryCard icon={DollarSign} label="Best Net Value" value={bestNetValue > 0 ? `₹${bestNetValue.toLocaleString('en-IN')}` : '—'} sub={bestNetValue > 0 ? 'From opportunities' : 'No opportunities yet'} color="#edf7f0" iconColor="#2a8a48" />
        </div>

        {/* Tab Bar */}
        <div className="tab-bar">
          {[
            { id: 'create', label: '+ New Listing' },
            { id: 'listings', label: `My Listings ${myListings.length > 0 ? `(${myListings.length})` : ''}` },
            { id: 'opportunities', label: `Opportunities ${myOpportunities.length > 0 ? `(${myOpportunities.length})` : ''}` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-item ${tab === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── CREATE TAB ─────────────────────────────────────── */}
        {tab === 'create' && (
          <div>
            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', padding: '0 18px' }}>
              {/* Progress line */}
              <div style={{
                position: 'absolute', top: '18px', left: '50px', right: '50px',
                height: '2px', background: '#e9eaec', zIndex: 0,
              }} />
              <div style={{
                position: 'absolute', top: '18px', left: '50px',
                height: '2px', background: '#2a8a48', zIndex: 1,
                width: `${((step - 1) / 3) * 100}%`,
                transition: 'width 0.5s ease',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2 }}>
                <StepBadge step={1} current={step} label="Estimate" />
                <StepBadge step={2} current={step} label="Save" />
                <StepBadge step={3} current={step} label="Matches" />
                <StepBadge step={4} current={step} label="Analyze" />
              </div>
            </div>

            {/* Step 1 — Estimate Form */}
            {step === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="lg:grid-cols-2">
                <div className="agri-card-elevated" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #edf7f0, #d5eddb)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sprout size={18} color="#1e6e38" />
                    </div>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#14181f' }}>
                      New Residue Listing
                    </h2>
                  </div>
                  <p style={{ color: '#838b96', fontSize: '14px', marginBottom: '28px' }}>
                    Enter your harvest details to calculate residue and find buyers.
                  </p>
                  <form onSubmit={handleEstimate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>
                        Crop Type
                      </label>
                      <select
                        value={estimateForm.crop}
                        onChange={(e) => setEstimateForm((f) => ({ ...f, crop: e.target.value }))}
                        className="agri-select"
                      >
                        {CROP_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>
                        Harvest Quantity (kg)
                      </label>
                      <input
                        type="number" min="1"
                        value={estimateForm.harvest_quantity_kg}
                        onChange={(e) => setEstimateForm((f) => ({ ...f, harvest_quantity_kg: e.target.value }))}
                        placeholder="e.g., 5000"
                        className="agri-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>
                        Farm Location
                      </label>
                      <input
                        type="text"
                        value={estimateForm.location}
                        onChange={(e) => setEstimateForm((f) => ({ ...f, location: e.target.value }))}
                        placeholder="e.g., Cuddalore"
                        className="agri-input"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingAction === 'estimate'}
                      className="btn-primary"
                      style={{ justifyContent: 'center', marginTop: '8px' }}
                    >
                      {loadingAction === 'estimate' && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                      Calculate Residue
                    </button>
                  </form>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f0f7f2, #faf7f0)',
                  borderRadius: '20px', border: '2px dashed rgba(45,138,72,0.2)',
                  padding: '48px 32px', textAlign: 'center', minHeight: '300px',
                }}>
                  <div>
                    <div style={{ fontSize: '52px', marginBottom: '16px' }}>🌾</div>
                    <p style={{ color: '#838b96', lineHeight: 1.6 }}>
                      Fill in the form to estimate your crop residue and discover matching buyers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Review & Save */}
            {step === 2 && estimateResult && (
              <div style={{ maxWidth: '560px' }}>
                <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1e6e38', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', fontWeight: 500 }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <div className="agri-card-elevated" style={{ padding: '32px' }}>
                  <span style={{ display: 'inline-block', background: '#d5eddb', color: '#17562c', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, marginBottom: '20px' }}>
                    ✓ Estimate Ready
                  </span>

                  {/* Big residue number */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0d2e18, #1e6e38)',
                    borderRadius: '16px', padding: '28px', marginBottom: '24px', textAlign: 'center',
                  }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                      Estimated Available Residue
                    </p>
                    <p className="animate-count-up" style={{ fontSize: '2.8rem', fontWeight: 800, color: '#78c49e', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>
                      {estimateResult.estimatedResidueQuantity?.toLocaleString('en-IN')} kg
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginTop: '8px' }}>
                      {estimateResult.residueType}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    {[
                      { label: 'Crop', value: estimateForm.crop },
                      { label: 'Harvest', value: `${Number(estimateResult.harvestQuantity).toLocaleString('en-IN')} kg` },
                      { label: 'Coefficient', value: `${(estimateResult.residueCoefficient * 100).toFixed(0)}%` },
                    ].map((item) => (
                      <div key={item.label} style={{ background: '#f5f8f6', borderRadius: '12px', padding: '14px 16px' }}>
                        <p style={{ fontSize: '11px', color: '#adb2ba', marginBottom: '4px', fontWeight: 500 }}>{item.label}</p>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#14181f', textTransform: 'capitalize' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveListing}
                    disabled={!!loadingAction}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {loadingAction && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                    {loadingAction === 'save' ? 'Saving to database...' :
                      loadingAction === 'match' ? 'Finding buyers...' :
                        'Save Listing & Find Buyers'}
                  </button>
                  <p style={{ fontSize: '12px', color: '#adb2ba', textAlign: 'center', marginTop: '12px' }}>
                    This will save your listing and search for real buyer matches
                  </p>
                </div>
              </div>
            )}

            {/* Step 3 — Matches */}
            {step === 3 && (
              <div>
                <button onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1e6e38', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', fontWeight: 500 }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#14181f', marginBottom: '6px' }}>
                    Matching Buyers
                  </h2>
                  <p style={{ color: '#838b96', fontSize: '14px' }}>
                    {matches.length > 0
                      ? `Found ${matches.length} buyer${matches.length > 1 ? 's' : ''} with requirements matching your listing`
                      : 'No buyer requirements found for your residue type yet.'}
                  </p>
                </div>

                {matches.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle size={36} color="#f59e0b" style={{ marginBottom: '12px' }} />
                    <p style={{ fontWeight: 600, color: '#92400e', marginBottom: '8px' }}>Your listing has been saved!</p>
                    <p style={{ color: '#b45309', fontSize: '14px' }}>
                      Buyers will be matched automatically once they post requirements.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {matches.map((m, i) => (
                      <div key={m.requirementId || i} className="listing-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#14181f', marginBottom: '4px' }}>
                              {m.buyerName}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#838b96', fontSize: '13px' }}>
                              <MapPin size={12} /> {m.buyerLocation} · {m.distance} km away
                            </div>
                          </div>
                          <span style={{ background: '#edf7f0', color: '#17562c', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                            ₹{m.offeredPrice}/kg
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                          <div style={{ background: '#f5f8f6', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                            <p style={{ fontSize: '11px', color: '#adb2ba', marginBottom: '4px' }}>Gross Value</p>
                            <p style={{ fontWeight: 700, fontSize: '15px', color: '#14181f' }}>₹{m.grossValue?.toLocaleString('en-IN')}</p>
                          </div>
                          <div style={{ background: Number(m.netValue) >= 0 ? '#edf7f0' : '#fef2f2', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                            <p style={{ fontSize: '11px', color: '#adb2ba', marginBottom: '4px' }}>Est. Net Value</p>
                            <p style={{ fontWeight: 800, fontSize: '15px', color: Number(m.netValue) >= 0 ? '#1e6e38' : '#dc2626' }}>
                              ₹{m.netValue?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#838b96', fontSize: '12px', marginBottom: '14px' }}>
                          <Truck size={12} /> Transport: ₹{m.transportCost?.toLocaleString('en-IN')}
                          &nbsp;·&nbsp; Use: {m.useType}
                        </div>

                        <button
                          onClick={() => handleSelectMatch(m)}
                          disabled={!!loadingAction}
                          className="btn-primary"
                          style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '10px' }}
                        >
                          {loadingAction === 'analyze' && selectedMatch?.requirementId === m.requirementId ? (
                            <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
                          ) : (
                            <>Analyze & Save <ChevronRight size={14} /></>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4 — Opportunity */}
            {step === 4 && opportunity && (
              <div style={{ maxWidth: '560px' }}>
                <button onClick={() => setStep(3)} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1e6e38', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', fontWeight: 500 }}>
                  <ArrowLeft size={14} /> Back to Matches
                </button>
                <div className="agri-card-elevated" style={{ padding: '32px' }}>
                  {/* Big net value */}
                  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <p style={{ fontSize: '12px', color: '#838b96', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                      Estimated Net Earnings
                    </p>
                    <p className="animate-count-up" style={{
                      fontSize: '3.5rem', fontWeight: 800,
                      color: Number(opportunity.netValue) >= 0 ? '#1e6e38' : '#dc2626',
                      fontFamily: 'Poppins, sans-serif', lineHeight: 1,
                    }}>
                      ₹{opportunity.netValue?.toLocaleString('en-IN')}
                    </p>
                    {opportunity.persisted && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        marginTop: '12px', background: '#d5eddb', color: '#17562c',
                        padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                      }}>
                        <CheckCircle2 size={12} /> Saved to database
                      </span>
                    )}
                  </div>

                  {/* Cost Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                      { label: 'Gross Value', value: `₹${opportunity.grossValue?.toLocaleString('en-IN')}` },
                      { label: `Transport Cost (${opportunity.distanceKm} km × ₹2.5/km)`, value: `−₹${opportunity.transportCost?.toLocaleString('en-IN')}`, negative: true },
                      { label: 'Handling Cost (5% of gross)', value: `−₹${opportunity.handlingCost?.toLocaleString('en-IN')}`, negative: true },
                      { label: 'Estimated Net Value', value: `₹${opportunity.netValue?.toLocaleString('en-IN')}`, net: true },
                    ].map((row) => (
                      <div key={row.label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '13px 16px', borderRadius: '10px',
                        background: row.net ? '#edf7f0' : '#f5f8f6',
                      }}>
                        <span style={{ fontSize: '14px', color: row.net ? '#17562c' : '#3d434d', fontWeight: row.net ? 700 : 500 }}>
                          {row.label}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: row.net ? '17px' : '14px', color: row.net ? '#1e6e38' : row.negative ? '#dc2626' : '#14181f' }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {opportunity.summary && (
                    <p style={{ fontSize: '12px', color: '#adb2ba', textAlign: 'center', marginTop: '16px' }}>{opportunity.summary}</p>
                  )}

                  <button
                    onClick={reset}
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
                  >
                    Start New Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── MY LISTINGS TAB ─────────────────────────────────── */}
        {tab === 'listings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#14181f' }}>
                My Listings ({myListings.length})
              </h2>
              <button onClick={fetchMyData} disabled={loadingListings} className="btn-ghost" style={{ fontSize: '13px' }}>
                <RefreshCw size={13} style={loadingListings ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
              </button>
            </div>

            {loadingListings ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
                <Loader2 size={32} color="#2a8a48" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : myListings.length === 0 ? (
              <div className="empty-state">
                <Package size={40} color="#d0d3d7" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#838b96', marginBottom: '16px' }}>No listings yet. Create your first listing!</p>
                <button onClick={() => setTab('create')} className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px' }}>
                  <Plus size={14} /> Create Listing
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {myListings.map((l) => (
                  <div key={l.id} className="listing-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#14181f', textTransform: 'capitalize', marginBottom: '4px' }}>
                          {l.crop}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#838b96', fontSize: '13px' }}>
                          <MapPin size={11} /> {l.location}
                        </div>
                      </div>
                      <span className={l.status === 'available' ? 'badge-available' : 'badge-matched'}>
                        {l.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {[
                        { label: 'Residue Type', value: l.residue_type },
                        { label: 'Residue Qty', value: `${Number(l.residue_quantity_kg).toLocaleString('en-IN')} kg`, highlight: true },
                        { label: 'Harvest Qty', value: `${Number(l.harvest_quantity_kg).toLocaleString('en-IN')} kg` },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#838b96' }}>{row.label}</span>
                          <span style={{ fontWeight: row.highlight ? 700 : 500, color: row.highlight ? '#1e6e38' : '#14181f' }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '11px', color: '#adb2ba' }}>
                      {new Date(l.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── OPPORTUNITIES TAB ───────────────────────────────── */}
        {tab === 'opportunities' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#14181f' }}>
                My Opportunities ({myOpportunities.length})
              </h2>
              <button onClick={fetchMyData} disabled={loadingListings} className="btn-ghost" style={{ fontSize: '13px' }}>
                <RefreshCw size={13} style={loadingListings ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
              </button>
            </div>

            {loadingListings ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
                <Loader2 size={32} color="#2a8a48" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : myOpportunities.length === 0 ? (
              <div className="empty-state">
                <TrendingUp size={40} color="#d0d3d7" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#838b96', marginBottom: '8px' }}>No opportunities analyzed yet.</p>
                <p style={{ fontSize: '13px', color: '#adb2ba' }}>Create a listing and find matching buyers to generate opportunities.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {myOpportunities.map((o) => (
                  <div key={o.id} className="listing-card" style={{ cursor: 'pointer' }} onClick={() => setDetailModal(o)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#14181f', marginBottom: '4px' }}>
                          {o.buyer_name || 'Industrial Buyer'}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#838b96' }}>
                          {o.listing ? `${o.listing.crop} → ${o.listing.location}` : 'Listing details unavailable'}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '1.2rem', fontWeight: 800,
                        color: Number(o.net_value) >= 0 ? '#1e6e38' : '#dc2626',
                        fontFamily: 'Poppins, sans-serif',
                      }}>
                        ₹{Number(o.net_value).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                      {[
                        { label: 'Gross', value: `₹${Number(o.gross_value).toLocaleString('en-IN')}`, bg: '#f5f8f6', color: '#14181f' },
                        { label: 'Transport', value: `₹${Number(o.transport_cost).toLocaleString('en-IN')}`, bg: '#fef2f2', color: '#dc2626' },
                        { label: 'Net', value: `₹${Number(o.net_value).toLocaleString('en-IN')}`, bg: '#edf7f0', color: '#1e6e38' },
                      ].map((item) => (
                        <div key={item.label} style={{ background: item.bg, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                          <p style={{ fontSize: '10px', color: '#adb2ba', marginBottom: '4px' }}>{item.label}</p>
                          <p style={{ fontWeight: 700, fontSize: '12px', color: item.color }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#adb2ba' }}>
                        {new Date(o.created_at).toLocaleDateString('en-IN')} · {o.distance_km} km
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
      </div>

      {/* Opportunity Detail Modal */}
      {detailModal && <OpportunityModal opportunity={detailModal} onClose={() => setDetailModal(null)} />}
    </>
  );
}

export default FarmerDashboard;
