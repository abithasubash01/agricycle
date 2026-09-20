import React from 'react';

export default function AgriCycleLogo({ width = 40, height = 40, showText = true, textColor = 'var(--color-brand-primary)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular arrows representing Circular Economy */}
        <path d="M50 10C27.9086 10 10 27.9086 10 50C10 55.4382 11.0851 60.6237 13.0189 65.3528" stroke="var(--color-brand-primary)" strokeWidth="6" strokeLinecap="round"/>
        <path d="M12.915 65.7334L5.61719 59.9881M12.915 65.7334L20.8407 62.5937" stroke="var(--color-brand-primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        
        <path d="M50 90C72.0914 90 90 72.0914 90 50C90 44.5618 88.9149 39.3763 86.9811 34.6472" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round"/>
        <path d="M87.085 34.2666L94.3828 40.0119M87.085 34.2666L79.1593 37.4063" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Inner Leaf representing Agriculture */}
        <path d="M50 25C50 25 35 35 35 55C35 65 42 75 50 75C58 75 65 65 65 55C65 35 50 25 50 25Z" fill="var(--color-brand-secondary)"/>
        <path d="M50 75V25" stroke="var(--color-brand-primary)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M50 55C50 55 42 45 35 45" stroke="var(--color-brand-primary)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M50 45C50 45 58 35 65 35" stroke="var(--color-brand-primary)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      {showText && (
        <span style={{ 
          fontSize: `${width * 0.6}px`, 
          fontWeight: 700, 
          color: textColor,
          letterSpacing: '-0.5px'
        }}>
          AGRICYCLE
        </span>
      )}
    </div>
  );
}
