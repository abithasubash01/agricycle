// src/components/farmer/FarmerMessages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchConversations, sendMessage, fetchListings, subscribeToData } from '../../api/dataLayer';
import ListingDetailsModal from '../common/ListingDetailsModal';
import { Search, Send, User, ExternalLink, MessageSquare, Layers, Clock } from 'lucide-react';

export default function FarmerMessages() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [listings, setListings] = useState([]);
  const [selectedListingForModal, setSelectedListingForModal] = useState(null);

  const chatEndRef = useRef(null);

  const load = () => {
    const convs = fetchConversations();
    setConversations(convs);
    setListings(fetchListings());
    if (convs.length > 0 && !activeConvId) {
      setActiveConvId(convs[0].id);
    }
  };

  useEffect(() => {
    load();
    return subscribeToData(load);
  }, [user.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, conversations]);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const relatedListing = activeConv ? listings.find((l) => l.id === activeConv.listingId) : null;

  const filteredConvs = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.buyerName || '').toLowerCase().includes(q) ||
      (c.farmerName || '').toLowerCase().includes(q)
    );
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;
    try {
      sendMessage(activeConvId, messageText.trim());
      setMessageText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header mb-2">
        <h1 className="page-title">{t('messages')}</h1>
        <p className="page-subtitle">
          Direct communication with interested industrial buyers, biomass aggregators, and processing plants.
        </p>
      </div>

      <div className="card chat-workspace" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Left: Conversation List */}
        <div className="chat-sidebar">
          <div className="chat-search-bar">
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="chat-search-input"
            />
          </div>

          <div className="chat-thread-list">
            {filteredConvs.length === 0 ? (
              <div className="p-2 text-center text-muted" style={{ fontSize: '0.9rem' }}>
                No active conversations found.
              </div>
            ) : (
              filteredConvs.map((c) => {
                const listing = listings.find((l) => l.id === c.listingId);
                const isActive = c.id === activeConvId;
                const lastMsg = c.messages[c.messages.length - 1];

                return (
                  <div
                    key={c.id}
                    className={`chat-thread-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveConvId(c.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1">
                        <div className="avatar-circle-sm">
                          {c.buyerName?.[0] || 'B'}
                        </div>
                        <span className="chat-thread-name">{c.buyerName}</span>
                      </div>
                      <span className="chat-thread-time text-muted">
                        {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="chat-thread-snippet text-muted">
                      {lastMsg?.text || 'No messages yet'}
                    </div>

                    {listing && (
                      <div className="chat-thread-listing-tag mt-1">
                        <Layers size={12} /> {listing.cropType} • {listing.wasteType} ({listing.quantityTons} T)
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Window */}
        <div className="chat-main-area">
          {activeConv ? (
            <>
              {/* Chat Header with Listing Shortcut */}
              <div className="chat-header-bar flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <div className="avatar-circle">{activeConv.buyerName?.[0] || 'B'}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{activeConv.buyerName}</h3>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Verified AgriCycle Buyer</span>
                  </div>
                </div>

                {relatedListing && (
                  <button
                    className="btn-outline flex items-center gap-1"
                    onClick={() => setSelectedListingForModal(relatedListing)}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    <Layers size={14} />
                    <span>Listing: {relatedListing.wasteType}</span>
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>

              {/* Chat Message Scroll */}
              <div className="chat-messages-container">
                {activeConv.messages.map((m) => {
                  const isMe = m.senderId === user.id;

                  return (
                    <div
                      key={m.id}
                      className={`message-bubble-row ${isMe ? 'me' : 'them'}`}
                    >
                      <div className={`message-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                        <div className="message-content">{m.text}</div>
                        <div className="message-meta">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSend} className="chat-input-bar">
                <input
                  type="text"
                  placeholder={t('typeMessage')}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="chat-input-field"
                />
                <button type="submit" className="btn-primary flex items-center gap-1">
                  <Send size={16} /> {t('sendMessage')}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted p-3">
              <MessageSquare size={48} strokeWidth={1.5} color="var(--color-text-muted)" />
              <p className="mt-1">Select a conversation from the left to start messaging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Listing Details Modal */}
      {selectedListingForModal && (
        <ListingDetailsModal
          listing={selectedListingForModal}
          onClose={() => setSelectedListingForModal(null)}
        />
      )}
    </div>
  );
}
