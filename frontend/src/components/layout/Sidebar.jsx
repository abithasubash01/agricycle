// src/components/layout/Sidebar.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Layers,
  Inbox,
  MessageSquare,
  BadgeDollarSign,
  BarChart3,
  Landmark,
  User,
  Search,
  FileText,
  Heart,
  Truck,
  Building2,
  Leaf
} from 'lucide-react';

export default function Sidebar({ currentRoute, onNavigate, badgeCounts = {} }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const isFarmer = user.role === 'farmer';

  const farmerNavItems = [
    { id: 'dashboard', label: t('farmerDashboard'), icon: LayoutDashboard },
    { id: 'my-listings', label: t('myListings'), icon: Layers, badge: badgeCounts.listings },
    { id: 'buyer-requests', label: t('buyerRequests'), icon: Inbox, badge: badgeCounts.buyerRequests },
    { id: 'messages', label: t('messages'), icon: MessageSquare, badge: badgeCounts.messages },
    { id: 'sales-transactions', label: t('salesTransactions'), icon: BadgeDollarSign },
    { id: 'farmer-analytics', label: t('farmerAnalytics'), icon: BarChart3 },
    { id: 'government-support', label: t('govSupport'), icon: Landmark },
    { id: 'farmer-profile', label: t('farmerProfile'), icon: User },
  ];

  const buyerNavItems = [
    { id: 'dashboard', label: t('buyerDashboard'), icon: LayoutDashboard },
    { id: 'discover-waste', label: t('discoverWaste'), icon: Search },
    { id: 'my-requirements', label: t('myRequirements'), icon: FileText, badge: badgeCounts.requirements },
    { id: 'interested-listings', label: t('interestedListings'), icon: Heart, badge: badgeCounts.interested },
    { id: 'messages', label: t('messages'), icon: MessageSquare, badge: badgeCounts.messages },
    { id: 'procurement', label: t('procurement'), icon: Truck, badge: badgeCounts.procurement },
    { id: 'buyer-analytics', label: t('buyerAnalytics'), icon: BarChart3 },
    { id: 'company-profile', label: t('companyProfile'), icon: Building2 },
  ];

  const navItems = isFarmer ? farmerNavItems : buyerNavItems;

  return (
    <aside className="portal-sidebar">
      <div className="sidebar-role-badge">
        <span className="role-dot" />
        <div>
          <div className="sidebar-role-title">
            {isFarmer ? '🌾 Farmer Portal' : '🏭 Buyer Portal'}
          </div>
          <div className="sidebar-role-subtitle">{user.name}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={19} className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Environmental Impact quick access link */}
      <div className="sidebar-footer">
        <button
          className={`sidebar-link impact-link ${currentRoute === 'impact' ? 'active' : ''}`}
          onClick={() => onNavigate('impact')}
        >
          <Leaf size={18} color="var(--color-brand-primary)" />
          <span className="sidebar-label">{t('impact')}</span>
        </button>
      </div>
    </aside>
  );
}
