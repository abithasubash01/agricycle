// src/components/farmer/SalesTransactions.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchTransactions, updateTransactionStatus, subscribeToData } from '../../api/dataLayer';
import {
  BadgeDollarSign,
  AlertTriangle,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function SalesTransactions() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState('');

  const load = () => {
    const all = fetchTransactions();
    setTransactions(all.filter((tr) => tr.farmerId === user.id));
  };

  useEffect(() => {
    load();
    return subscribeToData(load);
  }, [user.id]);

  const handleStatusChange = (transId, newStatus) => {
    try {
      updateTransactionStatus(transId, newStatus);
      setToast(`Deal status updated to "${newStatus}"`);
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = transactions.filter((tr) => {
    if (statusFilter === 'All') return true;
    return tr.status === statusFilter;
  });

  const totalPotentialVolume = transactions.reduce((sum, tr) => sum + (Number(tr.quantityTons) || 0), 0);
  const totalEstimatedValue = transactions.reduce((sum, tr) => sum + (Number(tr.totalValue) || 0), 0);

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">{t('salesTransactions')}</h1>
          <p className="page-subtitle">
            Track residue supply agreements and procurement status across industrial off-takers.
          </p>
        </div>
      </div>

      {/* Mandatory Demo / Prototype Tracking Disclaimer Banner */}
      <div className="prototype-alert-banner flex items-start gap-1 mt-2 mb-2">
        <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>{t('prototypeNotice')}</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
            This interface records prototype deal lifecycles and commercial supply commitments. No automated banking, Escrow, or financial debit/credit operations are executed on this platform.
          </p>
        </div>
      </div>

      {/* Summary KPI Mini Cards */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="card">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Total Pipeline Residue</span>
          <div className="font-bold mt-1" style={{ fontSize: '1.6rem', color: 'var(--color-brand-primary)' }}>
            {totalPotentialVolume} Tons
          </div>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Committed across {transactions.length} inquiries</span>
        </div>

        <div className="card">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Estimated Total Pipeline Value</span>
          <div className="font-bold text-accent mt-1" style={{ fontSize: '1.6rem' }}>
            ₹{totalEstimatedValue.toLocaleString('en-IN')}
          </div>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Prototype estimated gross income</span>
        </div>

        <div className="card">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Active Off-Taker Buyers</span>
          <div className="font-bold mt-1" style={{ fontSize: '1.6rem' }}>
            {new Set(transactions.map((t) => t.buyerId)).size} Companies
          </div>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Industrial bio-fuel & packaging partners</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="table-filter-bar flex justify-between items-center mb-1">
        <div className="flex items-center gap-1">
          <Filter size={16} color="var(--color-text-muted)" />
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>{t('filterBy')}:</span>
          {['All', 'Interested', 'In Discussion', 'Matched', 'Completed'].map((st) => (
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
          {filtered.length} transactions
        </span>
      </div>

      {/* Transactions Table */}
      <div className="table-responsive card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Buyer / Off-Taker</th>
              <th>Crop & Waste</th>
              <th>Quantity</th>
              <th>Agreed Price</th>
              <th>Estimated Total Value</th>
              <th>Initiated Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Lifecycle Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No transactions recorded for this filter.
                </td>
              </tr>
            ) : (
              filtered.map((tr) => (
                <tr key={tr.id}>
                  <td>
                    <div className="font-bold">{tr.buyerName}</div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {tr.location || 'India'}
                    </span>
                  </td>
                  <td>
                    <div className="font-semibold capitalize">{tr.cropType} {tr.wasteType}</div>
                  </td>
                  <td>
                    <strong>{tr.quantityTons} Tons</strong>
                  </td>
                  <td>
                    <strong>₹{tr.pricePerTon}</strong>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}> / ton</span>
                  </td>
                  <td>
                    <strong className="text-accent">
                      ₹{tr.totalValue?.toLocaleString('en-IN')}
                    </strong>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Estimated gross</div>
                  </td>
                  <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {tr.date || 'Recent'}
                  </td>
                  <td>
                    <span className={`badge badge-status-${tr.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {tr.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <select
                      value={tr.status}
                      onChange={(e) => handleStatusChange(tr.id, e.target.value)}
                      className="form-select-sm"
                      title="Update transaction lifecycle status"
                    >
                      <option value="Interested">Interested</option>
                      <option value="In Discussion">In Discussion</option>
                      <option value="Matched">Matched</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}
