// src/components/common/StatCard.jsx
import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'var(--color-brand-primary)', badge }) {
  return (
    <div className="stat-card">
      <div className="flex justify-between items-start">
        <div>
          <span className="stat-card-title">{title}</span>
          <div className="stat-card-value">{value}</div>
        </div>
        {Icon && (
          <div className="stat-card-icon" style={{ background: `${color}15`, color: color }}>
            <Icon size={24} />
          </div>
        )}
      </div>
      {(subtitle || badge) && (
        <div className="flex items-center gap-1 mt-1" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {badge && <span className="badge badge-subtle">{badge}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
