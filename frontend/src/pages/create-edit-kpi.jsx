import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Row, Col, Card, Form, Button, Spinner, Alert
} from 'react-bootstrap';
import { ArrowUpRight, PersonFill, XLg } from 'react-bootstrap-icons';
import MilestoneRow from '../component/MilestoneRow';
import axiosInstance from '../utils/axiosInstance';
import '../styles/theme.css';

const EMPTY_KPI = {
  title: '',
  description: '',
  category: '',
  department: '',
  targetValue: '',
  unit: '',
  direction: 'Atleast (≥)',
  startDate: '',
  deadline: '',
  milestones: [],
  evidencePdf: false,
  evidenceImages: false,
  evidenceSpreadsheet: false,
  staffInstructions: '',
  assignee: '',
};

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

const CreateEditKpi = () => {
  const navigate  = useNavigate();
  const { kpiId } = useParams();
  const isEdit    = Boolean(kpiId && kpiId !== 'new');

  const [form, setForm] = useState(EMPTY_KPI);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffRes = await axiosInstance.get('/api/auth/staff');
        setStaffList(staffRes.data || []);
      } catch (err) {
        console.error('Failed to load staff list:', err);
      }
    };
    fetchStaff();
  }, []);

  useEffect(() => {
    if (isEdit && kpiId) {
      const fetchKPI = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await axiosInstance.get(`/api/kpi/${kpiId}`);
          const data = res.data;
          
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const d = new Date(dateString);
            return d.toISOString().split('T')[0];
          };

          setForm({
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            department: data.department || '',
            targetValue: data.targetValue || '',
            unit: data.unit || '',
            direction: data.direction || 'Atleast (≥)',
            startDate: formatDate(data.startDate),
            deadline: formatDate(data.targetDate),
            milestones: (data.milestones || []).map((m, idx) => ({
              id: m._id || idx,
              percentage: m.percentage || '',
              label: m.label || m.title || ''
            })),
            evidencePdf: data.evidencePdf || false,
            evidenceImages: data.evidenceImages || false,
            evidenceSpreadsheet: data.evidenceSpreadsheet || false,
            staffInstructions: data.staffInstructions || '',
            assignee: data.assignee || ''
          });
        } catch (err) {
          console.error('Failed to fetch KPI details:', err);
          setError('Failed to load KPI details from backend database.');
        } finally {
          setLoading(false);
        }
      };
      fetchKPI();
    } else {
      setForm(EMPTY_KPI);
    }
  }, [isEdit, kpiId]);

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addMilestone = () =>
    setForm((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { id: Date.now() + Math.random(), percentage: '', label: '' }],
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

  const handleSave = async (isPublish = false) => {
    try {
      if (!form.title || !form.category || !form.assignee || !form.deadline) {
        alert('Please fill in all required fields (*)');
        return;
      }
      
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        department: form.department,
        targetValue: form.targetValue,
        unit: form.unit,
        direction: form.direction,
        startDate: form.startDate ? new Date(form.startDate) : new Date(),
        targetDate: new Date(form.deadline),
        targetText: `${form.direction} ${form.targetValue} ${form.unit}`.trim(),
        evidencePdf: form.evidencePdf,
        evidenceImages: form.evidenceImages,
        evidenceSpreadsheet: form.evidenceSpreadsheet,
        staffInstructions: form.staffInstructions,
        assignee: form.assignee,
        status: isPublish ? 'In Progress' : 'Not Started',
        milestones: form.milestones.map(m => ({
          title: `${m.percentage} - ${m.label}`.trim() || 'Milestone Checkpoint',
          status: 'Pending',
          percentage: m.percentage,
          label: m.label
        }))
      };

      if (isEdit) {
        await axiosInstance.put(`/api/kpi/${kpiId}`, payload);
      } else {
        await axiosInstance.post('/api/kpi', payload);
      }
      navigate('/manager/all-kpis');
    } catch (err) {
      console.error('Failed to save KPI:', err);
      alert(err.response?.data?.message || 'Error occurred while saving KPI.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this KPI permanently? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`/api/kpi/${kpiId}`);
        navigate('/manager/all-kpis');
      } catch (err) {
        console.error('Failed to delete KPI:', err);
        alert(err.response?.data?.message || 'Error occurred while deleting KPI.');
      }
    }
  };

  const selectedStaff = staffList.find(s => s.email.toLowerCase() === (form.assignee || '').toLowerCase());
  const initials = selectedStaff ? `${selectedStaff.firstName[0]}${selectedStaff.lastName[0]}`.toUpperCase() : '??';
  const name = selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : (form.assignee || 'No staff assigned');
  const role = selectedStaff ? selectedStaff.roleAtShop || selectedStaff.positionTitle || 'Staff' : 'Staff';

  if (loading) {
    return (
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        <main className="w-100 d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="dark" className="me-2" />
          <span>Loading KPI details...</span>
        </main>
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="serif-font mb-0" style={{ fontWeight: 700 }}>
            {isEdit ? 'Edit KPI' : 'New KPI'}
          </h4>
          <div className="d-flex align-items-center gap-3">
            <Button 
              size="sm" 
              className="btn-light" 
              style={{ fontWeight: 600, fontSize: '13px', padding: '8px 16px', borderRadius: '6px' }}
              onClick={() => handleSave(false)}
            >
              Save as draft
            </Button>
            <Button 
              size="sm" 
              className="btn-orange" 
              style={{ fontWeight: 600, fontSize: '13px', padding: '8px 16px', borderRadius: '6px' }}
              onClick={() => handleSave(true)}
            >
              Publish KPI
            </Button>
            <Button
              variant="link"
              className="p-1 text-muted text-decoration-none ms-2"
              onClick={() => navigate('/manager/all-kpis')}
            >
              <XLg size={22} color="#A8A092" strokeWidth={1} />
            </Button>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="custom-card h-100">
              <Card.Body className="px-4 px-md-5 pb-4 pb-md-5 pt-3 pt-md-4">
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
                          <option value="Target">Target</option>
                          <option value="Project">Project</option>
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
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>Assign to Staff <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          className="form-control-light"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          value={form.assignee}
                          onChange={(e) => set('assignee', e.target.value)}
                        >
                          <option value="">Select staff member</option>
                          {staffList.map(staff => (
                            <option key={staff.id} value={staff.email}>
                              {staff.firstName} {staff.lastName} ({staff.email})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

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
                          <option value="">No Unit</option>
                          <option value="RM">RM</option>
                          <option value="%">%</option>
                          <option value="events">events</option>
                          <option value="articles">articles</option>
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

                <Row className="g-0">
                  <Col md={6} style={{ paddingRight: '24px', borderRight: '1px solid #F0EAE0' }}>
                    <div className="form-section border-0 p-0">
                      <p className="section-label" style={{ letterSpacing: '1.5px', marginBottom: '24px', fontSize: '12px' }}>TIMELINE</p>
                      
                      <div className="d-flex align-items-end mb-4">
                        <div className="flex-grow-1">
                          <Form.Label className="form-label mb-2" style={{ fontWeight: 600 }}>
                            Start date
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
                          style={{ backgroundColor: '#F9F7F4', fontSize: '12px'}}
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

          <Col lg={4}>
            <Card className="custom-card mb-4">
              <Card.Body className="p-4">
                <p className="section-label" style={{ letterSpacing: '1.5px', marginBottom: '24px', fontSize: '12px' }}>CURRENTLY ASSIGNED</p>

                {form.assignee ? (
                  <>
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#F9E7DE',
                            color: '#C85A3A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{name}</div>
                          <div style={{ fontSize: '11px', color: '#6C757D', marginTop: '2px' }}>{role}</div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="light"
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                      style={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #E8E1D3', 
                        color: '#1A1A1A', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        padding: '10px',
                        borderRadius: '6px'
                      }}
                      onClick={() => navigate('/manager/assign')}
                    >
                      Manage in assignment center <ArrowUpRight size={13} className="text-muted" />
                    </Button>
                  </>
                ) : (
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '8px',
                      backgroundColor: '#F9F7F4',
                      border: '1px dashed #D8CFC2',
                      textAlign: 'center',
                    }}
                  >
                    <PersonFill size={28} className="mb-3" style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: '13px', color: '#6C757D', fontWeight: 500, marginBottom: '12px' }}>No staff assigned yet</p>
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      style={{ color: 'var(--accent-orange)', fontSize: '12px', fontWeight: 600 }}
                      onClick={() => navigate('/manager/assign')}
                    >
                      Go to assignment center →
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {isEdit && (
              <div className="px-1">
                <Button
                  className="mb-2 px-4 w-100"
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
