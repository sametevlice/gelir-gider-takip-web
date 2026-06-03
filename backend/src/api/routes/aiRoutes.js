const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/health', aiController.getAiHealthCache);
router.post('/health', aiController.refreshAiHealth);
router.post('/chat', aiController.askAssistant);

module.exports = router;
