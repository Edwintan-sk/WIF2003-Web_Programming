import { Card } from 'react-bootstrap';

const StatCard = ({ title, value, subValue, color, percentage = false }) => {
  return (
    <Card className="stat-card">
      <Card.Body className="stat-card-body">
        {/* Title with the colored dot */}
        <div className="d-flex align-items-center mb-3">
          <div 
            className="rounded-circle me-2" 
            style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: color,
              flexShrink: 0
            }}
          ></div>
          <span className="stat-card-title">
            {title}
          </span>
        </div>
        
        {/* Large Stat Value */}
        <div className="d-flex align-items-baseline mb-3">
          <h2 className="serif-font fw-bold mb-0" style={{ fontSize: '32px' }}>{value}</h2>
          {percentage && <span className="ms-1 fw-bold">%</span>}
        </div>
        
        {/* Sub-value badge */}
        <div 
          className="stat-badge" 
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {subValue}
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;