import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchListings, expressInterest, startConversation, subscribeToData } from '../api/dataLayer';
import { MapPin, Search, MessageCircle } from 'lucide-react';

export default function Marketplace({ navigateTo }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const load = () => {
      setListings(fetchListings());
    };
    load();
    return subscribeToData(load);
  }, []);

  const handleInterest = (listingId, farmerId) => {
    try {
      expressInterest(listingId);
      setToast('Interest expressed successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChat = (listingId, farmerId) => {
    try {
      startConversation(listingId, farmerId);
      navigateTo('chat');
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = listings.filter(l => 
    l.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-2">
      <h2>{t('marketplace')}</h2>
      
      <div className="flex items-center gap-1 mt-1 mb-2" style={{ background: 'var(--color-bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <Search size={20} color="var(--color-text-muted)" />
        <input 
          type="text" 
          placeholder={t('search')} 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          style={{ margin: 0, border: 'none', boxShadow: 'none' }} 
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filtered.map(l => {
          const isInterested = user?.role === 'buyer' && l.interestedBuyers.some(b => b.buyerId === user.id);
          const isMine = user?.id === l.farmerId;
          
          return (
            <div key={l.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 style={{ textTransform: 'capitalize' }}>{l.wasteType}</h3>
                  <span style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand-primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                    {l.cropType}
                  </span>
                </div>
                <p className="flex items-center gap-1 text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                  <MapPin size={16} /> {l.location}
                </p>
                <div className="flex justify-between mt-1" style={{ fontSize: '1.1rem' }}>
                  <strong>{l.quantityTons} {t('quantity').split(' ')[0]}</strong>
                  <strong style={{ color: 'var(--color-brand-primary)' }}>₹{l.pricePerTon}/ton</strong>
                </div>
                <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                  By: {l.farmerName}
                </p>
              </div>
              
              {user && user.role === 'buyer' && (
                <div className="flex gap-1 mt-2">
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1 }} 
                    disabled={isInterested}
                    onClick={() => handleInterest(l.id, l.farmerId)}
                  >
                    {isInterested ? t('interested') : t('imInterested')}
                  </button>
                  {isInterested && (
                    <button className="btn-secondary flex items-center justify-center" onClick={() => handleChat(l.id, l.farmerId)}>
                      <MessageCircle size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}
    </div>
  );
}
