const express = require('express');
const router = express.Router();
const { getPlannedPayments, addPlannedPayment, deletePlannedPayment } = require('../controllers/plannedPaymentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware); // Protect all routes

router.get('/', getPlannedPayments);
router.post('/', addPlannedPayment);
router.delete('/:id', deletePlannedPayment);

module.exports = router;
