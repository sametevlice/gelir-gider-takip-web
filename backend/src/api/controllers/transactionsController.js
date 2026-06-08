const supabase = require('../../config/supabaseClient');

const triggerAiBackground = async (userId) => {
  try {
    const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (txs) {
      const now = new Date();
      const thisMonthTxs = txs.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const aiService = require('../services/aiService');
      const aiResult = await aiService.getFinancialAdvice(thisMonthTxs);
      if (aiResult && aiResult.score !== undefined) {
        await supabase.from('profiles').update({
          last_ai_analysis: aiResult.note,
          last_ai_score: aiResult.score
        }).eq('id', userId);
      }
    }
  } catch (err) {
    console.error('Background AI trigger error:', err);
  }
};

const addTransaction = async (req, res) => {
  try {
    const { amount, category, description, type, date } = req.body;
    const userId = req.user.id; // authMiddleware'den geliyor

    if (!amount || !category || !type) {
      return res.status(400).json({ message: 'Lütfen miktar, kategori ve tip alanlarını doldurun.' });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount: parseFloat(amount),
          category,
          description: description || '',
          type: type.toUpperCase(),
          date: date || new Date().toISOString().split('T')[0]
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ message: 'İşlem kaydedilemedi.', error: error.message });
    }

    res.status(201).json({
      message: 'İşlem başarıyla kaydedildi.',
      transaction: data[0]
    });

    // Ping profiles to trigger realtime sync
    await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', userId);

    // Trigger AI async
    triggerAiBackground(userId);

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      return res.status(400).json({ message: 'İşlemler getirilemedi.', error: error.message });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ message: 'Bakiye hesaplanamadı.', error: error.message });
    }

    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach(item => {
      if (item.type === 'INCOME') {
        totalIncome += item.amount;
      } else if (item.type === 'EXPENSE') {
        totalExpense += item.amount;
      }
    });

    const totalBalance = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      totalBalance
    });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, type, date } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('transactions')
      .update({
        amount: parseFloat(amount),
        category,
        description,
        type: type ? type.toUpperCase() : undefined,
        date: date || undefined
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      return res.status(400).json({ message: 'İşlem güncellenemedi.', error: error.message });
    }

    res.json({
      message: 'İşlem başarıyla güncellendi.',
      transaction: data[0]
    });

    // Ping profiles to trigger realtime sync
    await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', userId);

    triggerAiBackground(userId);

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ message: 'İşlem silinemedi.', error: error.message });
    }

    res.json({ message: 'İşlem başarıyla silindi.' });

    // Ping profiles to trigger realtime sync
    await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', userId);

    triggerAiBackground(userId);

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getBalance,
  updateTransaction,
  deleteTransaction
};
