// src/components/farmer/MyListings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchListings, createListing, updateListing, deleteListing, subscribeToData } from '../../api/dataLayer';
import ListingDetailsModal from '../common/ListingDetailsModal';
import { PlusCircle, Eye, Edit3, Trash2, Leaf, AlertCircle, Filter, Check, X } from 'lucide-react';

export default function MyListings({ onNavigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedListingForModal, setSelectedListingForModal] = useState(null);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  // Form State
  const [cropType, setCropType] = useState('paddy');
  const [wasteType, setWasteType] = useState('straw');
  const [farmArea, setFarmArea] = useState('10');
  const [quantity, setQuantity] = useState('15');
  const [location, setLocation] = useState(user?.location || 'Punjab, India');
  const [price, setPrice] = useState('1500');
  const [formStatus, setFormStatus] = useState('Published');
  const [estimatedTons, setEstimatedTons] = useState(15);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    const all = fetchListings();
    setListings(all.filter((l) => l.farmerId === user.id));
  };

  useEffect(() => {
    load();
    return subscribeToData(load);
  }, [user.id]);

  // Dynamic estimate calculation in create/edit modal
  useEffect(() => {
    const area = parseFloat(farmArea);
    if (!isNaN(area) && area > 0) {
      let multiplier = 1.5;
      if (cropType === 'sugarcane') multiplier = 3.5;
      if (cropType === 'wheat') multiplier = 1.2;
      if (cropType === 'cotton') multiplier = 1.8;
      if (cropType === 'maize') multiplier = 1.6;
      const tons = Math.round(area * multiplier);
      setEstimatedTons(tons);
    }
  }, [cropType, farmArea]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleOpenCreate = () => {
    setEditingListing(null);
    setCropType('paddy');
    setWasteType('straw');
    setFarmArea('10');
    setQuantity('15');
    setLocation(user?.location || 'Punjab, India');
    setPrice('1500');
    setFormStatus('Published');
    setError('');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (listing) => {
    setEditingListing(listing);
    setCropType(listing.cropType || 'paddy');
    setWasteType(listing.wasteType || 'straw');
    setFarmArea(listing.farmArea ? String(listing.farmArea) : '10');
    setQuantity(String(listing.quantityTons || ''));
    setLocation(listing.location || '');
    setPrice(String(listing.pricePerTon || ''));
    setFormStatus(listing.status || 'Published');
    setError('');
    setShowCreateModal(true);
  };

  const handleDelete = (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing? Active buyer inquiries will also be archived.')) {
      try {
        deleteListing(listingId);
        showToastMsg('Listing deleted successfully.');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSaveListing = (e) => {
    e.preventDefault();
    setError('');

    const qtyNum = parseFloat(quantity);
    const priceNum = parseFloat(price);
    const areaNum = parseFloat(farmArea);

    if (qtyNum <= 0 || priceNum <= 0) {
      setError('Quantity and price must be positive numbers');
      return;
    }

    try {
      if (editingListing) {
        updateListing(editingListing.id, {
          cropType,
          wasteType,
          farmArea: areaNum,
          quantityTons: qtyNum,
          pricePerTon: priceNum,
          location,
          status: formStatus,
          aiEstimatedTons: estimatedTons,
        });
        showToastMsg('Listing updated successfully!');
      } else {
        createListing({
          cropType,
          wasteType,
          farmArea: areaNum,
          quantityTons: qtyNum,
          pricePerTon: priceNum,
          location,
          status: formStatus,
          aiEstimatedTons: estimatedTons,
        });
        showToastMsg('New listing published to marketplace!');
      }
      setShowCreateModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredListings = listings.filter((l) => {
    if (statusFilter === 'All') return true;
    return l.status === statusFilter;
  });

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">{t('myListings')}</h1>
          <p className="page-subtitle">
            Manage your crop residue inventory, status transitions, and incoming buyer connections.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={handleOpenCreate}>
          <PlusCircle size={18} /> Create New Listing
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="table-filter-bar flex justify-between items-center mt-2 mb-1">
        <div className="flex items-center gap-1">
          <Filter size={16} color="var(--color-text-muted)" />
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>{t('filterBy')}:</span>
          {['All', 'Published', 'Interest Received', 'In Discussion', 'Matched', 'Draft'].map((st) => (
            <button
              key={st}
              className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
          Showing <strong>{filteredListings.length}</strong> of {listings.length} listings
        </span>
      </div>

      {/* Listings Table */}
      <div className="table-responsive card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Crop & Waste</th>
              <th>Quantity</th>
              <th>Expected Price</th>
              <th>Location</th>
              <th>Date Posted</th>
              <th>Buyer Inquiries</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No listings found for the selected status. Click <strong>"Create New Listing"</strong> to post your harvest residue.
                </td>
              </tr>
            ) : (
              filteredListings.map((l) => {
                const interestCount = (l.interestedBuyers || []).length;
                return (
                  <tr key={l.id}>
                    <td>
                      <div className="font-bold" style={{ textTransform: 'capitalize' }}>
                        {l.wasteType}
                      </div>
                      <span className="badge badge-subtle">{l.cropType}</span>
                    </td>
                    <td>
                      <span className="font-bold">{l.quantityTons} Tons</span>
                      {l.farmArea && (
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {l.farmArea} acres
                        </div>
                      )}
                    </td>
                    <td>
                      <strong className="text-accent">₹{l.pricePerTon}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}> / ton</span>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Total: ₹{((l.quantityTons || 0) * (l.pricePerTon || 0)).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>{l.location}</td>
                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td>
                      {interestCount > 0 ? (
                        <span className="badge badge-accent">
                          {interestCount} Buyer{interestCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>0</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-status-${(l.status || 'published').toLowerCase().replace(/\s+/g, '-')}`}>
                        {l.status || 'Published'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-end gap-1">
                        <button
                          className="btn-table-action"
                          title="View Details"
                          onClick={() => setSelectedListingForModal(l)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-table-action"
                          title="Edit Listing"
                          onClick={() => handleOpenEdit(l)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="btn-table-action text-danger"
                          title="Delete Listing"
                          onClick={() => handleDelete(l.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Create or Edit Listing */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center">
              <h2>{editingListing ? 'Edit Listing' : 'Create New Residue Listing'}</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveListing}>
              <div className="modal-body">
                {/* AI Estimation helper box */}
                <div className="ai-match-card mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Leaf color="var(--color-brand-primary)" size={18} />
                    <strong>AI Waste Yield Prediction</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    Based on your crop and acreage, expected harvest residue is ~<strong>{estimatedTons} Tons</strong>.
                  </p>
                </div>

                {error && (
                  <div className="alert-error mb-2 flex items-center gap-1">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label">{t('cropType')}</label>
                    <select
                      value={cropType}
                      onChange={(e) => {
                        setCropType(e.target.value);
                        if (e.target.value === 'paddy') setWasteType('straw');
                        if (e.target.value === 'sugarcane') setWasteType('bagasse');
                        if (e.target.value === 'wheat') setWasteType('straw');
                        if (e.target.value === 'cotton') setWasteType('stalks');
                        if (e.target.value === 'maize') setWasteType('stalks');
                      }}
                      className="form-select"
                    >
                      <option value="paddy">Paddy</option>
                      <option value="wheat">Wheat</option>
                      <option value="sugarcane">Sugarcane</option>
                      <option value="cotton">Cotton</option>
                      <option value="maize">Maize</option>
                      <option value="coconut">Coconut</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">{t('wasteType')}</label>
                    <input
                      type="text"
                      value={wasteType}
                      onChange={(e) => setWasteType(e.target.value)}
                      className="form-input"
                      placeholder="e.g. straw, bagasse, husk"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">{t('farmArea')}</label>
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
                    <label className="form-label">Quantity for Sale (Tons)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">{t('price')}</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="form-input"
                      placeholder="e.g. 1500"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">{t('status')}</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="Published">Published (Live in Market)</option>
                      <option value="Draft">Draft</option>
                      <option value="Interest Received">Interest Received</option>
                      <option value="In Discussion">In Discussion</option>
                      <option value="Matched">Matched</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">{t('location')}</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="form-input"
                      placeholder="District, State (e.g. Ludhiana, Punjab)"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer flex justify-end gap-1">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingListing ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Listing Details Reusable Modal */}
      {selectedListingForModal && (
        <ListingDetailsModal
          listing={selectedListingForModal}
          onClose={() => setSelectedListingForModal(null)}
          onNavigateToChat={() => onNavigate('messages')}
        />
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}
