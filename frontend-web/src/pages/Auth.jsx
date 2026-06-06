import { useState } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth({ initialIsLogin = true, onBack, onRegisterSuccess, onForgotPassword }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const login = useStore(state => state.login);
  const register = useStore(state => state.register);
  const showToast = useStore(state => state.showToast);

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatPhone = (val) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    let formatted = '+90 ';
    if (cleaned.startsWith('90')) {
      const core = cleaned.slice(2);
      if (core.length > 0) formatted += '(' + core.slice(0, 3);
      if (core.length > 3) formatted += ') ' + core.slice(3, 6);
      if (core.length > 6) formatted += ' ' + core.slice(6, 8);
      if (core.length > 8) formatted += ' ' + core.slice(8, 10);
    } else {
      if (cleaned.length > 0) formatted += '(' + cleaned.slice(0, 3);
      if (cleaned.length > 3) formatted += ') ' + cleaned.slice(3, 6);
      if (cleaned.length > 6) formatted += ' ' + cleaned.slice(6, 8);
      if (cleaned.length > 8) formatted += ' ' + cleaned.slice(8, 10);
    }
    return formatted.trim();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || pass.length < 6) {
      return showToast('Lütfen geçerli bilgiler girin', 'error');
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
      });
      if (error) throw error;
      
      login(data.user); 
      showToast('Giriş başarılı!', 'success');
    } catch (err) {
      showToast(err.message || 'Giriş yapılamadı', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || pass.length < 8) {
      return showToast('Tüm alanları doldurun (şifre min. 8)', 'error');
    }
    if (phone.length < 18) {
      return showToast('Lütfen geçerli bir telefon numarası girin', 'error');
    }
    if (pass !== confirmPass) {
      return showToast('Şifreler uyuşmuyor', 'error');
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: pass,
        options: {
          data: {
            full_name: name,
            phone_number: phone,
          }
        }
      });
      if (error) throw error;

      showToast('Kayıt başarılı! Lütfen e-postanızı doğrulayın.', 'success');
      if (onRegisterSuccess) {
        onRegisterSuccess(email);
      } else {
        setIsLogin(true);
      }
      setPass('');
      setConfirmPass('');
    } catch (err) {
      showToast(err.message || 'Kayıt yapılamadı', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-white p-10 md:p-14 relative"
      >
        {/* Back to Landing */}
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 w-10 h-10 rounded-full border border-gray-50 flex items-center justify-center text-gray-400 hover:text-[#11142D] hover:bg-gray-50 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-[#11142D] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-gray-200 mb-6">F</div>
          <h2 className="text-[32px] font-black text-[#11142D] tracking-tight mb-2">
            {isLogin ? 'Tekrar Hoş Geldin' : 'Hesap Oluştur'}
          </h2>
          <p className="text-sm font-bold text-gray-400 text-center">
            {isLogin ? 'Finansal kontrolünü eline al ve büyümeye başla.' : 'Finansal özgürlüğüne giden yolda ilk adımı at.'}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Ad Soyad</label>
                <div className="relative">
                  <input 
                    type="text" placeholder="Adınız Soyadınız" 
                    className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">E-posta Adresi</label>
            <div className="relative">
              <input 
                type="email" placeholder="ornek@email.com" 
                className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                key="phone-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefon Numarası</label>
                <div className="relative">
                  <input 
                    type="text" placeholder="+90 (5XX) XXX XX XX" 
                    className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Şifre</label>
              {isLogin && <button type="button" onClick={onForgotPassword} className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors">Şifremi Unuttum</button>}
            </div>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                value={pass} onChange={e => setPass(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-400 transition-colors"
              >
                {showPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Şifre Onay</label>
              <input 
                type="password" placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
              />
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[#11142D] text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoading ? 'Lütfen Bekleyin...' : (isLogin ? 'Giriş Yap →' : 'Hesap Oluştur →')}
          </button>
        </form>



        <div className="mt-12 text-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
            {isLogin ? 'Henüz hesabın yok mu?' : 'Zaten hesabın var mı?'}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-600 font-black hover:text-indigo-700 transition-colors"
            >
              {isLogin ? 'Hemen Kayıt Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
