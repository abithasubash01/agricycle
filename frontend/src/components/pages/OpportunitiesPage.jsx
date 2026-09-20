import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { opportunitiesApi } from '../../api/index';
import { Loader2, TrendingUp, X, ChevronRight, MapPin, Truck, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// ── Modal
function OpportunityModal({ o, onClose }) {
  if (!o) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#14181f' }}>
              Opportunity Details
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#838b96" />
            </button>
          </div>

          {/* Net value hero */}
          <div className="net-value-hero" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
              Estimated Net Value
            </p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#78c49e', fontFamily: 'Poppins, sans-serif' }}>
              ₹{Number(o.net_value ?? 0).toLocaleString('en-IN')}
            </p>
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Residue */}
            {o.listing && (
              <div style={{ background: '#f5f8f6', borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#adb2ba', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                  Residue
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#838b96' }}>Crop</span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{o.listing.crop}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#838b96' }}>Residue Quantity</span>
                    <span style={{ fontWeight: 700, color: '#1e6e38' }}>{Number(o.listing.residue_quantity_kg).toLocaleString('en-IN')} kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#838b96' }}>Source Location</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <MapPin size={12} color="#838b96" /> {o.listing.location}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logistics */}
            <div style={{ background: '#f5f8f6', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#adb2ba', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                Logistics
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#838b96', display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={13} /> Distance</span>
                  <span style={{ fontWeight: 600 }}>{o.distance_km} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#838b96' }}>Transport Cost</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>₹{Number(o.transport_cost).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#838b96' }}>Handling Cost</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>₹{Number(o.handling_cost).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Value */}
            <div style={{ background: '#edf7f0', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#adb2ba', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                Value
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#838b96', display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={13} /> Gross Value</span>
                  <span style={{ fontWeight: 600 }}>₹{Number(o.gross_value).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                  <span style={{ color: '#17562c', fontWeight: 700 }}>Estimated Net Value</span>
                  <span style={{ fontWeight: 800, color: '#1e6e38', fontSize: '17px' }}>₹{Number(o.net_value).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = user ? (user.role === 'farmer' ? { farmer_id: user.id } : { buyer_id: user.id }) : {};
        const res = await opportunitiesApi.list(params);
        setOpportunities(res.data.opportunities || []);
      } catch (err) {
        setError('Unable to connect to AGRICYCLE services. Please try again.');
        toast.error('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>
          <div className="eyebrow" style={{ marginBottom: '8px' }}>All Opportunities</div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#0d2e18' }}>
            Your Opportunities
          </h1>
          <p style={{ color: '#4e5662', marginTop: '6px', fontSize: '14px' }}>
            Analyzed opportunities with full cost breakdowns from the backend.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '40px 24px' }}>
        {!user && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <TrendingUp size={48} color="#d0d3d7" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#14181f', marginBottom: '12px' }}>
              Sign in to view opportunities
            </h2>
            <p style={{ color: '#838b96', marginBottom: '24px' }}>
              Opportunities are matched and stored when you run the full analysis flow.
            </p>
            <Link to="/login" className="btn-primary" style={{ justifyContent: 'center', display: 'inline-flex' }}>
              Sign In <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {user && loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div style={{ textAlign: 'center' }}>
              <Loader2 size={32} color="#2a8a48" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#838b96' }}>Finding suitable opportunities...</p>
            </div>
          </div>
        )}

        {user && !loading && error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '16px', padding: '28px', textAlign: 'center',
          }}>
            <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: '8px' }}>⚠ Connection Error</p>
            <p style={{ color: '#7f1d1d', fontSize: '14px' }}>{error}</p>
          </div>
        )}

        {user && !loading && !error && opportunities.length === 0 && (
          <div className="empty-state">
            <TrendingUp size={40} color="#d0d3d7" style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: 600, color: '#838b96', marginBottom: '8px' }}>No matching opportunities found yet.</p>
            <p style={{ fontSize: '13px', color: '#adb2ba', marginBottom: '24px' }}>
              {user.role === 'farmer'
                ? 'Create a listing and analyze buyer matches to generate opportunities.'
                : 'Post a requirement and wait for farmers to be matched.'}
            </p>
            <Link to={user.role === 'farmer' ? '/farmer' : '/buyer'} className="btn-primary" style={{ justifyContent: 'center', display: 'inline-flex', fontSize: '13px', padding: '10px 20px' }}>
              Go to Dashboard <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {user && !loading && opportunities.length > 0 && (
          <>
            {/* Comparison Table */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#14181f', marginBottom: '16px' }}>
                Compare Opportunities ({opportunities.length})
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e9eaec' }}>
                      {['Buyer / Source', 'Crop', 'Distance', 'Gross Value', 'Transport', 'Handling', 'Net Value', ''].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Net Value' ? 'right' : 'left', color: '#838b96', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {opportunities.map((o) => (
                      <tr key={o.id}
                        style={{ borderBottom: '1px solid #f0f7f2', cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f8f6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => setModal(o)}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#14181f' }}>
                          {user.role === 'farmer' ? (o.buyer_name || 'Buyer') : (o.farmer_name || 'Farmer')}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4e5662', textTransform: 'capitalize' }}>
                          {o.listing?.crop || '—'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4e5662' }}>{o.distance_km} km</td>
                        <td style={{ padding: '14px 16px', color: '#14181f', fontWeight: 600 }}>₹{Number(o.gross_value).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 16px', color: '#dc2626', fontWeight: 500 }}>−₹{Number(o.transport_cost).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 16px', color: '#dc2626', fontWeight: 500 }}>−₹{Number(o.handling_cost).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, fontSize: '15px', color: Number(o.net_value) >= 0 ? '#1e6e38' : '#dc2626' }}>
                          ₹{Number(o.net_value).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: '#1e6e38', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 600 }}>
                            Details <ChevronRight size={13} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards View */}
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#14181f', marginBottom: '16px' }}>
              Card View
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {opportunities.map((o) => (
                <div key={o.id} className="listing-card" style={{ cursor: 'pointer' }} onClick={() => setModal(o)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#14181f', marginBottom: '4px' }}>
                        {user.role === 'farmer' ? (o.buyer_name || 'Industrial Buyer') : (o.farmer_name || 'Registered Farmer')}
                      </h3>
                      {o.listing && (
                        <p style={{ fontSize: '13px', color: '#838b96' }}>
                          {o.listing.crop} · {o.listing.location}
                        </p>
                      )}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: Number(o.net_value) >= 0 ? '#1e6e38' : '#dc2626', fontFamily: 'Poppins, sans-serif' }}>
                      ₹{Number(o.net_value).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                    {[
                      { label: 'Gross', value: `₹${Number(o.gross_value).toLocaleString('en-IN')}`, color: '#14181f', bg: '#f5f8f6' },
                      { label: 'Distance', value: `${o.distance_km} km`, color: '#2563eb', bg: '#eff6ff' },
                      { label: 'Net', value: `₹${Number(o.net_value).toLocaleString('en-IN')}`, color: '#1e6e38', bg: '#edf7f0' },
                    ].map((item) => (
                      <div key={item.label} style={{ background: item.bg, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                        <p style={{ fontSize: '10px', color: '#adb2ba', marginBottom: '4px' }}>{item.label}</p>
                        <p style={{ fontWeight: 700, fontSize: '12px', color: item.color }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: '#1e6e38', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View Details <ChevronRight size={13} />
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modal && <OpportunityModal o={modal} onClose={() => setModal(null)} />}
    </>
  );
}

export default OpportunitiesPage;
