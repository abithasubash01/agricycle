import {
  HelpCircle, Sprout, Calculator, TrendingUp,
  Truck, DollarSign, MapPin, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    n: '01',
    icon: Sprout,
    title: 'Register & Enter Harvest Details',
    desc: 'Sign up as a farmer and enter your crop type, harvest quantity, and farm location. AGRICYCLE supports Rice, Wheat, Sugarcane, Corn, and other crop types.',
    detail: 'Each crop type has a residue coefficient — the proportion of the harvest that becomes residue. For example, Rice has a coefficient of 70%, meaning 5,000 kg of rice produces approximately 3,500 kg of residue.',
  },
  {
    n: '02',
    icon: Calculator,
    title: 'Residue Estimation',
    desc: 'The backend calculates your estimated residue quantity using the crop-specific residue coefficient.',
    detail: 'Formula: Estimated Residue = Harvest Quantity × Residue Coefficient\nThis is an estimate. Actual residue may vary by season and farming practices.',
  },
  {
    n: '03',
    icon: TrendingUp,
    title: 'Buyer Matching',
    desc: 'Your listing is matched against registered buyer requirements based on residue type, quantity availability, and location proximity.',
    detail: 'Buyers post their requirements specifying residue type, minimum quantity, intended use (Biomass, Biogas, Compost, etc.), and the price per kg they are willing to pay.',
  },
  {
    n: '04',
    icon: Truck,
    title: 'Transport Cost Calculation',
    desc: 'Distance between farmer and buyer is calculated using preloaded coordinates for Indian agricultural hubs and a road curvature factor.',
    detail: 'Transport Cost = Distance (km) × ₹2.50/km\nThe rate of ₹2.50/km is a standard approximation for agricultural bulk transport. Actual rates may vary.',
  },
  {
    n: '05',
    icon: DollarSign,
    title: 'Net Value Calculation',
    desc: 'The system calculates your estimated net earnings after deducting transport and handling costs from the gross value.',
    detail: 'Gross Value = Residue Quantity × Price per kg\nHandling Cost = 5% of Gross Value\nEstimated Net Value = Gross Value − Transport Cost − Handling Cost',
  },
];

const FAQ = [
  {
    q: 'Is the residue estimate accurate?',
    a: 'The estimate uses industry-standard crop residue coefficients. It is a reliable approximation, not an exact measurement. Actual residue depends on crop variety, season, and farming method.',
  },
  {
    q: 'How is the transport cost calculated?',
    a: 'We use preloaded GPS coordinates for major agricultural locations in Tamil Nadu and North India, calculate the straight-line distance, then apply a road curvature factor of 1.3 and a rate of ₹2.50/km.',
  },
  {
    q: 'What does "handling cost" mean?',
    a: 'Handling cost covers loading, unloading, and minor logistics at 5% of gross value. This is a standard approximation and actual costs may vary.',
  },
  {
    q: 'Are the buyer matches real?',
    a: 'Yes. Buyers register accounts, post their requirements with specific residue types and quantities, and the backend matches them against farmer listings in real time.',
  },
  {
    q: 'Is the net value a guaranteed price?',
    a: 'No. The estimated net value is a calculation based on the buyer\'s offered price per kg and the calculated logistics costs. It is an estimate to help you make informed decisions.',
  },
];

function HowItWorks() {
  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0b2e1e, #1e6e38)',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <div className="eyebrow" style={{ color: 'rgba(120,196,158,1)', marginBottom: '12px' }}>
          Transparent Process
        </div>
        <h1 style={{
          fontFamily: 'Poppins, sans-serif', fontWeight: 800,
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: 'white',
          marginBottom: '16px', lineHeight: 1.2,
        }}>
          How AGRICYCLE Works
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7 }}>
          A transparent, step-by-step explanation of how we estimate residue, match buyers, and calculate your net value.
        </p>
      </div>

      {/* Steps */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="agri-card animate-fade-in-up" style={{ padding: '32px', animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #edf7f0, #d5eddb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={24} color="#1e6e38" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="eyebrow" style={{ marginBottom: '6px', fontSize: '10px' }}>{s.n}</div>
                    <h2 style={{
                      fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px',
                      color: '#14181f', marginBottom: '10px',
                    }}>
                      {s.title}
                    </h2>
                    <p style={{ color: '#3d434d', fontSize: '15px', lineHeight: 1.7, marginBottom: '14px' }}>
                      {s.desc}
                    </p>
                    <div style={{
                      background: '#f0f7f2', borderRadius: '12px', padding: '16px 18px',
                      borderLeft: '3px solid #2a8a48',
                    }}>
                      <p style={{ color: '#4e5662', fontSize: '13px', lineHeight: 1.75, fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                        {s.detail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="eyebrow" style={{ marginBottom: '8px' }}>Frequently Asked Questions</div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: '#14181f' }}>
              Common Questions
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FAQ.map((item) => (
              <div key={item.q} className="agri-card" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <HelpCircle size={18} color="#2a8a48" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '15px', color: '#14181f', marginBottom: '8px' }}>
                      {item.q}
                    </h3>
                    <p style={{ color: '#4e5662', fontSize: '14px', lineHeight: 1.7 }}>{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '64px', background: 'linear-gradient(135deg, #0d2e18, #1e6e38)',
          borderRadius: '24px', padding: '48px 40px', textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.5rem',
            color: 'white', marginBottom: '12px',
          }}>
            Ready to calculate your residue value?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '28px' }}>
            Register and run through the full flow in under 2 minutes.
          </p>
          <Link to="/login" className="btn-primary" style={{
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.25)',
            color: 'white',
            justifyContent: 'center',
          }}>
            Get Started <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
