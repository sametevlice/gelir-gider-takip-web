require('dotenv').config({ path: '/Users/abdulsametevlice/Desktop/DERS-PROJEM /web-gelir-takip/backend/.env' });

async function test() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    console.log(data.models.map(m => m.name));
  } catch (err) {
    console.error(err.message);
  }
}
test();
