const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const getFinancialAdvice = async (transactions) => {
  try {
    console.log("Gemini Tetiklendi, Key Mevcut mu?:", !!apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { temperature: 0.0 } 
    });
    
    // Harcamaları formatlıyoruz
    const formattedTransactions = transactions.map(t => {
      const cat = t.category || t.categoryId || 'Diğer';
      const desc = t.description || t.brand || '';
      return `${t.date || ''} - ${cat}: ${t.type === 'INCOME' ? '+' : '-'}${t.amount} TL (${desc})`;
    }).join('\n');

    const prompt = `Sen bir finans uzmanısın. Kullanıcının şu harcamalarına bak:\n\n${formattedTransactions}\n\nBu kullanıcıya çok kısa (max 120 karakter), samimi ve Türkçe bir finansal tavsiye ver. Ayrıca finansal durumunu 100 üzerinden puanla. YALNIZCA geçerli bir JSON objesi döndür. Başına veya sonuna markdown işaretleri (\`\`\`json vb.) EKLEME:\n{"score": 85, "note": "Buraya tavsiyeni yaz"}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Temizleme ve Parsing Güvenliği
    // Markdown bloklarını (```json veya ```) ve baştaki/sondaki boşlukları kaldır
    let cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    // Eğer yanıt sadece bir obje ise süslü parantezlerin dışındaki her şeyi temizle (Fallback güvenlik)
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    
    console.log("Temizlenen Gemini Yanıtı:", cleanText);
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.warn("GOOGLE_RESPONSE_WARN:", error.message);
    if (error.message.includes("429") || error.message.includes("quota")) {
      return { score: 50, note: "API Kota Sınırı Aşıldı. Lütfen Google Cloud limitlerinizi kontrol edin veya biraz bekleyin." };
    }
    return {
      score: 50,
      note: "Şu an AI analiz servisine ulaşılamıyor, harcamalarınıza dikkat etmeye devam edin."
    };
  }
};

const askFinancialAssistant = async (transactions, question) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { temperature: 0.3 } 
    });
    
    // Harcamaları formatlıyoruz
    const formattedTransactions = transactions.map(t => {
      const cat = t.category || t.categoryId || 'Diğer';
      const desc = t.description || t.brand || '';
      return `${t.date || ''} - ${cat}: ${t.type === 'INCOME' ? '+' : '-'}${t.amount} TL (${desc})`;
    }).join('\n');

    const prompt = `Sen bir finans uzmanı asistanısın. Kullanıcının güncel işlemleri şunlar:\n\n${formattedTransactions}\n\nKullanıcının sorusu: "${question}"\n\nBu soruya kullanıcıya yardımcı olacak, EN FAZLA 2-3 CÜMLELİK çok kısa, net, samimi ve Türkçe bir yanıt ver. Doğrudan Markdown destekli temiz bir metin formatında cevap yaz, JSON kullanma. Uzun paragraflar yazmaktan kesinlikle kaçın.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    return responseText.trim();
  } catch (error) {
    console.warn("GOOGLE_RESPONSE_WARN (Chat):", error.message);
    if (error.message.includes("429") || error.message.includes("quota")) {
      return "Mesaj sınırına ulaştınız (Kota Doldu). Lütfen daha sonra tekrar deneyin veya API anahtarınızı kontrol edin.";
    }
    return "Şu an finansal asistana ulaşılamıyor. Lütfen daha sonra tekrar deneyin.";
  }
};

module.exports = {
  getFinancialAdvice,
  askFinancialAssistant
};
