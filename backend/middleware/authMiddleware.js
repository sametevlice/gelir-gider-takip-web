const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_finans_anahtar_degistir_lutfen';

module.exports = function (req, res, next) {
    // Header'da token var mı?
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN_STRING"

    if (!token) {
        return res.status(401).json({ error: 'Erişim reddedildi. Yetki belgesi (Token) bulunamadı.' });
    }

    // Token geçerli mi?
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
        }

        // Doğrulanan kullanıcı bilgilerini request objesine koy
        req.user = user;
        next();
    });
};
