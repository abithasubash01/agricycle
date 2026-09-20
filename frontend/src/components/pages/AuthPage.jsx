import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Wheat, Factory, Loader2, Eye, EyeOff, ChevronRight, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ROLES = [
  { value: 'farmer', label: 'Farmer', icon: Wheat, description: 'List crop residue & find buyers' },
  { value: 'buyer', label: 'Industry / Buyer', icon: Factory, description: 'Post requirements & source residue' },
];

function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (mode === 'register' && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login({ email: form.email, password: form.password });
        toast.success(`Welcome back, ${user.name}!`);
        navigate(user.role === 'farmer' ? '/farmer' : '/buyer');
      } else {
        const user = await register({ ...form, role });
        toast.success(`Account created! Welcome, ${user.name}!`);
        navigate(user.role === 'farmer' ? '/farmer' : '/buyer');
      }
    } catch (err) {
      toast.error(err.userMessage || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Branding Panel */}
      <div style={{
        display: 'none',
        flex: '0 0 45%',
        background: 'linear-gradient(135deg, #0b2e1e 0%, #17562c 50%, #1e6e38 100%)',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="lg:flex"
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        {/* Grid dots */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '48px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Sprout size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: 'white', fontSize: '18px', letterSpacing: '-0.02em' }}>
              AGRICYCLE
            </span>
          </Link>

          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'white', lineHeight: 1.25, marginBottom: '20px' }}>
            Turning Farm<br />Residue into Value
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1rem', lineHeight: 1.75, maxWidth: '360px', marginBottom: '48px' }}>
            Connect farmers who have crop residue with industries that need it as raw material — generating income and building a circular economy.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🌾', text: 'Register crop residue listings' },
              { icon: '🤝', text: 'Match with registered industrial buyers' },
              { icon: '💰', text: 'See transparent net earnings estimate' },
              { icon: '🌍', text: 'Reduce CO₂ from crop burning' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'rgba(255,255,255,0.88)' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '14px' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'white' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Logo for mobile */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }} className="lg:hidden">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #2a8a48, #17562c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sprout size={16} color="white" />
              </div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: '#14181f', fontSize: '17px' }}>AGRICYCLE</span>
            </Link>
          </div>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', background: '#f5f8f6', borderRadius: '12px', padding: '4px', marginBottom: '32px' }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '9px', fontSize: '14px', fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.18s ease',
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? '#1e6e38' : '#838b96',
                  boxShadow: mode === m ? '0 1px 6px rgba(12,40,25,0.1)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#14181f', marginBottom: '6px' }}>
            {mode === 'login' ? 'Welcome back' : 'Join AGRICYCLE'}
          </h1>
          <p style={{ color: '#838b96', marginBottom: '28px', fontSize: '14px' }}>
            {mode === 'login' ? 'Sign in to your account to continue.' : 'Create your account to get started.'}
          </p>

          {/* Role Selector (register only) */}
          {mode === 'register' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {ROLES.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  style={{
                    padding: '16px 14px', borderRadius: '14px', textAlign: 'left', cursor: 'pointer',
                    border: `2px solid ${role === value ? '#2a8a48' : '#e9eaec'}`,
                    background: role === value ? '#edf7f0' : 'white',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={20} color={role === value ? '#1e6e38' : '#adb2ba'} />
                  <p style={{ marginTop: '8px', fontWeight: 700, fontSize: '13px', color: role === value ? '#1e6e38' : '#3d434d' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '11px', color: '#adb2ba', marginTop: '3px', lineHeight: 1.4 }}>{description}</p>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="e.g., Ravi Kumar"
                  className="agri-input"
                  style={{ borderColor: errors.name ? '#f87171' : undefined }}
                />
                {errors.name && <p style={{ marginTop: '5px', fontSize: '12px', color: '#dc2626' }}>{errors.name}</p>}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                className="agri-input"
                style={{ borderColor: errors.email ? '#f87171' : undefined }}
              />
              {errors.email && <p style={{ marginTop: '5px', fontSize: '12px', color: '#dc2626' }}>{errors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Minimum 6 characters"
                  className="agri-input"
                  style={{ borderColor: errors.password ? '#f87171' : undefined, paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#adb2ba' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ marginTop: '5px', fontSize: '12px', color: '#dc2626' }}>{errors.password}</p>}
            </div>

            {mode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>Phone (optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="+91 98765 43210"
                    className="agri-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3d434d', marginBottom: '7px' }}>Location (optional)</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={update('location')}
                    placeholder="e.g., Cuddalore"
                    className="agri-input"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: 'center', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
              {!loading && <ChevronRight size={16} />}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#838b96' }}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
              style={{ color: '#1e6e38', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
