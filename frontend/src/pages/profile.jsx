import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Eye,
  EyeSlash,
  Person,
  ShieldLock,
  Trash,
} from 'react-bootstrap-icons';
import Sidebar from '../component/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/assetUrl';
import api from '../utils/axiosInstance';

const profileTabs = [
  { id: 'overview', label: 'Overview', icon: Person },
  { id: 'edit', label: 'Edit profile', icon: Camera },
  { id: 'security', label: 'Security', icon: ShieldLock },
  { id: 'account', label: 'Account', icon: Trash },
];

function Profile() {
  const navigate = useNavigate();
  const { user, checkSession, logout } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [previewUser, setPreviewUser] = useState(null);
  const [profileForm, setProfileForm] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [editError, setEditError] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [deactivationForm, setDeactivationForm] = useState({
    password: '',
    confirmation: '',
  });
  const [deactivationError, setDeactivationError] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const loadProfile = async () => {
      try {
        const response = await api.get('/api/profile');

        if (isCurrent) {
          setProfileUser(response.data.user);
          setProfileLoadError('');
        }
      } catch (error) {
        if (isCurrent) {
          setProfileLoadError(
            error.response?.data?.message || 'Unable to load profile.'
          );
        }
      } finally {
        if (isCurrent) {
          setIsProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCurrent = false;
    };
  }, []);

  const sourceUser = profileUser || user;

  useEffect(() => {
    if (!sourceUser) return;

    setProfileForm({
      firstName: sourceUser.firstName || '',
      lastName: sourceUser.lastName || '',
      englishName: sourceUser.englishName || '',
      pronouns: sourceUser.pronouns || '',
      roleAtShop: sourceUser.roleAtShop || '',
      positionTitle: sourceUser.positionTitle || '',
      countryCode: sourceUser.countryCode || '+60',
      phone: sourceUser.phone || '',
    });
  }, [sourceUser]);

  useEffect(() => {
    if (!selectedPhoto) {
      setPhotoPreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedPhoto);
    setPhotoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedPhoto]);
  const displayedUser = previewUser || sourceUser;
  const fullName = [displayedUser?.firstName, displayedUser?.lastName]
    .filter(Boolean)
    .join(' ');
  const displayName = displayedUser?.englishName || fullName || 'User';
  const initials =
    `${displayedUser?.firstName?.[0] || ''}${displayedUser?.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const profilePhotoUrl = getAssetUrl(displayedUser?.photoUrl);
  const visiblePhotoUrl = photoPreview || profilePhotoUrl;
  const joinedDate = displayedUser?.createdAt
    ? new Date(displayedUser.createdAt).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  const profileDetails = [
    { label: 'Full name', value: fullName || '-' },
    { label: 'English name', value: displayedUser?.englishName || '-' },
    { label: 'Pronouns', value: displayedUser?.pronouns || '-' },
    { label: 'Email', value: displayedUser?.email || '-' },
    { label: 'Employee ID', value: displayedUser?.employeeId || '-' },
    {
      label: 'Account role',
      value: displayedUser?.role === 'manager' ? 'Manager' : 'Staff',
    },
    { label: 'Role at shop', value: displayedUser?.roleAtShop || '-' },
    { label: 'Position title', value: displayedUser?.positionTitle || '-' },
    {
      label: 'Phone',
      value: `${displayedUser?.countryCode || ''} ${displayedUser?.phone || ''}`.trim() || '-',
    },
    { label: 'Member since', value: joinedDate },
  ];

  const handleProfileChange = (event) => {
    setProfileForm({
      ...profileForm,
      [event.target.name]: event.target.value,
    });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    setEditError('');
    setEditMessage('');

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setEditError('Profile photo must be a JPEG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setEditError('Profile photo must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }

    setSelectedPhoto(file);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setEditError('');
    setEditMessage('');

    if (
      !profileForm.firstName?.trim() ||
      !profileForm.lastName?.trim() ||
      !profileForm.roleAtShop?.trim()
    ) {
      setEditError('First name, last name, and role at shop are required.');
      return;
    }

    const formData = new FormData();

    Object.entries(profileForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (selectedPhoto) {
      formData.append('photo', selectedPhoto);
    }

    setIsEditSubmitting(true);

    try {
      const response = await api.patch('/api/profile', formData);
      setProfileUser(response.data.user);
      setPreviewUser(null);
      setSelectedPhoto(null);
      setEditMessage(response.data.message);
      await checkSession();
    } catch (error) {
      setEditError(
        error.response?.data?.message || 'Unable to update profile.'
      );
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const resetEditForm = () => {
    setProfileForm({
      firstName: sourceUser?.firstName || '',
      lastName: sourceUser?.lastName || '',
      englishName: sourceUser?.englishName || '',
      pronouns: sourceUser?.pronouns || '',
      roleAtShop: sourceUser?.roleAtShop || '',
      positionTitle: sourceUser?.positionTitle || '',
      countryCode: sourceUser?.countryCode || '+60',
      phone: sourceUser?.phone || '',
    });
    setSelectedPhoto(null);
    setEditError('');
    setEditMessage('');
    setActiveTab('overview');
  };

  const handlePasswordChange = (event) => {
    setPasswordForm({
      ...passwordForm,
      [event.target.name]: event.target.value,
    });
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility({
      ...passwordVisibility,
      [field]: !passwordVisibility[field],
    });
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError(
        'New password must be different from the current password.'
      );
      return;
    }

    setIsPasswordSubmitting(true);

    try {
      const response = await api.patch('/api/profile/password', passwordForm);
      await logout();
      navigate('/login', {
        replace: true,
        state: { message: response.data.message },
      });
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || 'Unable to change password.'
      );
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleDeactivationChange = (event) => {
    setDeactivationForm({
      ...deactivationForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleDeactivationSubmit = (event) => {
    event.preventDefault();
    setDeactivationError('');

    if (!deactivationForm.password) {
      setDeactivationError('Current password is required.');
      return;
    }

    if (deactivationForm.confirmation !== 'DEACTIVATE') {
      setDeactivationError('Type DEACTIVATE exactly to continue.');
      return;
    }

    setShowDeactivateModal(true);
  };

  const confirmDeactivation = async () => {
    setDeactivationError('');
    setIsDeactivating(true);

    try {
      const response = await api.patch('/api/profile/deactivate', {
        password: deactivationForm.password,
        confirmation: deactivationForm.confirmation,
      });
      setShowDeactivateModal(false);
      await logout();
      navigate('/login', {
        replace: true,
        state: { message: response.data.message },
      });
    } catch (error) {
      setShowDeactivateModal(false);
      setDeactivationError(
        error.response?.data?.message || 'Unable to deactivate account.'
      );
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar role={user?.role || 'staff'} />

      <main className="profile-page-main">
        <header className="profile-page-header">
          <p className="text-secondary fw-bold text-uppercase text-micro mb-1">
            Account
          </p>
          <h1>Profile management</h1>
          <p>Manage your personal details, security, and account access.</p>
        </header>

        {isProfileLoading && (
          <div className="profile-load-state" role="status">
            Loading profile...
          </div>
        )}

        {profileLoadError && (
          <div className="profile-form-notice error" role="alert">
            {profileLoadError}
          </div>
        )}

        <div className="profile-tabs" role="tablist" aria-label="Profile sections">
          {profileTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={activeTab === id ? 'active' : ''}
              onClick={() => setActiveTab(id)}
              role="tab"
              aria-selected={activeTab === id}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <section className="profile-page-panel">
            <div className="profile-overview-identity">
              <div className="profile-overview-avatar">
                {visiblePhotoUrl ? (
                  <img src={visiblePhotoUrl} alt={`${displayName} profile`} />
                ) : (
                  initials
                )}
              </div>

              <div className="profile-overview-summary">
                <h2>{displayName}</h2>
                <p>
                  {displayedUser?.positionTitle ||
                    displayedUser?.roleAtShop ||
                    (displayedUser?.role === 'manager' ? 'Manager' : 'Staff')}
                </p>
                <span>
                  {displayedUser?.role === 'manager' ? 'Manager' : 'Staff'} account
                </span>
              </div>

              <button
                type="button"
                className="profile-overview-edit"
                onClick={() => setActiveTab('edit')}
              >
                Edit profile
              </button>
            </div>

            <div className="profile-detail-grid">
              {profileDetails.map((detail) => (
                <div key={detail.label} className="profile-detail-item">
                  <span>{detail.label}</span>
                  <strong>{detail.value}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : activeTab === 'edit' ? (
          <form className="profile-page-panel" onSubmit={handleEditSubmit}>
            <div className="profile-edit-photo">
              <div className="profile-overview-avatar">
                {visiblePhotoUrl ? (
                  <img src={visiblePhotoUrl} alt={`${displayName} profile preview`} />
                ) : (
                  initials
                )}
              </div>

              <div>
                <h2>Profile photo</h2>
                <p>JPEG, PNG, or WebP. Maximum file size 2 MB.</p>
                <div className="profile-edit-photo-actions">
                  <label className="profile-secondary-button">
                    <Camera size={15} />
                    Choose photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      hidden
                    />
                  </label>
                  {selectedPhoto && (
                    <button
                      type="button"
                      className="profile-text-button"
                      onClick={() => setSelectedPhoto(null)}
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
            </div>

            {editError && (
              <div className="profile-form-notice error" role="alert">
                {editError}
              </div>
            )}

            {editMessage && (
              <div className="profile-form-notice success" role="status">
                {editMessage}
              </div>
            )}

            <div className="profile-form-grid">
              <label>
                First name
                <input
                  name="firstName"
                  value={profileForm.firstName || ''}
                  onChange={handleProfileChange}
                  required
                />
              </label>
              <label>
                Last name
                <input
                  name="lastName"
                  value={profileForm.lastName || ''}
                  onChange={handleProfileChange}
                  required
                />
              </label>
              <label>
                English name
                <input
                  name="englishName"
                  value={profileForm.englishName || ''}
                  onChange={handleProfileChange}
                />
              </label>
              <label>
                Pronouns
                <select
                  name="pronouns"
                  value={profileForm.pronouns || ''}
                  onChange={handleProfileChange}
                >
                  <option value="">Not specified</option>
                  <option value="she/her">she/her</option>
                  <option value="he/him">he/him</option>
                  <option value="they/them">they/them</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </label>
              <label>
                Role at shop
                <input
                  name="roleAtShop"
                  value={profileForm.roleAtShop || ''}
                  onChange={handleProfileChange}
                  required
                />
              </label>
              <label>
                Position title
                <input
                  name="positionTitle"
                  value={profileForm.positionTitle || ''}
                  onChange={handleProfileChange}
                />
              </label>
              <label>
                Country code
                <input
                  name="countryCode"
                  value={profileForm.countryCode || ''}
                  onChange={handleProfileChange}
                />
              </label>
              <label>
                Phone number
                <input
                  name="phone"
                  value={profileForm.phone || ''}
                  onChange={handleProfileChange}
                />
              </label>
              <label className="profile-readonly-field">
                Email
                <input value={sourceUser?.email || ''} readOnly />
                <small>Email cannot be changed here.</small>
              </label>
              <label className="profile-readonly-field">
                Employee ID
                <input value={sourceUser?.employeeId || ''} readOnly />
                <small>This value is managed by the organisation.</small>
              </label>
              <label className="profile-readonly-field">
                Account role
                <input
                  value={sourceUser?.role === 'manager' ? 'Manager' : 'Staff'}
                  readOnly
                />
                <small>Account roles cannot be changed from this page.</small>
              </label>
            </div>

            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-secondary-button"
                onClick={resetEditForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-primary-button"
                disabled={isEditSubmitting}
              >
                {isEditSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        ) : activeTab === 'security' ? (
          <form
            className="profile-page-panel profile-security-panel"
            onSubmit={handlePasswordSubmit}
          >
            <div className="profile-section-heading">
              <ShieldLock size={22} />
              <div>
                <h2>Change password</h2>
                <p>
                  Use your current password to choose a new security credential.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="profile-form-notice error" role="alert">
                {passwordError}
              </div>
            )}

            {[
              {
                name: 'currentPassword',
                label: 'Current password',
                autoComplete: 'current-password',
              },
              {
                name: 'newPassword',
                label: 'New password',
                autoComplete: 'new-password',
              },
              {
                name: 'confirmPassword',
                label: 'Confirm new password',
                autoComplete: 'new-password',
              },
            ].map((field) => (
              <label className="profile-password-field" key={field.name}>
                {field.label}
                <div>
                  <input
                    type={
                      passwordVisibility[field.name] ? 'text' : 'password'
                    }
                    name={field.name}
                    value={passwordForm[field.name]}
                    onChange={handlePasswordChange}
                    autoComplete={field.autoComplete}
                    minLength={
                      field.name === 'currentPassword' ? undefined : 8
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.name)}
                    aria-label={
                      passwordVisibility[field.name]
                        ? `Hide ${field.label.toLowerCase()}`
                        : `Show ${field.label.toLowerCase()}`
                    }
                  >
                    {passwordVisibility[field.name] ? <EyeSlash /> : <Eye />}
                  </button>
                </div>
              </label>
            ))}

            <div className="profile-security-guidance">
              <strong>Password requirements</strong>
              <span>Use at least 8 characters and avoid your current password.</span>
            </div>

            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-secondary-button"
                onClick={() => {
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setPasswordError('');
                }}
              >
                Clear
              </button>
              <button
                type="submit"
                className="profile-primary-button"
                disabled={isPasswordSubmitting}
              >
                {isPasswordSubmitting ? 'Changing password...' : 'Change password'}
              </button>
            </div>
          </form>
        ) : activeTab === 'account' ? (
          <section className="profile-page-panel profile-account-panel">
            <div className="profile-section-heading profile-danger-heading">
              <Trash size={22} />
              <div>
                <h2>Deactivate account</h2>
                <p>
                  Disable access while preserving KPI records, evidence, and
                  historical activity.
                </p>
              </div>
            </div>

            <div className="profile-danger-summary">
              <strong>Before you continue</strong>
              <ul>
                <li>You will no longer be able to sign in.</li>
                <li>Your KPI history should remain available to the organisation.</li>
                <li>A manager or administrator will be needed to restore access.</li>
              </ul>
            </div>

            {deactivationError && (
              <div className="profile-form-notice error" role="alert">
                {deactivationError}
              </div>
            )}

            <form
              className="profile-deactivation-form"
              onSubmit={handleDeactivationSubmit}
            >
              <label>
                Current password
                <input
                  type="password"
                  name="password"
                  value={deactivationForm.password}
                  onChange={handleDeactivationChange}
                  autoComplete="current-password"
                  required
                />
              </label>

              <label>
                Type DEACTIVATE to confirm
                <input
                  name="confirmation"
                  value={deactivationForm.confirmation}
                  onChange={handleDeactivationChange}
                  placeholder="DEACTIVATE"
                  autoComplete="off"
                  required
                />
              </label>

              <button
                type="submit"
                className="profile-danger-button"
                disabled={deactivationForm.confirmation !== 'DEACTIVATE'}
              >
                Continue to deactivate
              </button>
            </form>
          </section>
        ) : (
          <section className="profile-page-panel">
            <p className="profile-panel-kicker">Profile section</p>
            <h2>
              {profileTabs.find((tab) => tab.id === activeTab)?.label}
            </h2>
            <p>
              This section will be implemented in the next frontend step.
            </p>
          </section>
        )}

        <Modal
          show={showDeactivateModal}
          onHide={() => setShowDeactivateModal(false)}
          centered
          contentClassName="profile-confirm-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm account deactivation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              This is the final confirmation step. When the backend is connected,
              your account access will be disabled immediately.
            </p>
            <p className="mb-0 fw-bold">
              Are you sure you want to continue?
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              className="profile-secondary-button"
              onClick={() => setShowDeactivateModal(false)}
              disabled={isDeactivating}
            >
              Cancel
            </button>
            <button
              type="button"
              className="profile-danger-button"
              onClick={confirmDeactivation}
              disabled={isDeactivating}
            >
              {isDeactivating ? 'Deactivating...' : 'Confirm deactivation'}
            </button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
}

export default Profile;
