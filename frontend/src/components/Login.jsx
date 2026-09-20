import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AgriCycleLogo from './AgriCycleLogo';
import { Wheat, Factory, ChevronRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  
  const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      login(username, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-main)' }}>
      {/* Branding Section (Left Side) */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)', 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract Background pattern */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AgriCycleLogo width={60} height={60} textColor="white" />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '2rem 0 1rem 0', color: 'white', lineHeight: 1.2 }}>
            {t('tagline')}
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '400px', lineHeight: 1.6 }}>
            Connecting farmers with businesses that can give agricultural waste a second life. Join the circular economy today.
          </p>
        </div>
      </div>

      {/* Login Section (Right Side) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', background: 'var(--color-bg-card)', boxShadow: '-10px 0 30px rgba(0,0,0,0.03)', zIndex: 2 }}>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <select 
            value={language} 
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.8rem', background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}
          >
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
            <option value="ml">Malayalam</option>
            <option value="bn">Bengali</option>
            <option value="mr">Marathi</option>
          </select>
        </div>

        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>Welcome to AgriCycle</h3>
          
          {error && <div style={{ color: 'var(--color-error)', background: 'rgba(230, 57, 70, 0.1)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

          {/* Role Selection */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div 
              onClick={() => setRole('farmer')}
              style={{ 
                flex: 1, 
                border: `2px solid ${role === 'farmer' ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                background: role === 'farmer' ? 'var(--color-brand-light)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Wheat color={role === 'farmer' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)'} />
              <span style={{ fontWeight: 600, color: role === 'farmer' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)' }}>Farmer</span>
            </div>
            
            <div 
              onClick={() => setRole('buyer')}
              style={{ 
                flex: 1, 
                border: `2px solid ${role === 'buyer' ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                background: role === 'buyer' ? 'var(--color-brand-light)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Factory color={role === 'buyer' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)'} />
              <span style={{ fontWeight: 600, color: role === 'buyer' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)' }}>Buyer / Industry</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter your username" style={{ padding: '0.8rem' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" style={{ padding: '0.8rem' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              Sign In <ChevronRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Use Demo Account</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={() => { setRole('farmer'); setUsername('Ravi Kumar'); setPassword('farmer123'); login('Ravi Kumar', 'farmer123'); }} 
                style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', background: 'var(--color-bg-main)', border: 'none' }}
              >
                <div style={{ background: 'var(--color-brand-light)', padding: '0.4rem', borderRadius: '50%' }}><Wheat size={16} color="var(--color-brand-primary)" /></div>
                <span style={{ color: 'var(--color-text-main)' }}><strong>Ravi Kumar</strong> — Farmer</span>
              </button>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={() => { setRole('buyer'); setUsername('GreenBio Industries'); setPassword('buyer123'); login('GreenBio Industries', 'buyer123'); }} 
                style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', background: 'var(--color-bg-main)', border: 'none' }}
              >
                <div style={{ background: 'var(--color-brand-light)', padding: '0.4rem', borderRadius: '50%' }}><Factory size={16} color="var(--color-brand-primary)" /></div>
                <span style={{ color: 'var(--color-text-main)' }}><strong>GreenBio Industries</strong> — Buyer</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Media query for mobile responsive design would typically go in CSS, 
          but utilizing standard flexbox makes it generally adapt if wrapped.
          For a true split view collapsing to stack, I will add a quick media query in index.css. */}
    </div>
  );
}
