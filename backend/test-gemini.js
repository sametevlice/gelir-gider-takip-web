require('dotenv').config({ path: '/Users/abdulsametevlice/Desktop/DERS-PROJEM /web-gelir-takip/backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  console.log("Key exists:", !!process.env.GEMINI_API_KEY);
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("Merhaba, çalışıyor musun?");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
