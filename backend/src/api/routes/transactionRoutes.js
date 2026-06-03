const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tüm transaction rotaları korumalıdır
router.use(authMiddleware);

router.post('/', transactionsController.addTransaction);
router.get('/', transactionsController.getTransactions);
router.get('/balance', transactionsController.getBalance);
router.put('/:id', transactionsController.updateTransaction);
router.delete('/:id', transactionsController.deleteTransaction);

module.exports = router;
