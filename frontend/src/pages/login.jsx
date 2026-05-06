import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Envelope, Lock, Eye, EyeSlash, CheckCircleFill } from 'react-bootstrap-icons';

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('manager');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'manager') navigate('/manager');
    else navigate('/staff');
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-row">
          <div className="brand-mark">K</div>
          <div className="brand-name">KP EYE</div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your shop / HQ portal.</p>

        <div className="role-toggle">
          <button
            type="button"
            className={role === 'manager' ? 'active' : ''}
            onClick={() => setRole('manager')}
          >
            Manager
          </button>
          <button
            type="button"
            className={role === 'staff' ? 'active' : ''}
            onClick={() => setRole('staff')}
          >
            Staff
          </button>
        </div>

        <div className="info-banner">
          <CheckCircleFill size={12} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>
            Signing in as <strong>{role === 'manager' ? 'manager' : 'staff'}</strong> — full
            dashboard functionality coming soon.
          </span>
        </div>

        <div className="input-group-auth">
          <Envelope className="input-icon" />
          <input
            type="email"
            className="input-auth"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="input-group-auth">
          <Lock className="input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-auth with-trailing"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="button"
            className="input-trailing"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeSlash /> : <Eye />}
          </button>
        </div>

        <div className="auth-row-between">
          <label>
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="link-orange">
            Forgot Password
          </Link>
        </div>

        <button type="submit" className="btn-auth-submit">
          Sign in
        </button>

        <div className="auth-bottom">
          Never click before?{' '}
          <Link to="/register" className="link-orange">
            Request an account
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
