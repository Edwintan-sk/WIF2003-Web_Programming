import React from 'react';

/**
 * Pure-SVG circular progress ring (donut) — no chart library needed.
 * Used to visualise an overall achievement score on the dashboards.
 *
 * @param {number} value      - Percentage 0–100
 * @param {number} size       - Diameter in px (default 140)
 * @param {number} stroke     - Ring thickness in px (default 12)
 * @param {string} color      - Foreground arc color
 * @param {string} trackColor - Background track color
 * @param {string} label      - Small caption under the value
 */
const ProgressRing = ({
  value = 0,
  size = 140,
  stroke = 12,
  color = '#0B2019',
  trackColor = '#E8E1D3',
  label = '',
}) => {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Counter-rotate the text back to upright */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(90 ${center} ${center})`}
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: size * 0.24, fill: 'var(--text-main)' }}
        >
          {clamped}%
        </text>
      </svg>
      {label && (
        <span
          className="text-secondary fw-bold text-uppercase mt-2"
          style={{ fontSize: '10px', letterSpacing: '1.5px' }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default ProgressRing;
