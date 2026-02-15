const express = require('express');
const InterviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/start', InterviewController.startInterview);
router.post('/answer', InterviewController.submitAnswer);
router.get('/report/:sessionId', InterviewController.getReport);
router.get('/history', InterviewController.getHistory);
router.get('/session/:sessionId/qa', InterviewController.getSessionQA);

module.exports = router;
