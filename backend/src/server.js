const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes Import
const authRoutes = require('./api/routes/authRoutes');
const transactionRoutes = require('./api/routes/transactionRoutes');
const aiRoutes = require('./api/routes/aiRoutes');
const plannedPaymentRoutes = require('./api/routes/plannedPaymentRoutes');

// Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/planned-payments', plannedPaymentRoutes);

app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'FinTech API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5005;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ HATA: ${PORT} portu şu anda başka bir uygulama tarafından kullanılıyor.`);
    console.error(`💡 ÇÖZÜM: 'lsof -i :${PORT}' komutuyla portu kullanan işlemi bulup sonlandırabilir veya portu değiştirebilirsiniz.`);
  } else {
    console.error('❌ Server başlatılırken hata oluştu:', err.message);
  }
  process.exit(1);
});

// Prevent immediate exit
process.stdin.resume();
