import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

export default function ForgotPassword({ onBack, onSuccess }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      if (onSuccess) onSuccess(email);
    } catch (err) {
      console.error(err);
      alert('Hata: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-white p-10 md:p-14 relative"
      >
        <button 
          onClick={onBack}
          type="button"
          className="absolute top-8 left-8 w-10 h-10 rounded-full border border-gray-50 flex items-center justify-center text-gray-400 hover:text-[#11142D] hover:bg-gray-50 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        <div className="flex flex-col items-center mb-10 mt-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v6h6"/></svg>
          </div>
          <h2 className="text-[28px] font-black text-[#11142D] tracking-tight mb-3 text-center">
            Şifremi Unuttum
          </h2>
          <p className="text-sm font-bold text-gray-400 text-center leading-relaxed">
            Şifrenizi sıfırlamak için e-posta adresinizi girin. Size bir doğrulama kodu göndereceğiz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">E-posta Adresi</label>
            <div className="relative">
              <input 
                type="email" placeholder="ornek@email.com" 
                className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                value={email} onChange={e => setEmail(e.target.value)}
                required
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-5 bg-[#11142D] text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'GÖNDERİLİYOR...' : 'KOD GÖNDER →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
