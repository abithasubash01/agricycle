import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchListings, createListing, subscribeToData } from '../api/dataLayer';
import { Leaf, PlusCircle, AlertCircle } from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [cropType, setCropType] = useState('paddy');
  const [wasteType, setWasteType] = useState('straw');
  const [farmArea, setFarmArea] = useState('');
  const [estimatedTons, setEstimatedTons] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = () => {
      setListings(fetchListings().filter(l => l.farmerId === user.id));
    };
    load();
    return subscribeToData(load);
  }, [user.id]);

  const calculateEstimate = () => {
    // simple heuristic for demo
    const area = parseFloat(farmArea);
    if (!isNaN(area) && area > 0) {
      let multiplier = 1.5;
      if (cropType === 'sugarcane') multiplier = 4.0;
      if (cropType === 'wheat') multiplier = 1.2;
      const tons = Math.round(area * multiplier);
      setEstimatedTons(tons);
      setQuantity(tons.toString());
    } else {
      setEstimatedTons(0);
    }
  };

  useEffect(() => {
    calculateEstimate();
  }, [cropType, farmArea]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (parseFloat(quantity) <= 0 || parseFloat(price) <= 0) {
      setError('Quantity and price must be positive numbers');
      return;
    }
    
    try {
      createListing({
        cropType,
        wasteType,
        farmArea: parseFloat(farmArea),
        quantityTons: parseFloat(quantity),
        location,
        pricePerTon: parseFloat(price),
        aiEstimatedTons: estimatedTons,
      });
      setSuccess('Listing created successfully!');
      setShowForm(false);
      setFarmArea('');
      setQuantity('');
      setLocation('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-2">
      <h2>{t('dashboard')} - {user.name}</h2>
      
      {!showForm ? (
        <button className="btn-primary mt-1 mb-2 flex items-center gap-1" onClick={() => setShowForm(true)}>
          <PlusCircle size={18} /> {t('createListing')}
        </button>
      ) : (
        <div className="card mt-1 mb-2">
          <h3>{t('createListing')}</h3>
          <div style={{ background: 'var(--color-brand-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', margin: '1rem 0' }}>
            <div className="flex items-center gap-1 mb-1">
              <Leaf color="var(--color-brand-primary)" />
              <strong>{t('aiEstimate')}</strong>
            </div>
            <p style={{ fontSize: '0.9rem' }}>Based on your crop type and farm area, we estimate the residue. This is a prototype estimate.</p>
          </div>
          
          {error && <div style={{ color: 'var(--color-error)', margin: '1rem 0' }}><AlertCircle size={16} style={{ verticalAlign: 'text-bottom' }}/> {error}</div>}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-1">
            <div>
              <label>{t('cropType')}</label>
              <select value={cropType} onChange={e => setCropType(e.target.value)}>
                <option value="paddy">Paddy</option>
                <option value="wheat">Wheat</option>
                <option value="sugarcane">Sugarcane</option>
                <option value="cotton">Cotton</option>
                <option value="maize">Maize</option>
                <option value="coconut">Coconut</option>
              </select>
            </div>
            <div>
              <label>{t('wasteType')}</label>
              <input type="text" value={wasteType} onChange={e => setWasteType(e.target.value)} required />
            </div>
            <div>
              <label>{t('farmArea')}</label>
              <input type="number" step="0.1" value={farmArea} onChange={e => setFarmArea(e.target.value)} required />
            </div>
            <div>
              <label>{t('location')}</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>{t('quantity')} - {t('estimatedTons')}: {estimatedTons}</label>
                <input type="number" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>{t('price')}</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Submit Listing</button>
            </div>
          </form>
        </div>
      )}

      {success && <div className="toast-container"><div className="toast">{success}</div></div>}

      <h3>{t('myListings')}</h3>
      {listings.length === 0 ? (
        <p className="mt-1 text-muted">You have no listings yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-1 mt-1">
          {listings.map(l => (
            <div key={l.id} className="card">
              <h4>{l.wasteType} ({l.cropType})</h4>
              <p><strong>{t('quantity')}:</strong> {l.quantityTons} Tons</p>
              <p><strong>{t('location')}:</strong> {l.location}</p>
              <p><strong>{t('price')}:</strong> ₹{l.pricePerTon}</p>
              <div className="mt-1" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <strong>{t('buyerInterests')}:</strong> {l.interestedBuyers.length}
                {l.interestedBuyers.map(b => (
                   <div key={b.buyerId} style={{ fontSize: '0.9rem', color: 'var(--color-brand-primary)' }}>
                     • {b.buyerName}
                   </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
