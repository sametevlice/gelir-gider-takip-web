import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function LandingPage({ onLogin, onRegister }) {
  return (
    <div className="min-h-screen bg-white text-[#11142D] font-sans selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-50">
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#11142D] rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-gray-200">F</div>
            <span className="text-2xl font-black tracking-tighter text-[#11142D]">FinTech</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-extrabold text-gray-400 hover:text-[#11142D] transition-colors uppercase tracking-widest">Özellikler</a>
            <a href="#solutions" className="text-sm font-extrabold text-gray-400 hover:text-[#11142D] transition-colors uppercase tracking-widest">Çözümler</a>
            <a href="#about" className="text-sm font-extrabold text-gray-400 hover:text-[#11142D] transition-colors uppercase tracking-widest">Hakkımızda</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-6 py-2.5 text-sm font-extrabold text-[#11142D] hover:bg-gray-50 rounded-xl transition-all"
            >
              Giriş Yap
            </button>
            <button 
              onClick={onRegister}
              className="px-6 py-2.5 bg-[#11142D] text-white text-sm font-extrabold rounded-xl shadow-xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all"
            >
              Hemen Başla
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-8 pt-40 pb-20 text-center relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-3xl -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm border border-indigo-100/50">
            Yeni Nesil Finans Yönetimi
          </span>
          <h1 className="text-[56px] md:text-[72px] font-black text-[#11142D] leading-[1.1] mb-8 tracking-tight">
            Finansal Geleceğini <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Akıllıca Yönet</span>
          </h1>
          <p className="max-w-[650px] mx-auto text-lg md:text-xl text-gray-400 font-bold leading-relaxed mb-12">
            Gelir-gider takibi yap, bütçeni yönet ve finansal hedeflerine ulaş. 
            Finansal hayatını tek bir yerden kontrol etmenin en şık ve kolay yolu.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-10 py-4 bg-[#11142D] text-white text-base font-extrabold rounded-2xl shadow-2xl shadow-gray-300 hover:scale-105 hover:bg-black active:scale-95 transition-all"
            >
              Giriş Yap
            </button>
            <button 
              onClick={onRegister}
              className="w-full sm:w-auto px-10 py-4 bg-white text-[#11142D] border-2 border-gray-100 text-base font-extrabold rounded-2xl hover:bg-gray-50 hover:border-gray-200 active:scale-95 transition-all"
            >
              Hemen Başla
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-8 bg-[#FAFBFC]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[40px] font-black text-[#11142D] mb-4 tracking-tight">Eşsiz Özellikler</h2>
            <p className="text-gray-400 font-bold max-w-lg mx-auto leading-relaxed">Finansal başarınız için ihtiyacınız olan tüm araçlar tek bir platformda toplandı.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Akıllı Takip', desc: 'Tüm gelir ve giderlerinizi yapay zeka destekli kategorizasyon ile saniyeler içinde kaydedin.', icon: '⚡' },
              { title: 'Detaylı Analiz', desc: 'Harcama alışkanlıklarınızı profesyonel grafiklerle inceleyin ve tasarruf alanlarını keşfedin.', icon: '📊' },
              { title: 'Hedef Odaklılık', desc: 'Hayalinizdeki tatil veya yeni bir araç için birikim hedefleri oluşturun ve ilerlemenizi izleyin.', icon: '🎯' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-50 hover:shadow-xl hover:-translate-y-2 transition-all"
              >
                <div className="text-4xl mb-6">{f.icon}</div>
                <h4 className="text-xl font-extrabold text-[#11142D] mb-4">{f.title}</h4>
                <p className="text-gray-400 font-bold text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-32 px-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-[48px] font-black text-[#11142D] leading-tight tracking-tight">
              Herkes İçin <br/> <span className="text-indigo-600">Finansal Çözümler</span>
            </h2>
            <p className="text-lg text-gray-400 font-bold leading-relaxed">
              İster bireysel harcamalarınızı yönetin, ister aile bütçenizi planlayın. 
              FinTech size özel özelleştirilebilir modülleriyle her ihtiyaca yanıt verir.
            </p>
            <div className="space-y-4">
              {['Abonelik Yönetimi', 'Akıllı Harcama Takibi', 'Otomatik Bütçe Planlama'].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-xs">✓</div>
                  <span className="font-extrabold text-[#11142D]">{item}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={onRegister}
              className="px-10 py-4 bg-[#11142D] text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Ücretsiz Başlayın
            </button>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-indigo-600 rounded-[40px] p-12 text-white relative overflow-hidden"
          >
             <div className="relative z-10">
                <h3 className="text-3xl font-black mb-6">Neden FinTech?</h3>
                <p className="text-indigo-100 font-bold mb-8 leading-relaxed">Türkiye'nin en modern finans arayüzü ile tanışın. Karışık Excel tablolarından kurtulun ve finansal özgürlüğün tadını çıkarın.</p>
                <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex-1 border border-white/10">
                    <div className="text-2xl font-black mb-1">2X</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Daha Hızlı Takip</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex-1 border border-white/10">
                    <div className="text-2xl font-black mb-1">%30</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Ortalama Tasarruf</div>
                  </div>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-8 bg-[#11142D] text-white overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <h2 className="text-[40px] font-black mb-8 tracking-tight">Hakkımızda</h2>
          <p className="max-w-2xl mx-auto text-gray-400 font-bold text-lg leading-relaxed mb-16">
            Biz, finansın herkes için kolay ve anlaşılır olması gerektiğine inanan bir ekibiz. 
            Teknoloji ve tasarımı birleştirerek, geleceğin finansal yönetim araçlarını bugünden inşa ediyoruz.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Ülke', val: '12+' },
              { label: 'Yıl Deneyim', val: '8+' },
              { label: 'İşlem', val: '10M+' },
              { label: 'Destek', val: '7/24' }
            ].map((stat, i) => (
              <div key={i} className="p-8 bg-white/5 rounded-[32px] border border-white/5">
                <div className="text-3xl font-black mb-1">{stat.val}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 px-8 border-t border-gray-50">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#11142D] rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">F</div>
            <span className="text-xl font-black tracking-tighter">FinTech</span>
          </div>
          <div className="flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
            <a href="#" className="hover:text-[#11142D] transition-colors">Kullanım Koşulları</a>
            <a href="#" className="hover:text-[#11142D] transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-[#11142D] transition-colors">İletişim</a>
          </div>
          <p className="text-gray-500 text-[11px] font-bold">© 2026 FinTech. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
