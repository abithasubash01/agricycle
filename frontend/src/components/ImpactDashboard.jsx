import React, { useEffect, useState } from 'react';
import { fetchListings, subscribeToData } from '../api/dataLayer';
import { useLanguage } from '../context/LanguageContext';
import { BarChart3, Users, Factory, LeafyGreen } from 'lucide-react';

export default function ImpactDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalWaste: 0,
    farmersConnected: 0,
    buyersConnected: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const listings = fetchListings();
      
      const totalWaste = listings.reduce((acc, l) => acc + Number(l.quantityTons), 0);
      
      const uniqueFarmers = new Set(listings.map(l => l.farmerId));
      
      const uniqueBuyers = new Set();
      listings.forEach(l => {
        l.interestedBuyers.forEach(b => uniqueBuyers.add(b.buyerId));
      });
      
      setStats({
        totalWaste,
        farmersConnected: uniqueFarmers.size,
        buyersConnected: uniqueBuyers.size
      });
    };

    updateStats();
    return subscribeToData(updateStats);
  }, []);

  return (
    <div className="container mt-2">
      <h2 className="mb-2 flex items-center gap-1">
        <BarChart3 color="var(--color-brand-primary)" /> {t('impact')}
      </h2>
      
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="card text-center" style={{ borderTop: '4px solid var(--color-brand-primary)' }}>
          <LeafyGreen size={32} color="var(--color-brand-primary)" className="mb-1" />
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.totalWaste}</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>{t('totalWasteListed')}</p>
        </div>
        
        <div className="card text-center" style={{ borderTop: '4px solid var(--color-accent)' }}>
          <Users size={32} color="var(--color-accent)" className="mb-1" />
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.farmersConnected}</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>{t('farmersConnected')}</p>
        </div>
        
        <div className="card text-center" style={{ borderTop: '4px solid var(--color-brand-secondary)' }}>
          <Factory size={32} color="var(--color-brand-secondary)" className="mb-1" />
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.buyersConnected}</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>{t('buyersConnected')}</p>
        </div>
      </div>
      
      <div className="card">
        <h3>{t('divertedWaste')}</h3>
        <p style={{ marginTop: '1rem' }}>
          This impact dashboard calculates potential environmental impact based on listed and connected resources.
          By connecting {stats.farmersConnected} farmers to {stats.buyersConnected} industries, we estimate a potential diversion of {stats.totalWaste} tons of agricultural residue from being burned or wasted.
        </p>
      </div>
    </div>
  );
}
