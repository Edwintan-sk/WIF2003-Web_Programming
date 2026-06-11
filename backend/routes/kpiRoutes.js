const express = require('express');
const router = express.Router();
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

// Manager CRUD routes — must come after /submissions* so those aren't shadowed by /:id
router.get('/', protectRoute, requireManager, kpiController.getAllKpis);
router.post('/', protectRoute, requireManager, kpiController.createKpi);
router.get('/:id', protectRoute, requireManager, kpiController.getKpiById);
router.put('/:id', protectRoute, requireManager, kpiController.updateKpi);
router.patch('/:id/assignees', protectRoute, requireManager, kpiController.updateAssignees);
router.post('/:id/notify-assignees', protectRoute, requireManager, kpiController.notifyAssignees);
router.delete('/:id', protectRoute, requireManager, kpiController.deleteKpi);

module.exports = router;
