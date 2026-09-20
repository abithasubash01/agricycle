import { Link } from 'react-router-dom';
import {
  Sprout, ChevronRight, Flame, Recycle, Leaf,
  FileText, Layers, Truck, Calculator, ArrowRight,
  TrendingUp, MapPin, DollarSign, ShoppingCart
} from 'lucide-react';

// ── Product Flow Steps
const STEPS = [
  { n: '01', icon: Sprout, label: 'Harvest Input', desc: 'Enter your crop type and harvest quantity.' },
  { n: '02', icon: Calculator, label: 'Residue Estimate', desc: 'Get an instant estimate of available residue using crop coefficients.' },
  { n: '03', icon: TrendingUp, label: 'Use & Buyer Match', desc: 'Identify best uses and connect with real buyers.' },
  { n: '04', icon: Truck, label: 'Transport Calc', desc: 'Calculate distance-based transport cost to buyer location.' },
  { n: '05', icon: DollarSign, label: 'Estimated Net Value', desc: 'See your earnings after all costs are deducted.' },
];

// ── Residue Use Cases
const USE_CASES = [
  {
    icon: Flame,
    label: 'Biomass Fuel',
    color: 'bg-orange-50 text-orange-600',
    border: 'border-orange-100',
    desc: 'Rice straw, sugarcane bagasse, and corn stalks are used in industrial boilers and power plants.',
    crops: 'Rice, Sugarcane, Corn',
  },
  {
    icon: Recycle,
    label: 'Biogas',
    color: 'bg-green-50 text-green-600',
    border: 'border-green-100',
    desc: 'Wet residues like rice straw and wheat straw are converted into biogas through anaerobic digestion.',
    crops: 'Rice, Wheat',
  },
  {
    icon: Leaf,
    label: 'Compost',
    color: 'bg-lime-50 text-lime-700',
    border: 'border-lime-100',
    desc: 'Crop residues enrich soil through composting, reducing chemical fertiliser dependency.',
    crops: 'All crop types',
  },
  {
    icon: FileText,
    label: 'Paper & Pulp',
    color: 'bg-amber-50 text-amber-700',
    border: 'border-amber-100',
    desc: 'Long-fibre residues like wheat straw and sugarcane bagasse are used in paper manufacturing.',
    crops: 'Wheat, Sugarcane',
  },
  {
    icon: Layers,
    label: 'Biomaterials',
    color: 'bg-teal-50 text-teal-700',
    border: 'border-teal-100',
    desc: 'Agri-residue is processed into boards, packaging materials, and construction composites.',
    crops: 'Rice, Corn, Wheat',
  },
];

