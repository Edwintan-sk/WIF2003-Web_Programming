import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Row, Col, Card, Form, Button, Spinner, Alert, Badge,
} from 'react-bootstrap';
import { PersonFill, XLg, ArrowUpRight } from 'react-bootstrap-icons';
import MilestoneRow from '../component/MilestoneRow';
import api from '../utils/axiosInstance';
import '../styles/theme.css';

const ASSIGNMENT_CENTER_PATH = '/manager/assign';

const EMPTY_KPI = {
  title: '',
  description: '',
  category: '',
  department: '',
  targetValue: '',
  unit: 'RM',
  direction: 'Atleast (≥)',
  startDate: '',
  deadline: '',
  milestones: [],
  assignees: [],
  evidencePdf: false,
  evidenceImages: false,
  evidenceSpreadsheet: false,
  staffInstructions: '',
};

// Custom styled checkbox card matching Figma
const EvidenceCard = ({ checked, onChange, title, desc }) => (
  <div
    className="mb-2 p-3 d-flex align-items-center"
    style={{
      border: checked ? '1px solid #0B5E3A' : '1px solid #E8E1D3',
      borderRadius: '8px',
      backgroundColor: checked ? '#F0F7F4' : '#FFFFFF',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
    onClick={() => onChange(!checked)}
  >
    <div
      className="me-3 d-flex justify-content-center align-items-center"
      style={{
        width: '16px', height: '16px',
        border: checked ? 'none' : '1px solid #D8CFC2',
        backgroundColor: checked ? '#0B5E3A' : 'transparent',
        borderRadius: '2px',
        flexShrink: 0
      }}
    />
    <div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{title}</div>
      <div style={{ fontSize: '11px', color: '#6C757D', marginTop: '2px' }}>{desc}</div>
    </div>
  </div>
);

// ─── Component ───────────────────────────────────────────────────────────────

const CreateEditKpi = () => {
  const navigate  = useNavigate();
  const { kpiId } = useParams();
  const isEdit    = Boolean(kpiId && kpiId !== 'new');

  const [form, setForm]             = useState(EMPTY_KPI);
  const [staffList, setStaffList]   = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [isLoading, setIsLoading]   = useState(isEdit); // only show spinner in edit mode
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving]   = useState(false);
  const [saveError, setSaveError] = useState(null);

  // load existing KPI in edit mode
  useEffect(() => {
    if (!isEdit) return;
    const loadKpi = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await api.get(`/api/kpi/${kpiId}`);
        const kpi = response.data;
        setForm({
          title: kpi.title || '',
          description: kpi.description || '',
          category: kpi.category || '',
          department: kpi.department || '',
          targetValue: kpi.targetValue != null ? String(kpi.targetValue) : '',
          unit: kpi.unit || 'RM',
          direction: kpi.direction || 'Atleast (≥)',
          // date inputs need YYYY-MM-DD — slice the ISO string to get just the date part
          startDate: kpi.startDate ? kpi.startDate.slice(0, 10) : '',
          deadline: kpi.targetDate ? kpi.targetDate.slice(0, 10) : '',
          milestones: (kpi.milestones || []).map((m) => ({
            id: String(m._id),
            percentage: m.percentage || '',
            label: m.title || '',   // schema stores as title, form uses label
            status: m.status,
          })),
          evidencePdf: kpi.evidenceRequirements?.pdf || false,
          evidenceImages: kpi.evidenceRequirements?.images || false,
          evidenceSpreadsheet: kpi.evidenceRequirements?.spreadsheet || false,
          staffInstructions: kpi.staffInstructions || '',
          assignees: kpi.assignees || [],
        });
      } catch (err) {
        console.error('Error loading KPI:', err);
        setLoadError(err.response?.data?.message || err.message || 'Failed to load KPI.');
      } finally {
        setIsLoading(false);
      }
    };
    loadKpi();
  }, [kpiId, isEdit]);

  // fetch staff list once on mount to populate the assignee dropdown
  useEffect(() => {
    const loadStaff = async () => {
      setStaffLoading(true);
      try {
        const res = await api.get('/api/users/staff');
        setStaffList(res.data.data || []);
      } catch (err) {
        console.error('Failed to load staff list:', err);
      } finally {
        setStaffLoading(false);
      }
    };
    loadStaff();
  }, []);

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addMilestone = () =>
    setForm((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { id: Date.now(), percentage: '', label: '' }],
    }));

  const updateMilestone = (id, updated) =>
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...updated, id } : m)),
    }));

  const removeMilestone = (id) =>
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));

  // inverse of the controller's mapping — form state → API payload
  const buildPayload = (status) => {
    const payload = {
      title: form.title,
      category: form.category,
      description: form.description,
      department: form.department,
      targetValue: form.targetValue,
      unit: form.unit,
      direction: form.direction,
      startDate: form.startDate || null,
      deadline: form.deadline,
      evidenceRequirements: {
        pdf: form.evidencePdf,
        images: form.evidenceImages,
        spreadsheet: form.evidenceSpreadsheet,
      },
      staffInstructions: form.staffInstructions,
      assignees: form.assignees,
      milestones: form.milestones.map((m) => ({
        label: m.label,
        percentage: m.percentage,
        status: m.status,
      })),
    };
    // on edit + publish: omit status so an in-progress KPI isn't downgraded
    if (status) payload.status = status;
    return payload;
  };

  const handleSave = async (status) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      const payload = buildPayload(status);
      if (isEdit) {
        await api.put(`/api/kpi/${kpiId}`, payload);
      } else {
        await api.post('/api/kpi', payload);
      }
      navigate('/manager/all-kpis');
    } catch (err) {
      console.error('Error saving KPI:', err);
      setSaveError(err.response?.data?.message || err.message || 'Failed to save KPI.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this KPI permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/api/kpi/${kpiId}`);
      navigate('/manager/all-kpis');
    } catch (err) {
      console.error('Error deleting KPI:', err);
      setSaveError(err.response?.data?.message || err.message || 'Failed to delete KPI.');
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" size="sm" className="me-2" /> Loading KPI...
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: '48px' }}>
        <Alert variant="danger">{loadError}</Alert>
        <Button variant="link" onClick={() => navigate('/manager/all-kpis')}>← Back to All KPIs</Button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--main-bg)',
        minHeight: '100vh',
        padding: '32px 48px',
      }}
    >
      {/* Centred wrapper */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Title + action buttons */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="serif-font mb-0" style={{ fontWeight: 700 }}>
            {isEdit ? 'Edit KPI' : 'New KPI'}
          </h4>
          <div className="d-flex align-items-center gap-3">
            {/* Save as draft */}
            <Button
              size="sm"
              className="btn-light"
              style={{ fontWeight: 600, fontSize: '13px', padding: '8px 16px', borderRadius: '6px' }}
              disabled={isSaving}
              onClick={() => handleSave('Draft')}
            >
              {isSaving ? <Spinner animation="border" size="sm" /> : 'Save as draft'}
            </Button>
            {/* Publish KPI — status: 'Not Started' on create, omit on edit */}
            <Button
              size="sm"
              className="btn-orange"
              style={{ fontWeight: 600, fontSize: '13px', padding: '8px 16px', borderRadius: '6px' }}
              disabled={isSaving}
              onClick={() => handleSave(isEdit ? null : 'Not Started')}
            >
              {isSaving ? <Spinner animation="border" size="sm" /> : 'Publish KPI'}
            </Button>
            {/* Close */}
            <Button
              variant="link"
              className="p-1 text-muted text-decoration-none ms-2"
              onClick={() => navigate('/manager/all-kpis')}
            >
              <XLg size={22} color="#A8A092" strokeWidth={1} />
            </Button>
          </div>
        </div>

        {saveError && (
          <Alert variant="danger" dismissible onClose={() => setSaveError(null)} className="mb-4">
            {saveError}
          </Alert>
        )}

        {/* ── Body: two-column layout ────────────────────────────── */}
        <Row className="g-4">

          {/* ── LEFT: Form ─────────────────────────────────────── */}
          <Col lg={8}>
            <Card className="custom-card h-100">
              <Card.Body className="px-4 px-md-5 pb-4 pb-md-5 pt-3 pt-md-4">

                {/* BASIC INFORMATION */}
                <div className="form-section mb-4 pb-4">
                  <p className="section-label mt-0" style={{ letterSpacing: '1.5px', marginBottom: '24px', fontSize: '12px' }}>BASIC INFORMATION</p>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="form-label mb-0" style={{ fontWeight: 600 }}>
                        KPI title <span className="text-danger">*</span>
                      </Form.Label>
                      <span style={{ fontSize: '11px', color: '#A8A092', fontWeight: 600, letterSpacing: '1px' }}>
                        {form.title.length} / 80
                      </span>
                    </div>
                    <Form.Control
                      type="text"
                      className="form-control-light"
                      style={{ fontSize: '12px' }}
                      placeholder="Monthly sales revenue target"
                      maxLength={80}
                      value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>
                      Description - what does this KPI measure?
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      className="form-control-light"
                      placeholder="Total revenue generated by the assigned staff member within the calendar month..."
                      style={{ fontSize: '12px' }}
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                    />
                  </Form.Group>

                  <Row className="g-5">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>
                          Category <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          className="form-control-light"
                          style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
                          value={form.category}
                          onChange={(e) => set('category', e.target.value)}
                        >
                          <option value="">Select category</option>
                          <option value="Community">Community</option>
                          <option value="Content">Content</option>
                          <option value="Internal">Internal</option>
                          <option value="Partnerships">Partnerships</option>
                          <option value="Project Mgmt">Project Mgmt</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>Department</Form.Label>
                        <Form.Select
                          className="form-control-light"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          value={form.department}
                          onChange={(e) => set('department', e.target.value)}
                        >
                          <option value="">Select department</option>
                          <option value="Business Development">Business Development</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operations">Operations</option>
                          <option value="Finance">Finance</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* TARGET & MEASUREMENT */}
                <div className="form-section mb-4 pb-4">
                  <p className="section-label" style={{ letterSpacing: '1.5px', marginBottom: '24px', fontSize: '12px' }}>TARGET &amp; MEASUREMENT</p>
                  <Row className="g-5">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>
                          Target value <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          className="form-control-light"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          placeholder="25000"
                          value={form.targetValue}
                          onChange={(e) => set('targetValue', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>Unit of measurement</Form.Label>
                        <Form.Select
                          className="form-control-light"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          value={form.unit}
                          onChange={(e) => set('unit', e.target.value)}
                        >
                          <option value="RM">RM</option>
                          <option value="%">%</option>
                          <option value="events">events</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>Measurement direction</Form.Label>
                        <Form.Select
                          className="form-control-light"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          value={form.direction}
                          onChange={(e) => set('direction', e.target.value)}
                        >
                          <option value="Atleast (≥)">Atleast (≥)</option>
                          <option value="Atmost (≤)">Atmost (≤)</option>
                          <option value="Exact (=)">Exact (=)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

            {/* TIMELINE | EVIDENCE REQUIREMENT — side by side */}
                <Row className="g-0">
              {/* TIMELINE */}
                  <Col md={6} style={{ paddingRight: '24px', borderRight: '1px solid #F0EAE0' }}>
                    <div className="form-section border-0 p-0">
                      <p className="section-label" style={{ letterSpacing: '1.5px', marginBottom: '24px', fontSize: '12px' }}>TIMELINE</p>

                      <div className="d-flex align-items-end mb-4">
                        <div className="flex-grow-1">
                          <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>
                            Start date <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="date"
                            className="form-control-light"
                            style={{ padding: '6px 6px', fontSize: '12px' }}
                            value={form.startDate}
                            onChange={(e) => set('startDate', e.target.value)}
                          />
                        </div>
                        <span className="mx-3 mb-2 text-muted" style={{ fontSize: '13px', fontWeight: 500 }}>to</span>
                        <div className="flex-grow-1">
                          <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>
                            Deadline <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="date"
                            className="form-control-light"
                            style={{ padding: '6px 6px', fontSize: '12px' }}
                            value={form.deadline}
                            onChange={(e) => set('deadline', e.target.value)}
                          />
                        </div>
                      </div>

                      <Form.Label className="form-label mb-3" style={{ fontWeight: 600 }}>
                        Milestone checkpoints{' '}
                        <span className="text-muted fw-normal">(optional)</span>
                      </Form.Label>
                      <div className="milestones-list mb-3">
                        {form.milestones.map((m) => (
                          <MilestoneRow
                            key={m.id}
                            milestone={m}
                            onChange={(updated) => updateMilestone(m.id, updated)}
                            onRemove={() => removeMilestone(m.id)}
                          />
                        ))}
                      </div>
                      <Button
                        variant="light"
                        className="w-100 p-2"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E8E1D3',
                          color: '#1A1A1A',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '6px'
                        }}
                        onClick={addMilestone}
                      >
                        + Add milestone
                      </Button>
                    </div>
              </Col>

              {/* EVIDENCE REQUIREMENT */}
                  <Col md={6} style={{ paddingLeft: '24px' }}>
                    <div className="form-section border-0 p-0">
                      <p className="section-label" style={{ letterSpacing: '1.5px', marginBottom: '24px', fontSize: '12px' }}>EVIDENCE REQUIREMENT</p>

                      <div className="mb-4">
                        <EvidenceCard
                          title="PDF documents"
                          desc="Sales reports, invoices, contracts"
                          checked={form.evidencePdf}
                          onChange={(v) => set('evidencePdf', v)}
                        />
                        <EvidenceCard
                          title="Images (JPG, PNG)"
                          desc="Screenshots, photos of receipts"
                          checked={form.evidenceImages}
                          onChange={(v) => set('evidenceImages', v)}
                        />
                        <EvidenceCard
                          title="Spreadsheet files (XLSX)"
                          desc="Data exports, tracking sheets"
                          checked={form.evidenceSpreadsheet}
                          onChange={(v) => set('evidenceSpreadsheet', v)}
                        />
                      </div>

                      <Form.Group>
                        <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>Instruction for staff</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          className="form-control-light"
                          style={{ backgroundColor: '#F9F7F4', fontSize: '12px' }}
                          placeholder="e.g Upload your monthly sales report exported from the CRM system. File must show your name and the date range."
                          value={form.staffInstructions}
                          onChange={(e) => set('staffInstructions', e.target.value)}
                        />
                      </Form.Group>
                    </div>
              </Col>
            </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* ── RIGHT: Assigned + Actions ───────────────────────── */}
          <Col lg={4}>

            {/* White card — CURRENTLY ASSIGNED */}
            <Card className="custom-card mb-4">
              <Card.Body className="p-4">
                <p className="section-label" style={{ letterSpacing: '1.5px', marginBottom: '16px', fontSize: '12px' }}>ASSIGN STAFF</p>

                {/* Dropdown — only shows staff not already selected */}
                <Form.Select
                  className="form-control-light mb-3"
                  style={{ fontSize: '12px' }}
                  value=""
                  disabled={staffLoading}
                  onChange={(e) => {
                    const email = e.target.value;
                    if (email && !form.assignees.includes(email)) {
                      set('assignees', [...form.assignees, email]);
                    }
                  }}
                >
                  <option value="">
                    {staffLoading ? 'Loading staff...' : '+ Add assignee'}
                  </option>
                  {staffList
                    .filter((s) => !form.assignees.includes(s.email))
                    .map((s) => (
                      <option key={s._id} value={s.email}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))
                  }
                </Form.Select>

                {/* Selected assignee tags or empty state */}
                {form.assignees.length === 0 ? (
                  <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#F9F7F4', border: '1px dashed #D8CFC2', textAlign: 'center' }}>
                    <PersonFill size={24} className="mb-2" style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: '12px', color: '#6C757D', margin: 0 }}>No staff assigned yet</p>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {form.assignees.map((email) => {
                      const s = staffList.find((x) => x.email === email);
                      const label = s ? `${s.firstName} ${s.lastName}` : email;
                      return (
                        <Badge
                          key={email}
                          style={{
                            backgroundColor: '#cfe2ff',
                            color: '#084298',
                            fontWeight: 600,
                            fontSize: '12px',
                            padding: '6px 10px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          {label}
                          <span
                            role="button"
                            style={{ cursor: 'pointer', fontWeight: 700, fontSize: '14px', lineHeight: 1 }}
                            onClick={() => set('assignees', form.assignees.filter((a) => a !== email))}
                          >
                            ×
                          </span>
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <Button
                  variant="light"
                  className="w-100 d-flex align-items-center justify-content-center gap-2 mt-3"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E1D3',
                    color: '#1A1A1A',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '10px',
                    borderRadius: '6px',
                  }}
                  onClick={() => navigate(ASSIGNMENT_CENTER_PATH)}
                >
                  Manage in assignment center <ArrowUpRight size={13} className="text-muted" />
                </Button>
              </Card.Body>
            </Card>

            {/* Archive + Delete */}
            {isEdit && (
              <div className="px-1">
                <Button
                  className="mb-2 px-4"
                  style={{
                    backgroundColor: '#0B2019',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '13px',
                    borderRadius: '8px',
                    padding: '10px',
                  }}
                >
                  Archive this KPI
                </Button>
                <p style={{ fontSize: '12px', color: '#6C757D', marginBottom: '32px', lineHeight: 1.4 }}>
                  Archiving hides this KPI from staff but keeps all records.
                </p>

                <Button
                  className="mb-2 px-4"
                  style={{
                    backgroundColor: '#B31B1B',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '13px',
                    borderRadius: '8px',
                    padding: '10px',
                  }}
                  onClick={handleDelete}
                >
                  Delete permanently
                </Button>
                <p style={{ fontSize: '12px', color: '#B31B1B', fontWeight: 600, marginBottom: 0 }}>
                  Deleting is permanent and cannot be undone.
                </p>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CreateEditKpi;
