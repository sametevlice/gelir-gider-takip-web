const supabase = require('../../config/supabaseClient');

const register = async (req, res) => {
  try {
    const { full_name, email, password, phone_number } = req.body;

    // Gerekli alanların kontrolü
    if (!full_name || !email || !password || !phone_number) {
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
    }

    // 1. Supabase Auth ile kullanıcıyı kaydet
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (data.user) {
      // 2. Kayıt başarılıysa 'profiles' tablosuna ek bilgiler (name, phone) ekle
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: full_name,
          phone_number: phone_number,
          updated_at: new Date(),
        });

      if (profileError) {
        // Not: Auth başarılı ama profil kaydı başarısız olabilir (tablo yoksa vb.)
        return res.status(400).json({ 
          message: 'Kullanıcı oluşturuldu ancak profil bilgileri kaydedilemedi.', 
          error: profileError.message 
        });
      }
    }

    res.status(201).json({ 
      message: 'Kullanıcı başarıyla oluşturuldu. E-postanızı kontrol edin.',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: full_name,
        phone_number: phone_number
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Gerekli alanların kontrolü
    if (!email || !password) {
      return res.status(400).json({ message: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    // Supabase Auth ile giriş yap
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: 'Geçersiz kimlik bilgileri veya doğrulanmamış e-posta.' });
    }

    // Giriş başarılıysa kullanıcının profil bilgilerini de çekelim (opsiyonel ama faydalı)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Giriş başarılı.',
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || ''
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

module.exports = {
  register,
  login
};
