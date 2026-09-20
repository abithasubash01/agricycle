import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Leaf, Recycle, Sprout } from 'lucide-react';

export default function Home({ navigateTo }) {
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero Section */}
      <div style={{ background: 'var(--color-brand-light)', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-brand-primary)' }}>
          {t('appTitle')}
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', marginBottom: '2rem' }}>
          {t('tagline')}
        </p>
        <div className="flex gap-1" style={{ justifyContent: 'center' }}>
          <button className="btn-primary flex items-center gap-1" onClick={() => navigateTo('dashboard')}>
            {t('listWaste')} <ArrowRight size={18} />
          </button>
          <button className="btn-secondary flex items-center gap-1" onClick={() => navigateTo('marketplace')}>
            {t('findWaste')} <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="container mt-2 mb-2">
        <h2 className="text-center mb-2">How it works</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sprout size={48} color="var(--color-brand-primary)" />
            </div>
            <h3>1. Estimate & List</h3>
            <p>Farmers use our AI tool to estimate crop residue and list it on the marketplace.</p>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Recycle size={48} color="var(--color-accent)" />
            </div>
            <h3>2. Connect</h3>
            <p>Industries search for raw materials and express interest in relevant listings.</p>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Leaf size={48} color="var(--color-brand-secondary)" />
            </div>
            <h3>3. Convert</h3>
            <p>Farm waste is diverted from burning to valuable use like biofuel or compost.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
