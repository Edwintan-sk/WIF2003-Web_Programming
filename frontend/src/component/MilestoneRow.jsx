import { Form, Button } from 'react-bootstrap'; // react-bootstrap
import { XLg } from 'react-bootstrap-icons';

// Reusable milestone checkpoint row used in the Create/Edit KPI form.
// Props: milestone { id, date, label }, onChange(updatedMilestone), onRemove()
const MilestoneRow = ({ milestone, onChange, onRemove }) => {
  return (
    <div className="d-flex gap-2 align-items-center mb-2">
      {/* Form.Control (date) — react-bootstrap */}
      <Form.Control
        type="date"
        className="form-control-light"
        style={{ maxWidth: '148px', fontSize: '12px' }}
        value={milestone.date}
        onChange={(e) => onChange({ ...milestone, date: e.target.value })}
      />
      {/* Form.Control (text) — react-bootstrap */}
      <Form.Control
        type="text"
        className="form-control-light"
        placeholder="Milestone label"
        style={{ fontSize: '12px' }}
        value={milestone.label}
        onChange={(e) => onChange({ ...milestone, label: e.target.value })}
      />
      {/* Button (link/icon) — react-bootstrap */}
      <Button
        variant="link"
        className="p-1 text-danger"
        onClick={onRemove}
        style={{ flexShrink: 0, lineHeight: 1 }}
      >
        <XLg size={13} />
      </Button>
    </div>
  );
};

export default MilestoneRow;
