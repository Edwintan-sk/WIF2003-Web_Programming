import { useState } from 'react';
import { Badge } from 'react-bootstrap'; // react-bootstrap

const getCategoryColor = (category) => {
  switch (category) {
    case 'Target':  return '#E85D3F';
    case 'Project': return '#0B2019';
    default:        return '#6C757D';
  }
};

// Reusable KPI list item for the Assignment Center left panel.
// Props: kpi { id, title, category, deadline, assignees[], status }, isSelected, onClick
const KpiSelectItem = ({ kpi, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const color = getCategoryColor(kpi.category);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#FFF5F1' : hovered ? '#FAFAF8' : 'transparent',
        borderLeft: `3px solid ${isSelected ? 'var(--accent-orange)' : 'transparent'}`,
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        marginBottom: '2px',
      }}
    >
      {/* Row 1: category badge + deadline */}
      <div className="d-flex align-items-center gap-2 mb-1">
        {/* Badge — react-bootstrap */}
        <Badge
          style={{
            backgroundColor: `${color}18`,
            color,
            fontSize: '10px',
            fontWeight: 600,
            padding: '3px 8px',
          }}
        >
          ● {kpi.category}
        </Badge>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{kpi.deadline}</span>
      </div>

      {/* Row 2: title */}
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-main)',
          lineHeight: 1.35,
          marginBottom: '6px',
        }}
      >
        {kpi.title}
      </div>

      {/* Row 3: assignee avatars + optional status badge */}
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex gap-1">
          {kpi.assignees?.slice(0, 4).map((initials, idx) => (
            <span
              key={idx}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#E8F0ED',
                color: '#0B2019',
                fontSize: '8px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {initials}
            </span>
          ))}
        </div>

        {kpi.status && (
          /* Badge — react-bootstrap */
          <Badge
            style={{
              backgroundColor: kpi.status === 'Success' ? '#E8F0ED' : '#F3F0FF',
              color: kpi.status === 'Success' ? '#0B5E3A' : '#5B21B6',
              fontSize: '10px',
              fontWeight: 600,
              padding: '3px 8px',
            }}
          >
            {kpi.status}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default KpiSelectItem;
