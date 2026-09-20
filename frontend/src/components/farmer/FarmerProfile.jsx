// src/components/farmer/FarmerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchListings, updateUserProfile, subscribeToData } from '../../api/dataLayer';
import { User, MapPin, Tractor, Sprout, Phone, ShieldCheck, Check, Edit3, Save } from 'lucide-react';

export default function FarmerProfile({ onNavigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState('');

  // Editable fields
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [farmArea, setFarmArea] = useState(user?.farmArea || 25);
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [bio, setBio] = useState(user?.bio || 'Sustainable farmer committed to zero residue burning.');
  const [primaryCrops, setPrimaryCrops] = useState(user?.primaryCrops?.join(', ') || 'Paddy, Wheat');

  const load = () => {
    setListings(fetchListings().filter((l) => l.farmerId === user.id));
  };

  useEffect(() => {
    load();
    return subscribeToData(load);
  }, [user.id]);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      updateUserProfile(user.id, {
        name,
        location,
        farmArea: parseFloat(farmArea),
        phone,
        bio,
        primaryCrops: primaryCrops.split(',').map((c) => c.trim()),
      });
      setIsEditing(false);
      setToast('Profile updated successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const totalWaste = listings.reduce((sum, l) => sum + (Number(l.quantityTons) || 0), 0);

  return (
    <div className="portal-page">
      <div className="page-header flex justify-between items-center mb-2">
        <div>
          <h1 className="page-title">{t('farmerProfile')}</h1>
          <p className="page-subtitle">
            Producer identity, registered farmland parameters, and biomass inventory settings.
          </p>
        </div>
        {!isEditing && (
          <button className="btn-primary flex items-center gap-1" onClick={() => setIsEditing(true)}>
            <Edit3 size={16} /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Left: Identity Card */}
        <div className="card text-center flex flex-col items-center">
          <div className="profile-avatar-large mt-1">
            <User size={48} color="white" />
          </div>

          <h2 className="mt-1" style={{ fontSize: '1.3rem' }}>{name}</h2>
          <span className="badge badge-primary mt-1">🌾 Certified Residue Producer</span>

          <div className="profile-bio-snippet mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
            "{bio}"
          </div>

          <div className="w-full mt-2 pt-2 text-left" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-1 mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
              <MapPin size={16} color="var(--color-brand-primary)" />
              <span><strong>Region:</strong> {location}</span>
            </div>
            <div className="flex items-center gap-1 mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
              <Tractor size={16} color="var(--color-brand-primary)" />
              <span><strong>Total Cultivation Area:</strong> {farmArea} Acres</span>
            </div>
            <div className="flex items-center gap-1 mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
              <Phone size={16} color="var(--color-brand-primary)" />
              <span><strong>Contact Phone:</strong> {phone}</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Details & Editable Settings */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          {isEditing ? (
            <form onSubmit={handleSave}>
              <h3 className="mb-2">Edit Producer Settings</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Location / District, State</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Farm Size (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={farmArea}
                    onChange={(e) => setFarmArea(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Primary Cultivated Crops (comma-separated)</label>
                  <input
                    type="text"
                    value={primaryCrops}
                    onChange={(e) => setPrimaryCrops(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Farmer Bio & Sustainable Farming Practice</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-1 mt-2">
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-1">
                  <Save size={16} /> Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h3 className="mb-2">Farm Overview & Residue Portfolio</h3>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="summary-stat-box">
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Active Listings</span>
                  <div className="font-bold text-brand" style={{ fontSize: '1.4rem' }}>{listings.length}</div>
                </div>
                <div className="summary-stat-box">
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Available Residue</span>
                  <div className="font-bold" style={{ fontSize: '1.4rem' }}>{totalWaste} Tons</div>
                </div>
                <div className="summary-stat-box">
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Zero Burning Verified</span>
                  <div className="font-bold text-success flex items-center gap-1" style={{ fontSize: '1.2rem' }}>
                    <ShieldCheck size={20} /> Verified
                  </div>
                </div>
              </div>

              <h4 className="mt-2 mb-1">Primary Crops & Residue Types</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                {primaryCrops.split(',').map((c, idx) => (
                  <span key={idx} className="badge badge-accent" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                    <Sprout size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {c.trim()}
                  </span>
                ))}
              </div>

              <h4 className="mt-2 mb-1">Active Harvest Listings</h4>
              <div className="flex flex-col gap-1">
                {listings.map((l) => (
                  <div key={l.id} className="flex justify-between items-center p-1" style={{ background: 'var(--color-bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <strong>{l.wasteType} ({l.cropType})</strong>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{l.quantityTons} Tons • ₹{l.pricePerTon}/ton</div>
                    </div>
                    <span className="badge badge-subtle">{l.status || 'Published'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}
