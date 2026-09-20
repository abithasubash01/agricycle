// src/components/common/SimpleCharts.jsx
import React from 'react';

/**
 * Responsive SVG Bar Chart
 * @param {Array<{ label: string, value: number, color?: string }>} data
 * @param {number} height
 */
export function BarChart({ data = [], height = 220, unit = '' }) {
  if (!data || data.length === 0) return <div className="text-muted p-2">No chart data available.</div>;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = height - 40; // padding for labels
  const barWidth = 42;
  const gap = 24;
  const totalWidth = Math.max(data.length * (barWidth + gap) + 30, 320);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${totalWidth} ${height}`} style={{ overflow: 'visible' }}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight - ratio * (chartHeight - 30) + 15;
          const gridVal = Math.round(ratio * maxValue);
          return (
            <g key={idx}>
              <line x1="30" y1={y} x2={totalWidth - 10} y2={y} stroke="var(--color-border)" strokeDasharray="3 3" />
              <text x="25" y={y + 4} textAnchor="end" fontSize="10" fill="var(--color-text-muted)">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = Math.max((item.value / maxValue) * (chartHeight - 30), 4);
          const x = 40 + index * (barWidth + gap);
          const y = chartHeight - barHeight + 15;
          const barColor = item.color || 'var(--color-brand-primary)';

          return (
            <g key={index} className="chart-bar-group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="5"
                fill={barColor}
                style={{ transition: 'all 0.3s ease' }}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--color-text-main)"
              >
                {item.value}{unit}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-text-muted)"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Responsive SVG Donut Chart
 * @param {Array<{ label: string, value: number, color: string }>} data
 * @param {number} size
 */
export function DonutChart({ data = [], size = 180, centerText = '', centerSubtext = '' }) {
  if (!data || data.length === 0) return <div className="text-muted p-2">No distribution data.</div>;

  const total = data.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) return <div className="text-muted p-2">Total volume is 0.</div>;

  const radius = 65;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {data.map((item, index) => {
          const percent = item.value / total;
          const strokeDashoffset = circumference * (1 - percent);
          const rotation = accumulatedPercent * 360 - 90;
          accumulatedPercent += percent;

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(${rotation} ${center} ${center})`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          );
        })}
        {/* Center content */}
        <text x={center} y={center - 2} textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--color-text-main)">
          {centerText || total}
        </text>
        <text x={center} y={center + 16} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">
          {centerSubtext || 'Total'}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1" style={{ fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--color-text-muted)' }}>{item.label}</span>
            <span style={{ fontWeight: 600 }}>{((item.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Pipeline Progress Bar
 */
export function PipelineBar({ stages = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {stages.map((stage, idx) => (
        <div key={idx}>
          <div className="flex justify-between items-center mb-1" style={{ fontSize: '0.85rem' }}>
            <span className="font-semibold">{stage.label}</span>
            <span className="text-muted">{stage.count} items ({stage.percentage}%)</span>
          </div>
          <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${stage.percentage}%`,
                height: '100%',
                background: stage.color || 'var(--color-brand-primary)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
