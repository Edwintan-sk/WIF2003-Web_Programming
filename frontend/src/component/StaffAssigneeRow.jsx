// Reusable staff assignee row with avatar, name, and progress bar.
// Used in the Assignment Center right panel.
// Props: staff { initials, name, progress (0-100) }
const StaffAssigneeRow = ({ staff }) => {
  return (
    <div
      className="d-flex align-items-center gap-3 py-3"
      style={{ borderBottom: '1px solid #F0EAE0' }}
    >
      {/* Avatar circle */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: '#F9E7DE',
          color: '#C85A3A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '12px',
          flexShrink: 0,
        }}
      >
        {staff.initials}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-main)',
            marginBottom: '6px',
          }}
        >
          {staff.name}
        </div>
        {/* Custom progress bar — uses existing theme.css classes */}
        <div className="progress-bar-wrapper">
          <div
            className="progress-fill"
            style={{ width: `${staff.progress}%`, backgroundColor: 'var(--sidebar-bg)' }}
          />
        </div>
      </div>

      <span
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          minWidth: '35px',
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {staff.progress}%
      </span>
    </div>
  );
};

export default StaffAssigneeRow;
