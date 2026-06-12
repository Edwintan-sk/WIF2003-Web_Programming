const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware.js');
const { requireRole } = require('../middleware/roleMiddleware.js');
const kpiController = require('../controllers/kpiController.js');
const upload = require('../middleware/upload.js');

const managerOnly = [protectRoute, requireRole('manager')];

// Staff KPI routes
router.get('/dashboard', protectRoute, kpiController.getDashboardData);
router.get('/assigned', protectRoute, kpiController.getAssignedKpis);
router.post('/progress', protectRoute, (req, res, next) => {
  upload.any()(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message,
        storageMode: upload.storageMode,
      });
    }
    next();
  });
}, kpiController.submitProgress);

// Manager dashboard and verification routes
router.get('/manager/dashboard', ...managerOnly, kpiController.getManagerDashboardData);
router.get('/manager/submissions', ...managerOnly, kpiController.getSubmissions);
router.get('/manager/submissions/:id', ...managerOnly, kpiController.getSubmissionById);
router.patch(
  '/manager/submissions/:id/decision',
  ...managerOnly,
  kpiController.handleSubmissionDecision
);
router.patch('/approve', ...managerOnly, kpiController.approveSubmission);

// Manager KPI and assignment routes
router.get('/', ...managerOnly, kpiController.getAllKpis);
router.post('/', ...managerOnly, kpiController.createKpi);
router.get('/:id', ...managerOnly, kpiController.getKpiById);
router.put('/:id', ...managerOnly, kpiController.updateKpi);
router.patch('/:id/assignees', ...managerOnly, kpiController.updateAssignees);
router.post('/:id/notify-assignees', ...managerOnly, kpiController.notifyAssignees);
router.delete('/:id', ...managerOnly, kpiController.deleteKpi);

module.exports = router;
