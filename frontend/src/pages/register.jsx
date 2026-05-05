import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Envelope, Lock, Eye, EyeSlash, Person, Telephone, CheckCircleFill,
} from 'react-bootstrap-icons';

const initialForm = {
  role: 'manager',
  photo: null,
  firstName: '',
  lastName: '',
  englishName: '',
  pronouns: '',
  roleAtShop: '',
  positionTitle: '',
  countryCode: '+60',
  phone: '',
  employeeId: '',
  email: '',
  password: '',
  confirmPassword: '',
  confirmed: false,
};

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.confirmed) return;
    alert('Registration request submitted!');
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <form
        className="auth-card wide"
        onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); next(); }}
      >
        <div className="brand-row">
          <div className="brand-mark">K</div>
          <div className="brand-name">Kempen</div>
        </div>

        <div className="stepper">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`step-dot ${step >= n ? 'active' : ''}`} />
          ))}
        </div>

        {step === 1 && <StepRole form={form} update={update} />}
        {step === 2 && <StepDetails form={form} update={update} />}
        {step === 3 && (
          <StepPassword
            form={form}
            update={update}
            showPwd={showPwd}
            setShowPwd={setShowPwd}
            showConfirm={showConfirm}
            setShowConfirm={setShowConfirm}
          />
        )}
        {step === 4 && <StepReview form={form} update={update} />}

        <div className="step-nav">
          {step > 1 ? (
            <button type="button" className="btn-step-back" onClick={back}>
              Back
            </button>
          ) : (
            <Link to="/login" className="btn-step-back" style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Sign in
            </Link>
          )}
          <button
            type="submit"
            className="btn-step-next"
            disabled={step === 4 && !form.confirmed}
          >
            {step === 4 ? 'Submit Request' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Step 1: Role ---------- */
function StepRole({ form, update }) {
  return (
    <>
      <h1 className="auth-title">What is your role?</h1>
      <p className="auth-subtitle">Tell us how you'll be using Kempen so we can set up your account.</p>

      <div className="role-choice-grid">
        <button
          type="button"
          className={`role-choice ${form.role === 'manager' ? 'selected' : ''}`}
          onClick={() => update('role', 'manager')}
        >
          <div className="role-name">Manager</div>
          <div className="role-desc">Oversee KPIs, assign tasks and review staff submissions.</div>
        </button>
        <button
          type="button"
          className={`role-choice ${form.role === 'staff' ? 'selected' : ''}`}
          onClick={() => update('role', 'staff')}
        >
          <div className="role-name">Staff</div>
          <div className="role-desc">Submit your KPI evidence and track personal progress.</div>
        </button>
      </div>
    </>
  );
}

/* ---------- Step 2: Details ---------- */
function StepDetails({ form, update }) {
  const initials = ((form.firstName[0] || '') + (form.lastName[0] || '')).toUpperCase() || 'U';
  return (
    <>
      <h1 className="auth-title">Your details</h1>
      <p className="auth-subtitle">Fill in your information — this will appear on your profile.</p>

      <div className="avatar-uploader">
        <div className="avatar-circle">
          {form.photo ? <img src={form.photo} alt="avatar" /> : initials}
        </div>
        <label className="link-orange" style={{ cursor: 'pointer', fontSize: 12 }}>
          Add/Change photo
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) update('photo', URL.createObjectURL(file));
            }}
          />
        </label>
      </div>

      <div className="section-label">Personal Info</div>
      <div className="field-stack">
        <div className="field-row">
          <div>
            <label className="field-label">First name</label>
            <input
              className="input-auth no-icon"
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Last name</label>
            <input
              className="input-auth no-icon"
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="field-label">Preferred English name (optional)</label>
          <input
            className="input-auth no-icon"
            placeholder="e.g. Alex"
            value={form.englishName}
            onChange={(e) => update('englishName', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Pronouns</label>
          <select
            className="input-auth no-icon"
            value={form.pronouns}
            onChange={(e) => update('pronouns', e.target.value)}
          >
            <option value="">Select pronouns</option>
            <option value="she/her">She / Her</option>
            <option value="he/him">He / Him</option>
            <option value="they/them">They / Them</option>
            <option value="prefer-not">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="section-label">Work Info</div>
      <div className="field-stack">
        <div>
          <label className="field-label">Role at shop</label>
          <select
            className="input-auth no-icon"
            value={form.roleAtShop}
            onChange={(e) => update('roleAtShop', e.target.value)}
            required
          >
            <option value="">Select role</option>
            <option>Professional barista</option>
            <option>Trainee barista</option>
            <option>Shift supervisor</option>
            <option>Store manager</option>
          </select>
        </div>
        <div>
          <label className="field-label">Position / Job title</label>
          <input
            className="input-auth no-icon"
            placeholder="e.g. Senior barista"
            value={form.positionTitle}
            onChange={(e) => update('positionTitle', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Phone number</label>
          <div className="phone-row">
            <select
              className="input-auth no-icon"
              value={form.countryCode}
              onChange={(e) => update('countryCode', e.target.value)}
            >
              <option value="+60">🇲🇾 +60</option>
              <option value="+65">🇸🇬 +65</option>
              <option value="+62">🇮🇩 +62</option>
              <option value="+66">🇹🇭 +66</option>
            </select>
            <div className="input-group-auth" style={{ marginBottom: 0 }}>
              <Telephone className="input-icon" />
              <input
                className="input-auth"
                placeholder="12-345 6789"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="field-label">Employee ID (optional)</label>
          <input
            className="input-auth no-icon"
            placeholder="e.g. EMP-00123"
            value={form.employeeId}
            onChange={(e) => update('employeeId', e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

/* ---------- Step 3: Password ---------- */
function StepPassword({ form, update, showPwd, setShowPwd, showConfirm, setShowConfirm }) {
  return (
    <>
      <h1 className="auth-title">Create a password</h1>
      <p className="auth-subtitle">
        Choose a strong password — at least 8 characters, with letters and numbers.
      </p>

      <div>
        <label className="field-label">Email address</label>
        <div className="input-group-auth">
          <Envelope className="input-icon" />
          <input
            type="email"
            className="input-auth"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="field-label">Create a password</label>
        <div className="input-group-auth">
          <Lock className="input-icon" />
          <input
            type={showPwd ? 'text' : 'password'}
            className="input-auth with-trailing"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            minLength={8}
          />
          <button
            type="button"
            className="input-trailing"
            onClick={() => setShowPwd(!showPwd)}
          >
            {showPwd ? <EyeSlash /> : <Eye />}
          </button>
        </div>
      </div>

      <div>
        <label className="field-label">Confirm password</label>
        <div className="input-group-auth">
          <Lock className="input-icon" />
          <input
            type={showConfirm ? 'text' : 'password'}
            className="input-auth with-trailing"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            required
          />
          <button
            type="button"
            className="input-trailing"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeSlash /> : <Eye />}
          </button>
        </div>
        {form.confirmPassword && form.password !== form.confirmPassword && (
          <div style={{ color: '#DC3545', fontSize: 11, marginTop: 4 }}>
            Passwords do not match.
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Step 4: Review ---------- */
function StepReview({ form, update }) {
  const fullName =
    [form.firstName, form.lastName].filter(Boolean).join(' ') || 'Your Name';
  const initials = ((form.firstName[0] || '') + (form.lastName[0] || '')).toUpperCase() || 'U';

  return (
    <>
      <h1 className="auth-title">Review your details</h1>
      <p className="auth-subtitle">Confirm everything looks right before submitting.</p>

      <div className="review-header">
        <div className="avatar-circle">
          {form.photo ? <img src={form.photo} alt="avatar" /> : initials}
        </div>
        <div>
          <div className="name">{fullName}</div>
          <div className="sub">{form.englishName || form.email || 'Account preview'}</div>
        </div>
      </div>

      <div className="review-block">
        <div className="section-label" style={{ margin: '0 0 8px' }}>Role & Department</div>
        <div className="review-grid">
          <div className="review-item">
            <div className="k">Role</div>
            <div className="v">{form.role === 'manager' ? 'Manager' : 'Staff'}</div>
          </div>
          <div className="review-item">
            <div className="k">Role at shop</div>
            <div className="v">{form.roleAtShop || '—'}</div>
          </div>
          <div className="review-item">
            <div className="k">Position</div>
            <div className="v">{form.positionTitle || '—'}</div>
          </div>
        </div>
      </div>

      <div className="review-block">
        <div className="section-label" style={{ margin: '0 0 8px' }}>Personal & Work Info</div>
        <div className="review-grid">
          <div className="review-item">
            <div className="k">Full name</div>
            <div className="v">{fullName}</div>
          </div>
          <div className="review-item">
            <div className="k">English name</div>
            <div className="v">{form.englishName || '—'}</div>
          </div>
          <div className="review-item">
            <div className="k">Pronouns</div>
            <div className="v">{form.pronouns || '—'}</div>
          </div>
          <div className="review-item">
            <div className="k">Phone</div>
            <div className="v">{form.phone ? `${form.countryCode} ${form.phone}` : '—'}</div>
          </div>
          <div className="review-item">
            <div className="k">Employee ID</div>
            <div className="v">{form.employeeId || '—'}</div>
          </div>
          <div className="review-item">
            <div className="k">Email</div>
            <div className="v">{form.email || '—'}</div>
          </div>
        </div>
      </div>

      <div className="review-block">
        <div className="section-label" style={{ margin: '0 0 8px' }}>Password</div>
        <div className="review-item">
          <div className="v">{form.password ? '•'.repeat(Math.min(form.password.length, 12)) : '—'}</div>
        </div>
      </div>

      <label className="confirm-box">
        <input
          type="checkbox"
          checked={form.confirmed}
          onChange={(e) => update('confirmed', e.target.checked)}
        />
        <span>
          I confirm that the information above is accurate and authorise Kempen to create my account
          based on these details.
        </span>
      </label>
    </>
  );
}

export default Register;
