import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircleFill,
  Eye,
  EyeSlash,
  Lock,
} from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

function ResetPassword() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const responseMessage = await resetPassword(
        token,
        form.password,
        form.confirmPassword
      );
      setMessage(responseMessage);
      setForm({ password: '', confirmPassword: '' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-row">
          <div className="brand-mark">K</div>
          <div className="brand-name">KP EYE</div>
        </div>

        <h1 className="auth-title">Create a new password</h1>
        <p className="auth-subtitle">
          Choose a password with at least 8 characters for your account.
        </p>

        {message ? (
          <>
            <div className="info-banner" role="status">
              <CheckCircleFill size={14} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{message}</span>
            </div>

            <Link to="/login" className="btn-auth-submit auth-submit-link">
              Continue to sign in
            </Link>
          </>
        ) : (
          <>
            <div className="input-group-auth">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-auth with-trailing"
                placeholder="New password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="input-trailing"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide new password' : 'Show new password'}
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>

            <div className="input-group-auth">
              <Lock className="input-icon" />
              <input
                type={showConfirmation ? 'text' : 'password'}
                className="input-auth with-trailing"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm({ ...form, confirmPassword: event.target.value })
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="input-trailing"
                onClick={() => setShowConfirmation(!showConfirmation)}
                aria-label={
                  showConfirmation
                    ? 'Hide password confirmation'
                    : 'Show password confirmation'
                }
              >
                {showConfirmation ? <EyeSlash /> : <Eye />}
              </button>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting password...' : 'Reset password'}
            </button>

            <div className="auth-bottom">
              <Link to="/login" className="link-orange">
                <ArrowLeft size={12} className="me-1" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default ResetPassword;
