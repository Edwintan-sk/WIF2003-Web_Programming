import { useState } from 'react';
import { Badge } from 'react-bootstrap';
import CategoryBadge from './CategoryBadge';

// Reusable KPI list item for the Assignment Center left panel.
// Props: kpi { id, title, category, deadline, assignees[], status }, isSelected, onClick
const KpiSelectItem = ({ kpi, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#ffffffff' : hovered ? '#FAFAF8' : '#FAF5E8',
        border: `1px solid ${isSelected ? '#0F1317' : '#EAE3D2'}`,
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        marginBottom: '2px',
      }}
    >
      {/* Row 1: category badge + deadline */}
      <div className="d-flex align-items-center gap-2 mb-1">
        <CategoryBadge category={kpi.tag || kpi.category} style={{ fontSize: '10px', padding: '3px 8px' }} />
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#A8A092', letterSpacing: '0.5px' }}>
          {kpi.category?.toUpperCase()}
        </span>
        <span style={{ fontSize: '11px', color: '#6C757D' }}>· {kpi.deadline}</span>
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
        <div style={{ fontSize: '11px', color: '#6C757D' }}>
          Target <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{kpi.targetValue || '-'}</span> · {kpi.assignees?.length || 0} staff assigned
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