// ── Product Flow Visual (mockup mini-card)
function FlowVisual() {
  return (
    <div className="rounded-2xl p-5 w-full max-w-xs mx-auto"
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)' }}>
      <div className="text-white/40 text-xs font-mono mb-3 uppercase tracking-widest">Live Calculation Preview</div>
      {[
        { label: '5,000 kg Rice Harvest', icon: '🌾', sub: null },
        { label: '3,500 kg Estimated Residue', icon: '♻', sub: '70% residue coefficient' },
        { label: 'Biomass Fuel • Biogas', icon: '⚡', sub: 'Matched use types' },
        { label: 'Buyer — 150 km away', icon: '📍', sub: 'Cuddalore → Chennai' },
        { label: 'Transport: ₹375', icon: '🚚', sub: '150 km × ₹2.50/km' },
        { label: 'Estimated Net: ₹9,600', icon: '💰', sub: 'After costs', highlight: true },
      ].map((row, i) => (
        <div key={i}>
          {i > 0 && (
            <div className="flex justify-center my-1">
              <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </div>
          )}
          <div style={{
            background: row.highlight ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
            border: row.highlight ? '1px solid rgba(255,255,255,0.28)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '10px 14px',
          }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '14px' }}>{row.icon}</span>
              <div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: row.highlight ? '#fff' : 'rgba(255,255,255,0.88)',
                  lineHeight: 1.3,
                }}>
                  {row.label}
                </p>
                {row.sub && (
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                    {row.sub}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HomePage() {
  return (
    <div>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero-section" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '64px', alignItems: 'center' }}
            className="lg:grid-cols-2">

            {/* Left — Copy */}
            <div className="animate-fade-in-up">
              <div className="eyebrow mb-5" style={{ color: 'rgba(120, 196, 158, 1)', letterSpacing: '0.12em' }}>
                AGRICULTURAL RESIDUE&nbsp;•&nbsp;RESOURCE&nbsp;•&nbsp;VALUE
              </div>
              <h1 style={{
                color: 'white',
                lineHeight: 1.15,
                marginBottom: '24px',
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 800,
              }}>
                Turn Crop Residue Into Your{' '}
                <span style={{ color: '#78c49e' }}>Next Revenue Opportunity</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '40px', maxWidth: '480px' }}>
                AGRICYCLE estimates your available residue, identifies suitable uses, connects you with relevant buyers,
                and calculates your estimated net value after transport and handling.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/login" className="btn-primary" style={{
                  background: 'linear-gradient(135deg, #4da677, #2a8a48)',
                  boxShadow: '0 4px 20px rgba(42,138,72,0.5)',
                  fontSize: '0.95rem',
                  padding: '13px 28px',
                }}>
                  Find My Opportunity <ArrowRight size={17} />
                </Link>
                <Link to="/login" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 28px',
                  border: '2px solid rgba(255,255,255,0.28)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                  background: 'transparent',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ShoppingCart size={17} /> I'm a Buyer
                </Link>
              </div>
              <div style={{ marginTop: '40px', display: 'flex', gap: '24px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4da677', animation: 'pulse 2s infinite' }} />
                  Real-time matching
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={13} />
                  Distance-based transport
                </div>
              </div>
            </div>

            {/* Right — Product Visualization */}
            <div className="animate-fade-in-up animate-delay-300" style={{ display: 'flex', justifyContent: 'center' }}>
              <FlowVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT FLOW ─────────────────────────────── */}
      <section className="py-24" style={{ background: '#f5f8f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="eyebrow" style={{ marginBottom: '12px' }}>How It Works</div>
            <h2 style={{
              color: '#14181f',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              marginBottom: '16px',
            }}>
              From Harvest Residue to Real Value
            </h2>
            <p style={{ color: '#838b96', maxWidth: '480px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Five transparent steps from your farm to your earnings.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="agri-card animate-fade-in-up"
                  style={{ padding: '24px 20px', textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
                  <div style={{ color: '#46a763', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', marginBottom: '12px' }}>
                    {s.n}
                  </div>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px', margin: '0 auto 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #edf7f0, #d5eddb)',
                  }}>
                    <Icon size={22} color="#1e6e38" />
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#14181f', fontSize: '14px', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>
                    {s.label}
                  </h3>
                  <p style={{ color: '#838b96', fontSize: '12px', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── USE CASES ────────────────────────────────── */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, #f0f7f2 0%, #faf7f0 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="eyebrow" style={{ marginBottom: '12px' }}>Residue Applications</div>
            <h2 style={{
              color: '#14181f',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              marginBottom: '16px',
            }}>
              Where Can Your Residue Go?
            </h2>
            <p style={{ color: '#838b96', maxWidth: '480px', margin: '0 auto' }}>
              Different crops produce different residues suitable for different industrial applications.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {USE_CASES.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <div key={uc.label}
                  className={`agri-card animate-fade-in-up`}
                  style={{ padding: '24px', border: '1px solid', animationDelay: `${i * 0.1}s` }}>
                  <div className={`${uc.color}`}
                    style={{ width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#14181f', marginBottom: '8px', fontSize: '15px', fontFamily: 'Poppins, sans-serif' }}>
                    {uc.label}
                  </h3>
                  <p style={{ color: '#838b96', fontSize: '13px', lineHeight: 1.65, marginBottom: '12px' }}>{uc.desc}</p>
                  <p style={{ fontSize: '11px', color: '#adb2ba', fontWeight: 500 }}>
                    <span style={{ fontWeight: 700 }}>Crops:</span> {uc.crops}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VALUE CALCULATION ────────────────────────── */}
      <section className="py-24" style={{ background: '#f5f8f6' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="eyebrow" style={{ marginBottom: '12px' }}>Transparent Economics</div>
            <h2 style={{
              color: '#14181f',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              marginBottom: '16px',
            }}>
              See Exactly What You'll Earn
            </h2>
            <p style={{ color: '#838b96', maxWidth: '480px', margin: '0 auto' }}>
              No hidden deductions. Before you commit, see a full cost breakdown.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', alignItems: 'center' }}
            className="md:grid-cols-2">

            {/* Equation Visual */}
            <div className="value-flow-card">
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f7f2' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#adb2ba', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Example Calculation
                </p>
                <p style={{ fontSize: '11px', color: '#adb2ba', marginTop: '4px' }}>
                  ⚠ Illustrative example only — not real user data.
                </p>
              </div>
              {[
                { label: 'Residue Quantity', value: '3,500 kg', sub: 'Rice straw from 5,000 kg harvest' },
                { label: 'Price per kg', value: '₹3.00/kg', sub: 'Buyer offered price' },
                { label: 'Gross Value', value: '₹10,500', positive: true },
                { label: '− Transport Cost', value: '−₹375', sub: '150 km × ₹2.50/km', negative: true },
                { label: '− Handling Cost', value: '−₹525', sub: '5% of gross value', negative: true },
                { label: 'Estimated Net Value', value: '₹9,600', net: true },
              ].map((row, i) => (
                <div key={i} className={`value-row ${row.net ? 'net' : ''}`}>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: row.net ? '#17562c' : '#3d434d',
                    }}>
                      {row.label}
                    </p>
                    {row.sub && <p style={{ fontSize: '12px', color: '#adb2ba', marginTop: '2px' }}>{row.sub}</p>}
                  </div>
                  <p style={{
                    fontWeight: 700,
                    fontSize: row.net ? '18px' : '15px',
                    color: row.net ? '#1e6e38' : row.negative ? '#dc2626' : '#14181f',
                  }}>
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="agri-card-dark" style={{ padding: '36px' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#78c49e', fontFamily: 'Poppins, sans-serif', marginBottom: '8px' }}>
                  ₹9,600
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6 }}>
                  Estimated net value per transaction (illustrative example)
                </p>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1rem', lineHeight: 1.7, fontStyle: 'italic' }}>
                  "Don't just find a buyer. Find the most valuable use of your residue."
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/login" className="btn-primary" style={{ justifyContent: 'center', fontSize: '0.95rem' }}>
                  Calculate My Residue Value <ArrowRight size={17} />
                </Link>
                <Link to="/how-it-works" className="btn-ghost" style={{ justifyContent: 'center', fontSize: '13px' }}>
                  Learn how the calculation works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────── */}
      <section style={{ padding: '80px 16px', background: 'linear-gradient(135deg, #0d2e18, #1e6e38)', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="eyebrow" style={{ color: 'rgba(120,196,158,1)', marginBottom: '16px' }}>
            Get Started Today
          </div>
          <h2 style={{
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            marginBottom: '20px',
            lineHeight: 1.2,
          }}>
            Ready to turn your residue into revenue?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '40px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Register as a farmer or a buyer and start matching today.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 32px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
              textDecoration: 'none', transition: 'all 0.18s ease',
              background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)', color: 'white',
            }}>
              I'm a Farmer
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 32px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
              textDecoration: 'none', transition: 'all 0.18s ease',
              background: 'white', color: '#1e6e38', border: '2px solid transparent',
            }}>
              I'm a Buyer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
