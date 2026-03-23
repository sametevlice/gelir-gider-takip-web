const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authenticateToken = require('../middleware/authMiddleware');

// KULLANICIYA AIT TÜM İŞLEMLERİ GETİR
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id; // Middleware'den gelen giriş bilgisi

    // İşlemleri en yeniden en eskiye sırala
    const sql = `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC`;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'İşlemler alınırken veritabanı hatası.', details: err.message });
        }
        res.json({ transactions: rows });
    });
});

// YENİ BİR İŞLEM EKLE (GELİR VEYA GİDER)
router.post('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category || !date) {
        return res.status(400).json({ error: 'Lütfen zorunlu alanları (Tutar, Tip, Kategori, Tarih) doldurun.' });
    }

    if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ error: "Geçersiz işlem tipi. 'income' (gelir) veya 'expense' (gider) olmalıdır." });
    }

    const sql = `INSERT INTO transactions (user_id, amount, type, category, description, date) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [userId, amount, type, category, description, date], function (err) {
        if (err) {
            return res.status(500).json({ error: 'İşlem eklenirken hata oluştu.', details: err.message });
        }

        // Yeni eklenen kaydı döndür
        db.get(`SELECT * FROM transactions WHERE id = ?`, [this.lastID], (err, row) => {
            res.status(201).json({ message: 'İşlem başarıyla eklendi.', transaction: row });
        });
    });
});

// BİR İŞLEMİ SİL
router.delete('/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const transactionId = req.params.id;

    // Sadece kullanıcının kendine ait işlemini silebildiğinden emin ol
    const sql = `DELETE FROM transactions WHERE id = ? AND user_id = ?`;

    db.run(sql, [transactionId, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'İşlem silinirken hata oluştu.', details: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'İşlem bulunamadı veya silme yetkiniz yok.' });
        }
        res.json({ message: 'İşlem başarıyla silindi.', id: transactionId });
    });
});

// BİR İŞLEMİ GÜNCELLE
router.put('/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category || !date) {
        return res.status(400).json({ error: 'Lütfen zorunlu alanları doldurun.' });
    }

    if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ error: "Geçersiz işlem tipi." });
    }

    const sql = `UPDATE transactions SET amount = ?, type = ?, category = ?, description = ?, date = ? WHERE id = ? AND user_id = ?`;

    db.run(sql, [amount, type, category, description, date, transactionId, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'İşlem güncellenirken hata oluştu.', details: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'İşlem bulunamadı veya güncelleme yetkiniz yok.' });
        }
        
        // Güncellenen kaydı döndür
        db.get(`SELECT * FROM transactions WHERE id = ?`, [transactionId], (err, row) => {
            res.json({ message: 'İşlem başarıyla güncellendi.', transaction: row });
        });
    });
});

module.exports = router;
