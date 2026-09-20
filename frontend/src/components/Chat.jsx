import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchConversations, sendMessage, fetchListings, subscribeToData } from '../api/dataLayer';

export default function Chat() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const load = () => {
      setConversations(fetchConversations());
      setListings(fetchListings());
    };
    load();
    return subscribeToData(load);
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgText.trim() || !activeConvId) return;
    sendMessage(activeConvId, msgText.trim());
    setMsgText('');
  };

  if (conversations.length === 0) {
    return <div className="container mt-2 text-center text-muted">No conversations yet. Express interest in a listing to start a chat.</div>;
  }

  return (
    <div className="container mt-2">
      <div className="card" style={{ display: 'flex', height: '600px', padding: 0, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '300px', borderRight: '1px solid var(--color-border)', background: 'var(--color-bg-main)', overflowY: 'auto' }}>
          {conversations.map(c => {
            const listing = listings.find(l => l.id === c.listingId);
            const otherPartyId = user.id === c.farmerId ? c.buyerId : c.farmerId;
            const otherName = user.id === c.farmerId ? 'Buyer' : 'Farmer'; // Simplification for demo
            
            return (
              <div 
                key={c.id} 
                onClick={() => setActiveConvId(c.id)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--color-border)', 
                  cursor: 'pointer',
                  background: activeConvId === c.id ? 'var(--color-bg-card)' : 'transparent',
                  borderLeft: activeConvId === c.id ? '4px solid var(--color-brand-primary)' : '4px solid transparent'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>Chat with {otherName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {listing ? `${listing.wasteType} (${listing.cropType})` : 'Unknown Listing'}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Main Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeConv ? (
            <>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-main)' }}>
                <strong>{t('chat')}</strong>
              </div>
              
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeConv.messages.map(m => {
                  const isMe = m.senderId === user.id;
                  return (
                    <div key={m.id} style={{ 
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      background: isMe ? 'var(--color-brand-primary)' : 'var(--color-brand-light)',
                      color: isMe ? 'white' : 'var(--color-text-main)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      maxWidth: '70%'
                    }}>
                      <div>{m.text}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8, textAlign: 'right', marginTop: '4px' }}>
                        {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={msgText} 
                  onChange={e => setMsgText(e.target.value)} 
                  placeholder={t('typeMessage')} 
                  style={{ margin: 0, flex: 1 }}
                />
                <button type="submit" className="btn-primary">{t('sendMessage')}</button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
