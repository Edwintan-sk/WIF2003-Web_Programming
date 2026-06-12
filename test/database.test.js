const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const mongoose = require('../backend/node_modules/mongoose');

const User = require('../backend/models/User');
const Kpi = require('../backend/models/Kpi');
const Notification = require('../backend/models/Notification');

const loadBackendEnv = () => {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsAt = trimmed.indexOf('=');
    if (equalsAt === -1) continue;

    const key = trimmed.slice(0, equalsAt).trim();
    const value = trimmed.slice(equalsAt + 1).trim();
    process.env[key] ||= value;
  }
};

loadBackendEnv();

const dbSkip = process.env.MONGO_URI
  ? undefined
  : 'Set MONGO_URI in backend/.env before running database tests.';

const runId = `${Date.now()}-${process.pid}`;
const managerEmail = `db.manager.${runId}@example.com`;
const staffEmail = `db.staff.${runId}@example.com`;
let dbConnectError = null;

const runDatabaseTest = (name, fn) => {
  test(name, async (t) => {
    if (dbSkip) {
      t.skip(dbSkip);
      return;
    }

    if (dbConnectError) {
      t.skip(`MongoDB unavailable: ${dbConnectError.message}`);
      return;
    }

    await fn();
  });
};

test.before(async () => {
  if (dbSkip) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch (error) {
    dbConnectError = error;
  }
});

test.after(async () => {
  if (dbSkip || dbConnectError || mongoose.connection.readyState !== 1) return;

  await Promise.all([
    User.deleteMany({ email: { $in: [managerEmail, staffEmail] } }),
    Kpi.deleteMany({ title: new RegExp(`^Database Test KPI ${runId}`) }),
    Notification.deleteMany({ recipientEmail: { $in: [managerEmail, staffEmail] } }),
  ]);
  await mongoose.disconnect();
});

// DB-01 - User Creation and Password Hashing
runDatabaseTest('DB-01: Database stores users with hashed passwords and correct roles', async () => {
  const user = await User.create({
    role: 'staff',
    firstName: 'Dana',
    lastName: 'Database',
    roleAtShop: 'Staff',
    email: staffEmail,
    password: 'Password123',
  });

  const stored = await User.findById(user._id).select('+password');

  assert.ok(stored);
  assert.equal(stored.role, 'staff');
  assert.equal(stored.email, staffEmail);
  assert.notEqual(stored.password, 'Password123');
  assert.equal(await stored.comparePassword('Password123'), true);
});

// DB-02 - KPI Document CRUD Consistency
runDatabaseTest('DB-02: Database creates, updates, and deletes KPI documents consistently', async () => {
  const kpi = await Kpi.create({
    title: `Database Test KPI ${runId} CRUD`,
    category: 'Sales',
    targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    targetValue: 100,
    targetText: '>= 100 units',
  });

  const created = await Kpi.findById(kpi._id);
  assert.ok(created);
  assert.equal(created.title, `Database Test KPI ${runId} CRUD`);

  const updated = await Kpi.findByIdAndUpdate(
    kpi._id,
    { title: `Database Test KPI ${runId} Updated`, achievementScore: 25 },
    { returnDocument: 'after', runValidators: true }
  );
  assert.equal(updated.title, `Database Test KPI ${runId} Updated`);
  assert.equal(updated.achievementScore, 25);

  await Kpi.findByIdAndDelete(kpi._id);
  assert.equal(await Kpi.findById(kpi._id), null);
});

// DB-03 - KPI Assignee Data Consistency
runDatabaseTest('DB-03: Database stores KPI assignee email consistently in legacy and multi-assignee fields', async () => {
  const kpi = await Kpi.create({
    title: `Database Test KPI ${runId} Assignee`,
    category: 'Operations',
    targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    targetValue: 90,
    assignee: staffEmail,
    assignees: [staffEmail],
  });

  const stored = await Kpi.findById(kpi._id);

  assert.equal(stored.assignee, staffEmail);
  assert.deepEqual(stored.assignees, [staffEmail]);
});

// DB-04 - Progress and Evidence Storage
runDatabaseTest('DB-04: Database stores progress and evidence fields for a pending submission', async () => {
  const kpi = await Kpi.create({
    title: `Database Test KPI ${runId} Progress Evidence`,
    category: 'Performance',
    targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    targetValue: 100,
    assignee: staffEmail,
    assignees: [staffEmail],
    achievementScore: 50,
    status: 'Under Review',
    submissions: [{
      assignee: staffEmail,
      progressValue: 50,
      notes: 'Halfway complete',
      evidenceUrl: 'https://example.com/evidence.pdf',
      status: 'Pending',
    }],
  });

  const pending = await Kpi.findById(kpi._id);
  assert.ok(pending);
  assert.equal(pending.submissions[0].progressValue, 50);
  assert.equal(pending.submissions[0].notes, 'Halfway complete');
  assert.equal(pending.submissions[0].evidenceUrl, 'https://example.com/evidence.pdf');
  assert.equal(pending.submissions[0].status, 'Pending');
});

// DB-05 - Verification Status and Comment Update
runDatabaseTest('DB-05: Database updates verification status and manager comment', async () => {
  const kpi = await Kpi.create({
    title: `Database Test KPI ${runId} Verification`,
    category: 'Performance',
    targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    targetValue: 100,
    assignee: staffEmail,
    assignees: [staffEmail],
    achievementScore: 50,
    status: 'Under Review',
    submissions: [{
      assignee: staffEmail,
      progressValue: 50,
      notes: 'Ready for manager verification',
      evidenceUrl: 'https://example.com/evidence.pdf',
      status: 'Pending',
    }],
  });

  kpi.submissions[0].status = 'Approved';
  kpi.submissions[0].feedback = 'Accepted';
  kpi.status = 'In Progress';
  await kpi.save();

  const approved = await Kpi.findById(kpi._id);
  assert.equal(approved.submissions[0].status, 'Approved');
  assert.equal(approved.submissions[0].feedback, 'Accepted');
  assert.equal(approved.status, 'In Progress');
});

// DB-06 - Notification Document Consistency
runDatabaseTest('DB-06: Database creates notifications and marks them as read', async () => {
  const note = await Notification.create({
    recipientEmail: staffEmail,
    tag: 'KPI',
    category: 'action',
    title: 'You have been assigned: Database KPI',
    description: 'Deadline: test date',
    link: '/staff/my-kpis',
  });

  const unread = await Notification.findOne({ _id: note._id, recipientEmail: staffEmail });
  assert.ok(unread);
  assert.equal(unread.isRead, false);

  const read = await Notification.findByIdAndUpdate(
    note._id,
    { isRead: true },
    { returnDocument: 'after' }
  );

  assert.equal(read.isRead, true);
});
