const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Kişisel Finans Uygulaması API Sunucusu Çalışıyor 🚀' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} portunda başarıyla başlatıldı.`);
});
