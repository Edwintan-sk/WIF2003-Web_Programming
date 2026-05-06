import React from 'react';

const CATEGORY_STYLES = {
  'community': { bg: '#E8F0ED', color: '#0B5E3A' },
  'content': { bg: '#FDECEE', color: '#DC3545' },
  'project mgmt': { bg: '#E6F0FD', color: '#0B5ED7' },
  'partnerships': { bg: '#E0F2F1', color: '#00796B' },
  'target': { bg: '#FFF3CD', color: '#856404' },
};

const DEFAULT_STYLE = { bg: '#F0EAE0', color: '#1A1A1A' };

const CategoryBadge = ({ category, style = {}, className = "" }) => {
  if (!category) return null;
  
  const key = category.toString().toLowerCase();
  const theme = CATEGORY_STYLES[key] || DEFAULT_STYLE;

  return (
    <div
      className={className}
      style={{
        backgroundColor: theme.bg,
        color: theme.color,
        fontSize: '11px',
        fontWeight: 600,
        padding: '5px 10px',
        borderRadius: '6px',
        letterSpacing: '0.5px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {category}
    </div>
  );
};

export default CategoryBadge;
