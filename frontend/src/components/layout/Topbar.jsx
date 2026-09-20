// src/components/layout/Topbar.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { resetDemoData } from '../../api/dataLayer';
import AgriCycleLogo from '../AgriCycleLogo';
import { LogOut, RefreshCw, Globe, Menu } from 'lucide-react';

export default function Topbar({ onToggleMobileMenu, onNavigateHome }) {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const handleReset = () => {
    if (window.confirm(t('confirmReset'))) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left flex items-center gap-1">
        {onToggleMobileMenu && (
          <button className="mobile-menu-btn" onClick={onToggleMobileMenu} aria-label="Toggle menu">
            <Menu size={22} />
          </button>
        )}
        <div style={{ cursor: 'pointer' }} onClick={onNavigateHome} title="Go to home">
          <AgriCycleLogo width={34} height={34} textColor="white" />
        </div>
      </div>

      <div className="topbar-right flex items-center gap-1">
        {/* Role identifier badge */}
        {user && (
          <span className="topbar-portal-tag">
            {user.role === 'farmer' ? '🌾 Farmer Portal' : '🏭 Buyer Portal'}
          </span>
        )}

        {/* 8-Language Selector */}
        <div className="flex items-center language-picker-wrap">
          <Globe size={16} color="rgba(255,255,255,0.7)" />
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="topbar-lang-select"
            aria-label="Select Language"
          >
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="ml">മലയാളം (Malayalam)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleReset}
          className="topbar-icon-btn"
          title={t('resetDemo')}
        >
          <RefreshCw size={17} />
        </button>

        {/* User Pill & Logout */}
        {user && (
          <div className="topbar-user-pill">
            <span className="user-name">{user.name}</span>
            <button
              onClick={logout}
              className="topbar-logout-btn"
              title={t('logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
