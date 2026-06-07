const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const commentController = require('../controllers/commentController');

// All comment routes require an authenticated user.
router.use(protectRoute);

router.get('/:kpiId', commentController.getComments);
router.post('/:kpiId', commentController.createComment);

module.exports = router;
