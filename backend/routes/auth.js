const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

// Ortam değişkeninden gizli anahtarı al (Yoksa varsayılan kullan)
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_finans_anahtar_degistir_lutfen';

// YENİ KULLANICI KAYDI (REGISTER)
router.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'Lütfen tüm alanları doldurun.' });
    }

    try {
        // Şifreyi şifrele (Hashleme)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Veritabanına yeni kullanıcıyı ekle
        const sql = `INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)`;
        db.run(sql, [full_name, email, password_hash], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Bu email adresi zaten kullanımda.' });
                }
                return res.status(500).json({ error: 'Veritabanı hatası.', details: err.message });
            }
            res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi!', userId: this.lastID });
        });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası.', details: err.message });
    }
});

// KULLANICI GİRİŞİ (LOGIN)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Lütfen email ve şifre girin.' });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası.' });
        if (!user) return res.status(400).json({ error: 'Bu emaile ait bir hesap bulunamadı.' });

        // Şifre kontrolü
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Hatalı şifre.' });

        // Token oluşturma
        const token = jwt.sign(
            { id: user.id, full_name: user.full_name, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' } // Token 24 saat geçerli
        );

        res.json({
            message: 'Giriş başarılı!',
            token: token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });
    });
});

module.exports = router;
