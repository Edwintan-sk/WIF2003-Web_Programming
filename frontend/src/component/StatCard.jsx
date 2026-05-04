import { Card } from 'react-bootstrap';

const StatCard = ({ title, value, subValue, color, percentage = false }) => {
  return (
    <Card className="kpi-card h-100 p-2">
      <Card.Body>
        {/* Title with the colored square dot */}
        <div className="d-flex align-items-center mb-3">
          <div 
            className="rounded-circle me-2" 
            style={{ width: '8px', height: '8px', backgroundColor: color }}
          ></div>
          <span className="sidebar-header text-muted" style={{ fontSize: '10px' }}>
            {title}
          </span>
        </div>
        
        {/* Large Stat Value */}
        <div className="d-flex align-items-baseline">
          <h2 className="serif-font fw-bold mb-2">{value}</h2>
          {percentage && <span className="ms-1 fw-bold">%</span>}
        </div>
        
        {/* Sub-value badge (e.g., +12% or 3 new) */}
        <div 
          className="badge rounded-pill" 
          style={{ backgroundColor: `${color}20`, color: color, fontSize: '10px' }}
        >
          {subValue}
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;