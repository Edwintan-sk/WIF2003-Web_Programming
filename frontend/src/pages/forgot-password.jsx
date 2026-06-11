import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircleFill, Envelope } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const responseMessage = await requestPasswordReset(email);
      setMessage(responseMessage);
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

        <h1 className="auth-title">Forgot your password?</h1>
        <p className="auth-subtitle">
          Enter your account email and we will send you a secure reset link.
        </p>

        {message ? (
          <>
            <div className="info-banner" role="status">
              <CheckCircleFill size={14} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{message}</span>
            </div>

            <div className="auth-bottom">
              Check your inbox, then return to{' '}
              <Link to="/login" className="link-orange">
                Sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="input-group-auth">
              <Envelope className="input-icon" />
              <input
                type="email"
                className="input-auth"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
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
              {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
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

export default ForgotPassword;
