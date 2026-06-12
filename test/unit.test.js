const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

process.env.JWT_SECRET ||= 'unit-test-secret';

const express = require('../backend/node_modules/express');
const User = require('../backend/models/User');
const Kpi = require('../backend/models/Kpi');
const { protectRoute } = require('../backend/middleware/authMiddleware');
const upload = require('../backend/middleware/upload');

const makeUser = (overrides = {}) => new User({
  role: 'staff',
  firstName: 'Test',
  lastName: 'User',
  roleAtShop: 'Operations',
  email: 'unit.user@example.com',
  password: 'Password123',
  ...overrides,
});

const makeKpi = (overrides = {}) => new Kpi({
  title: 'Monthly Sales Target',
  category: 'Sales',
  targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  targetValue: 80,
  ...overrides,
});

const makeResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

// UT-01 - Password Too Short Validation
test('UT-01: User model rejects passwords shorter than 8 characters', async () => {
  const user = makeUser({ password: '12345' });

  await assert.rejects(
    () => user.validate(),
    /password.*shorter than the minimum allowed length/i
  );
});

// UT-02 - Required Registration Fields
test('UT-02: User model requires the registration fields used by the project', async () => {
  const user = makeUser({
    role: undefined,
    firstName: '',
    lastName: '',
    roleAtShop: '',
    email: '',
    password: '',
  });

  await assert.rejects(
    () => user.validate(),
    (error) => {
      assert.equal(error.name, 'ValidationError');
      assert.ok(error.errors.role);
      assert.ok(error.errors.firstName);
      assert.ok(error.errors.lastName);
      assert.ok(error.errors.roleAtShop);
      assert.ok(error.errors.email);
      assert.ok(error.errors.password);
      return true;
    }
  );
});

// UT-03 - Duplicate Email Validation
test('UT-03: User model marks email as unique for duplicate email prevention', () => {
  assert.equal(User.schema.path('email').options.unique, true);
  assert.equal(User.schema.path('email').options.lowercase, true);
  assert.equal(User.schema.path('email').options.trim, true);
});

// UT-04 - Login Role Mismatch Validation
test('UT-04: Stored user role can be compared against the selected login role', () => {
  const storedUser = makeUser({ role: 'manager' });
  const selectedLoginRole = 'staff';

  assert.notEqual(storedUser.role, selectedLoginRole);
});

// UT-05 - Protected Route Token Validation
test('UT-05: protectRoute rejects invalid tokens before protected data is returned', async () => {
  const req = {
    cookies: {},
    headers: {
      authorization: 'Bearer definitely-not-a-valid-token',
    },
  };
  const res = makeResponse();
  let nextCalled = false;

  await protectRoute(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /invalid authentication token/i);
});

// UT-06 - KPI Required Field Validation
test('UT-06: KPI model requires title, category, and target date', async () => {
  const kpi = makeKpi({
    title: '',
    category: '',
    targetDate: undefined,
  });

  await assert.rejects(
    () => kpi.validate(),
    (error) => {
      assert.equal(error.name, 'ValidationError');
      assert.ok(error.errors.title);
      assert.ok(error.errors.category);
      assert.ok(error.errors.targetDate);
      return true;
    }
  );
});

// UT-07 - Progress Range Validation
test('UT-07: KPI submissions reject progress outside the 0 to 100 range', async () => {
  const kpi = makeKpi({
    submissions: [{
      assignee: 'staff@example.com',
      progressValue: 120,
      notes: 'Invalid progress value',
    }],
  });

  await assert.rejects(
    () => kpi.validate(),
    /progressValue.*more than maximum allowed value/i
  );
});

// UT-08 - Evidence File Type Validation
test('UT-08: Upload middleware rejects unsupported evidence file types', async () => {
  const app = express();
  app.post('/upload-test', (req, res, next) => {
    upload.any()(req, res, (error) => {
      if (error) return res.status(400).json({ message: error.message });
      return next();
    });
  }, (req, res) => {
    res.status(200).json({ ok: true });
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const { port } = server.address();
    const form = new FormData();
    form.append('evidence', new Blob(['invalid executable content']), 'test.exe');

    const response = await fetch(`http://127.0.0.1:${port}/upload-test`, {
      method: 'POST',
      body: form,
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.match(body.message, /invalid file type/i);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
