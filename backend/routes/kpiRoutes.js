const express = require('express');
const router = express.Router();
const Kpi = require('../models/Kpi.js');
const { protectRoute } = require('../middleware/authMiddleware.js');
const kpiController = require('../controllers/kpiController.js');
const submissionController = require('../controllers/submissionController.js');

const upload = require('../middleware/upload.js');

// Helper middleware to restrict route to managers only
const requireManager = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Managers only' });
};

// 1. GET dashboard aggregates for logged-in staff member (Protected)
router.get('/dashboard', protectRoute, kpiController.getDashboardData);

// 2. GET list of KPIs specifically assigned to the logged-in staff (Protected)
router.get('/assigned', protectRoute, kpiController.getAssignedKpis);

// 3. POST submit a progress update for review (Protected)
router.post('/progress', protectRoute, (req, res, next) => {
  upload.single('evidenceFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, kpiController.submitProgress);

// Submissions routes (Protected, Manager only)
router.get('/submissions', protectRoute, requireManager, submissionController.getSubmissions);
router.get('/submissions/:id', protectRoute, requireManager, submissionController.getSubmissionById);
router.post('/submissions/:id/review', protectRoute, requireManager, submissionController.reviewSubmission);

// --- Existing Legacy Routes (Preserved for compatibility) ---

// 4. GET all KPIs from database
router.get('/', async (req, res) => {
  try {
    const kpis = await Kpi.find().sort({ createdAt: -1 });
    res.status(200).json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. POST create a new KPI
router.post('/', async (req, res) => {
  try {
    const newKpi = new Kpi(req.body);
    const savedKpi = await newKpi.save();
    res.status(201).json(savedKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 6. PUT update an existing KPI or progress
router.put('/:id', async (req, res) => {
  try {
    const updatedKpi = await Kpi.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedKpi) return res.status(404).json({ message: "KPI not found" });
    res.status(200).json(updatedKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
