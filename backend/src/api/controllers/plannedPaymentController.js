const supabase = require('../../config/supabaseClient');

const getPlannedPayments = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware sets this

    const { data, error } = await supabase
      .from('planned_payments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      return res.status(400).json({ message: 'Planlanmış ödemeler getirilemedi.', error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

const addPlannedPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, amount, date, category_id, domain, color, is_paid } = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({ message: 'Lütfen başlık, miktar ve tarih alanlarını doldurun.' });
    }

    const { data, error } = await supabase
      .from('planned_payments')
      .insert([
        {
          user_id: userId,
          title,
          amount: parseFloat(amount),
          date,
          category_id: category_id || 'cat15',
          domain: domain || 'generic',
          color: color || 'bg-indigo-50 border-indigo-100',
          is_paid: is_paid || false
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ message: 'Ödeme planı kaydedilemedi.', error: error.message });
    }

    // Ping profiles to trigger realtime sync
    await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', userId);

    res.status(201).json({
      message: 'Ödeme planı başarıyla kaydedildi.',
      plannedPayment: data[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

const deletePlannedPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('planned_payments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ message: 'Ödeme planı silinemedi.', error: error.message });
    }

    // Ping profiles to trigger realtime sync
    await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', userId);

    res.json({ message: 'Ödeme planı başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

module.exports = {
  getPlannedPayments,
  addPlannedPayment,
  deletePlannedPayment
};
