const supabase = require('../../config/supabaseClient');
const aiService = require('../services/aiService');

const getAiHealthCache = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('profiles')
      .select('last_ai_analysis, last_ai_score')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(400).json({ message: 'Profil bilgisi alınamadı.', error: error.message });
    }

    res.json({
      success: true,
      data: {
        score: data.last_ai_score,
        note: data.last_ai_analysis
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

const refreshAiHealth = async (req, res) => {
  try {
    const { transactions } = req.body;
    const userId = req.user.id;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ message: 'Lütfen işlemleri (transactions) gönderin.' });
    }

    const aiResult = await aiService.getFinancialAdvice(transactions);
    
    // Save to profiles
    const { error } = await supabase
      .from('profiles')
      .update({
        last_ai_analysis: aiResult.note,
        last_ai_score: aiResult.score
      })
      .eq('id', userId);

    if (error) {
       console.error("Cache update failed:", error);
    }

    res.json({
      success: true,
      data: aiResult
    });

  } catch (error) {
    res.status(500).json({ message: 'AI analizi sırasında hata oluştu.', error: error.message });
  }
};

const askAssistant = async (req, res) => {
  try {
    const { transactions, question } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ message: 'Lütfen işlemleri (transactions) gönderin.' });
    }
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ message: 'Lütfen bir soru (question) gönderin.' });
    }

    const answer = await aiService.askFinancialAssistant(transactions, question);

    res.json({
      success: true,
      data: { answer }
    });

  } catch (error) {
    res.status(500).json({ message: 'AI asistanı sırasında hata oluştu.', error: error.message });
  }
};

module.exports = {
  getAiHealthCache,
  refreshAiHealth,
  askAssistant
};
