const express = require('express');
const router = express.Router();
const Kpi = require('../models/Kpi.js');
const { protectRoute } = require('../middleware/authMiddleware.js');
const kpiController = require('../controllers/kpiController.js');
const { requireRole } = require('../middleware/roleMiddleware.js');

const upload = require('../middleware/upload.js');

// 1. GET dashboard aggregates for logged-in staff member (Protected)
router.get('/dashboard', protectRoute, kpiController.getDashboardData);

// 2. GET list of KPIs specifically assigned to the logged-in staff (Protected)
router.get('/assigned', protectRoute, kpiController.getAssignedKpis);

// 3. POST submit a progress update for review (Protected)
router.post('/progress', protectRoute, (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, kpiController.submitProgress);

// 4. GET all KPIs from database
router.get('/', protectRoute, requireRole('manager'), async (req, res) => {
  try {
    const kpis = await Kpi.find().sort({ createdAt: -1 });
    res.status(200).json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. POST create a new KPI
router.post('/', protectRoute, requireRole('manager'), async (req, res) => {
  try {
    const newKpi = new Kpi(req.body);
    const savedKpi = await newKpi.save();
    res.status(201).json(savedKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 6. PUT update an existing KPI or progress
router.put('/:id', protectRoute, requireRole('manager'), async (req, res) => {
  try {
    const updatedKpi = await Kpi.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedKpi) return res.status(404).json({ message: "KPI not found" });
    res.status(200).json(updatedKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Manager Dashboard
router.get(
  '/manager/dashboard',
  protectRoute,
  requireRole('manager'),
  kpiController.getManagerDashboardData
);

// Submissions Routes for Manager
router.get(
  '/manager/submissions',
  protectRoute,
  requireRole('manager'),
  kpiController.getSubmissions
);

router.get(
  '/manager/submissions/:id',
  protectRoute,
  requireRole('manager'),
  kpiController.getSubmissionById
);

router.patch(
  '/manager/submissions/:id/decision',
  protectRoute,
  requireRole('manager'),
  kpiController.handleSubmissionDecision
);

// GET single KPI
router.get(
  '/:id',
  protectRoute,
  requireRole('manager'),
  kpiController.getKpiById
);

// DELETE KPI
router.delete(
  '/:id',
  protectRoute,
  requireRole('manager'),
  kpiController.deleteKpi
);

// Approve Submission (legacy)
router.patch(
  '/approve',
  protectRoute,
  requireRole('manager'),
  kpiController.approveSubmission
);

module.exports = router;
