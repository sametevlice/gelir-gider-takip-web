const supabase = require('../../config/supabaseClient');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkisiz erişim. Token bulunamadı.' });
    }

    const token = authHeader.split(' ')[1];

    // Supabase ile token doğrula ve kullanıcıyı al
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token.' });
    }

    // Kullanıcı bilgisini request objesine ekle
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

module.exports = authMiddleware;
