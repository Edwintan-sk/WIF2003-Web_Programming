import React from 'react';

// Keys/colors mirror backend constants.js CATEGORY_COLORS for the 5 real categories.
const CATEGORY_STYLES = {
  'community': { bg: '#e2efe9', color: '#183628' },
  'content': { bg: '#fae3e0', color: '#de5c44' },
  'internal': { bg: '#faebd7', color: '#c99552' },
  'partnerships': { bg: '#e6f4ea', color: '#1b6a38' },
  'project mgmt': { bg: '#e6ebf1', color: '#597495' },
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
