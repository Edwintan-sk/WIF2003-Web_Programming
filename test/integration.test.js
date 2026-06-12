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

const cookieFrom = (response) => {
  const setCookie = response.headers.get('set-cookie');
  assert.ok(setCookie, 'Expected login response to set an auth cookie');
  return setCookie.split(';')[0];
};

const registerUser = async (role, email) => {
  const result = await requestJson('/api/auth/register', {
    method: 'POST',
    body: {
      role,
      firstName: role === 'manager' ? 'Ivy' : 'Noah',
      lastName: 'Integration',
      roleAtShop: role === 'manager' ? 'Store Manager' : 'Staff',
      positionTitle: role === 'manager' ? 'Manager' : 'Sales Staff',
      email,
      password: 'Password123',
    },
  });

  assert.equal(result.response.status, 201);
  return result.body.user;
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

// IT-01 to IT-08 - Complete KPI Workflow Integration
test('IT: Complete KPI workflow connects auth, KPI routes, submissions, decisions, and notifications', async (t) => {
  const managerEmail = `integration.manager.${runId}@example.com`;
  const staffEmail = `integration.staff.${runId}@example.com`;
  let managerCookie;
  let staffCookie;
  let kpiId;
  let updateKpi;
  let submission;

  await t.test('IT-01: Registration API Integration', async () => {
    await registerUser('manager', managerEmail);
    await registerUser('staff', staffEmail);
    const duplicate = await requestJson('/api/auth/register', {
      method: 'POST',
      body: {
        role: 'manager',
        firstName: 'Duplicate',
        lastName: 'User',
        roleAtShop: 'Store Manager',
        email: managerEmail,
        password: 'Password123',
      },
    });
    assert.equal(duplicate.response.status, 409);
  });

  await t.test('IT-02: Login, Cookie and Route Integration', async () => {
    managerCookie = await loginUser('manager', managerEmail);
    staffCookie = await loginUser('staff', staffEmail);
    const me = await requestJson('/api/auth/me', {
      headers: { cookie: managerCookie },
    });
    assert.equal(me.response.status, 200);
    assert.equal(me.body.user.email, managerEmail);
  });

  await t.test('IT-03: Role-Based Routing Integration', async () => {
    const managerDashboard = await requestJson('/api/kpi/manager/dashboard', {
      headers: { cookie: managerCookie },
    });
    assert.equal(managerDashboard.response.status, 200);

    const staffBlockedFromManagerRoute = await requestJson('/api/kpi/manager/dashboard', {
      headers: { cookie: staffCookie },
    });
    assert.equal(staffBlockedFromManagerRoute.response.status, 403);
  });

  await t.test('IT-04: KPI CRUD Integration', async () => {
    const createKpi = await requestJson('/api/kpi', {
      method: 'POST',
      headers: { cookie: managerCookie },
      body: {
        title: `Integration KPI ${runId}`,
        category: 'Sales',
        targetValue: 80,
        unit: '%',
        direction: 'Atleast (>=)',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Created by automated integration test',
        department: 'Sales',
        evidenceRequirements: {
          pdf: true,
          images: false,
          spreadsheet: false,
        },
        staffInstructions: 'Submit a valid progress update.',
        assignees: [],
        milestones: [
          { label: 'Halfway', percentage: '50' },
          { label: 'Complete', percentage: '100' },
        ],
      },
    });
    assert.equal(createKpi.response.status, 201);
    kpiId = createKpi.body._id;
    assert.ok(kpiId);

    const listKpis = await requestJson('/api/kpi', {
      headers: { cookie: managerCookie },
    });
    assert.equal(listKpis.response.status, 200);
    assert.ok(listKpis.body.data.some((kpi) => kpi._id === kpiId));

    updateKpi = await requestJson(`/api/kpi/${kpiId}`, {
      method: 'PUT',
      headers: { cookie: managerCookie },
      body: {
        title: `Integration KPI Updated ${runId}`,
        category: 'Sales',
        targetValue: 85,
        unit: '%',
        direction: 'Atleast (>=)',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Updated by automated integration test',
        department: 'Sales',
        evidenceRequirements: {
          pdf: true,
          images: false,
          spreadsheet: false,
        },
        staffInstructions: 'Submit a valid progress update.',
        assignees: [],
        milestones: [
          { label: 'Halfway', percentage: '50' },
          { label: 'Complete', percentage: '100' },
        ],
      },
    });
    assert.equal(updateKpi.response.status, 200);
    assert.equal(updateKpi.body.title, `Integration KPI Updated ${runId}`);
  });

  await t.test('IT-05: KPI Assignment Integration', async () => {
    const assign = await requestJson(`/api/kpi/${kpiId}/assignees`, {
      method: 'PATCH',
      headers: { cookie: managerCookie },
      body: {
        assignees: [staffEmail],
      },
    });
    assert.equal(assign.response.status, 200);
    assert.deepEqual(assign.body.assignees, [staffEmail]);
    assert.equal(assign.body.assignee, staffEmail);

    const assigned = await requestJson('/api/kpi/assigned', {
      headers: { cookie: staffCookie },
    });
    assert.equal(assigned.response.status, 200);
    assert.ok(assigned.body.data.some((kpi) => kpi.id === kpiId));
  });

  await t.test('IT-06: Progress and Evidence Submission Integration', async () => {
    const progress = await requestJson('/api/kpi/progress', {
      method: 'POST',
      headers: { cookie: staffCookie },
      body: {
        kpiId,
        newMetricValue: 50,
        notes: '<b>Reached halfway</b>',
        evidenceUrl: 'https://example.com/evidence.pdf',
      },
    });
    assert.equal(progress.response.status, 200);
    assert.equal(progress.body.kpi.status, 'Under Review');
    assert.equal(progress.body.kpi.achievementScore, 50);
    assert.equal(progress.body.kpi.submissions.at(-1).notes, 'Reached halfway');
  });

  await t.test('IT-07: Verification Decision Integration', async () => {
    const submissions = await requestJson('/api/kpi/manager/submissions', {
      headers: { cookie: managerCookie },
    });
    assert.equal(submissions.response.status, 200);
    submission = submissions.body.find((item) => item.kpiId === kpiId);
    assert.ok(submission);
    assert.equal(submission.status, 'Pending');

    const decision = await requestJson(`/api/kpi/manager/submissions/${submission.id}/decision`, {
      method: 'PATCH',
      headers: { cookie: managerCookie },
      body: {
        status: 'Approved',
        comment: 'Evidence accepted',
      },
    });
    assert.equal(decision.response.status, 200);
    assert.equal(decision.body.kpi.achievementScore, 50);
    assert.equal(decision.body.kpi.submissions.at(-1).status, 'Approved');
    assert.equal(decision.body.kpi.status, 'In Progress');
  });

  await t.test('IT-08: Complete KPI Workflow Integration', async () => {
    const notify = await requestJson(`/api/kpi/${kpiId}/notify-assignees`, {
      method: 'POST',
      headers: { cookie: managerCookie },
    });
    assert.equal(notify.response.status, 200);
    assert.match(notify.body.message, /Notified 1 assignee/);

    const notifications = await requestJson('/api/notifications', {
      headers: { cookie: staffCookie },
    });
    assert.equal(notifications.response.status, 200);
    assert.ok(
      notifications.body.data.some((item) => item.title.includes(updateKpi.body.title)),
      'Expected staff notification for assigned KPI'
    );
  });
});
