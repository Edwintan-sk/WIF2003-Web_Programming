import { Form, Button } from 'react-bootstrap'; // react-bootstrap
import { XLg } from 'react-bootstrap-icons';

// Reusable milestone checkpoint row used in the Create/Edit KPI form.
// Props: milestone { id, percentage, label }, onChange(updatedMilestone), onRemove()
const MilestoneRow = ({ milestone, onChange, onRemove }) => {
  return (
    <div className="d-flex gap-2 align-items-center mb-2">
      {/* Form.Control (text) for percentage — react-bootstrap */}
      <Form.Control
        type="text"
        className="form-control-light text-center"
        style={{ width: '60px', fontSize: '12px' }}
        placeholder="25%"
        value={milestone.percentage}
        onChange={(e) => onChange({ ...milestone, percentage: e.target.value })}
      />
      {/* Form.Control (text) for label/date — react-bootstrap */}
      <Form.Control
        type="text"
        className="form-control-light"
        placeholder="e.g. Apr 25 - First week check-in"
        style={{ fontSize: '12px', flex: 1 }}
        value={milestone.label}
        onChange={(e) => onChange({ ...milestone, label: e.target.value })}
      />
      {/* Button (link/icon) — react-bootstrap */}
      <Button
        variant="link"
        className="p-1 text-danger"
        style={{ flexShrink: 0, lineHeight: 1, border: '1px solid #DC3545', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={onRemove}
      >
        <XLg size={12} color="#DC3545" />
      </Button>
    </div>
  );
};

export default MilestoneRow;
