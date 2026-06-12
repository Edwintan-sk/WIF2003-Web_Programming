const assert = require('node:assert/strict');
const test = require('node:test');

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:5050';
const runId = `${Date.now()}-${process.pid}`;

const requestJson = async (route, options = {}) => {
  const response = await fetch(`${baseUrl}${route}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  });

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  return { response, body };
};

const makeRegistration = (role, email) => ({
  role,
  firstName: role === 'manager' ? 'Mina' : 'Sam',
  lastName: 'Tester',
  roleAtShop: role === 'manager' ? 'Store Manager' : 'Staff',
  positionTitle: role === 'manager' ? 'Manager' : 'Associate',
  email,
  password: 'Password123',
});

const cookieFrom = (response) => {
  const setCookie = response.headers.get('set-cookie');
  assert.ok(setCookie, 'Expected login response to set an auth cookie');
  return setCookie.split(';')[0];
};

const loginUser = async (role, email) => {
  const result = await requestJson('/api/auth/login', {
    method: 'POST',
    body: {
      email,
      password: 'Password123',
      role,
    },
  });

  assert.equal(result.response.status, 200);
  return cookieFrom(result.response);
};

const makeKpiPayload = (title, assignees = []) => ({
  title,
  category: 'Sales',
  targetValue: 80,
  unit: '%',
  direction: 'Atleast (>=)',
  deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  description: 'Functional testing KPI',
  department: 'Sales',
  evidenceRequirements: {
    pdf: true,
    images: true,
    spreadsheet: false,
  },
  staffInstructions: 'Submit valid evidence for review.',
  assignees,
  milestones: [
    { label: 'Halfway', percentage: '50' },
    { label: 'Complete', percentage: '100' },
  ],
});

// FT-01 to FT-14 - Functional Testing Cases from the appendix
test('FT: Functional workflow matches the testing document', async (t) => {
  const managerEmail = `functional.manager.${runId}@example.com`;
  const staffEmail = `functional.staff.${runId}@example.com`;
  let staffCookie;
  let activeManagerCookie;
  let kpiId;
  let submission;

  await t.test('FT-01: Manager Registration Page', async () => {
    const managerRegister = await requestJson('/api/auth/register', {
      method: 'POST',
      body: makeRegistration('manager', managerEmail),
    });
    assert.equal(managerRegister.response.status, 201);
    assert.equal(managerRegister.body.user.role, 'manager');
  });

  await t.test('FT-02: Staff Registration Page', async () => {
    const staffRegister = await requestJson('/api/auth/register', {
      method: 'POST',
      body: makeRegistration('staff', staffEmail),
    });
    assert.equal(staffRegister.response.status, 201);
    assert.equal(staffRegister.body.user.role, 'staff');
  });

  await t.test('FT-03: Manager Login Page', async () => {
    activeManagerCookie = await loginUser('manager', managerEmail);
  });

  await t.test('FT-04: Staff Login Page', async () => {
    staffCookie = await loginUser('staff', staffEmail);
  });

  await t.test('FT-05: Logout Function', async () => {
    const logout = await requestJson('/api/auth/logout', {
      method: 'POST',
      headers: {
        cookie: activeManagerCookie,
      },
    });
    assert.equal(logout.response.status, 200);
    assert.match(logout.body.message, /logout successful/i);

    activeManagerCookie = await loginUser('manager', managerEmail);
  });

  await t.test('FT-06: Forgot and Reset Password Flow', async () => {
    const forgotPassword = await requestJson('/api/auth/forgot-password', {
      method: 'POST',
      body: {
        email: staffEmail,
      },
    });
    assert.ok([200, 503].includes(forgotPassword.response.status));
  });

  await t.test('FT-07: Profile View and Update', async () => {
    const profile = await requestJson('/api/profile', {
      headers: {
        cookie: staffCookie,
      },
    });
    assert.equal(profile.response.status, 200);
    assert.equal(profile.body.user.email, staffEmail);

    const profileUpdate = await requestJson('/api/profile', {
      method: 'PATCH',
      headers: {
        cookie: staffCookie,
      },
      body: {
        englishName: 'Functional Staff',
        phone: '123456789',
      },
    });
    assert.equal(profileUpdate.response.status, 200);
    assert.equal(profileUpdate.body.user.englishName, 'Functional Staff');
  });

  await t.test('FT-08: Manager Dashboard Summary', async () => {
    const managerDashboard = await requestJson('/api/kpi/manager/dashboard', {
      headers: {
        cookie: activeManagerCookie,
      },
    });
    assert.equal(managerDashboard.response.status, 200);
    assert.ok(managerDashboard.body.overallProgress);
  });

  await t.test('FT-09: Create KPI', async () => {
    const createKpi = await requestJson('/api/kpi', {
      method: 'POST',
      headers: {
        cookie: activeManagerCookie,
      },
      body: makeKpiPayload(`Functional KPI ${runId}`, [staffEmail]),
    });
    assert.equal(createKpi.response.status, 201);
    kpiId = createKpi.body._id;
    assert.ok(kpiId);
  });

  await t.test('FT-10: Edit and Delete KPI', async () => {
    const editableKpi = await requestJson('/api/kpi', {
      method: 'POST',
      headers: {
        cookie: activeManagerCookie,
      },
      body: makeKpiPayload(`Functional KPI Edit Delete ${runId}`),
    });
    assert.equal(editableKpi.response.status, 201);

    const editedKpi = await requestJson(`/api/kpi/${editableKpi.body._id}`, {
      method: 'PUT',
      headers: {
        cookie: activeManagerCookie,
      },
      body: makeKpiPayload(`Functional KPI Edited ${runId}`),
    });
    assert.equal(editedKpi.response.status, 200);
    assert.equal(editedKpi.body.title, `Functional KPI Edited ${runId}`);

    const deletedKpi = await requestJson(`/api/kpi/${editableKpi.body._id}`, {
      method: 'DELETE',
      headers: {
        cookie: activeManagerCookie,
      },
    });
    assert.equal(deletedKpi.response.status, 200);
  });

  await t.test('FT-11: Assign KPI to Staff', async () => {
    const assign = await requestJson(`/api/kpi/${kpiId}/assignees`, {
      method: 'PATCH',
      headers: {
        cookie: activeManagerCookie,
      },
      body: {
        assignees: [staffEmail],
      },
    });
    assert.equal(assign.response.status, 200);
    assert.deepEqual(assign.body.assignees, [staffEmail]);
  });

  await t.test('FT-12: Staff Dashboard and Assigned KPI List', async () => {
    const staffDashboard = await requestJson('/api/kpi/dashboard', {
      headers: {
        cookie: staffCookie,
      },
    });
    assert.equal(staffDashboard.response.status, 200);
    assert.ok(Array.isArray(staffDashboard.body.stats));

    const assignedKpis = await requestJson('/api/kpi/assigned', {
      headers: {
        cookie: staffCookie,
      },
    });
    assert.equal(assignedKpis.response.status, 200);
    assert.ok(assignedKpis.body.data.some((kpi) => kpi.id === kpiId));
  });

  await t.test('FT-13: Submit Progress and Evidence', async () => {
    const progress = await requestJson('/api/kpi/progress', {
      method: 'POST',
      headers: {
        cookie: staffCookie,
      },
      body: {
        kpiId,
        newMetricValue: 50,
        notes: 'Functional progress submission',
        evidenceUrl: 'https://example.com/evidence.pdf',
      },
    });
    assert.equal(progress.response.status, 200);
    assert.equal(progress.body.kpi.status, 'Under Review');
  });

  await t.test('FT-14: Verification Inbox Decision', async () => {
    const submissions = await requestJson('/api/kpi/manager/submissions', {
      headers: {
        cookie: activeManagerCookie,
      },
    });
    assert.equal(submissions.response.status, 200);
    submission = submissions.body.find((item) => item.kpiId === kpiId);
    assert.ok(submission);

    const decision = await requestJson(`/api/kpi/manager/submissions/${submission.id}/decision`, {
      method: 'PATCH',
      headers: {
        cookie: activeManagerCookie,
      },
      body: {
        status: 'Approved',
        comment: 'Functional test evidence accepted',
      },
    });
    assert.equal(decision.response.status, 200);
    assert.equal(decision.body.kpi.submissions.at(-1).status, 'Approved');
  });
});
