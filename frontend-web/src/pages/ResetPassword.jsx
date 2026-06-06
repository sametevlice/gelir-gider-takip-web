import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

export default function ResetPassword({ onBack, onSuccess }) {
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pass.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (pass !== confirmPass) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: pass
      });
      if (error) throw error;
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-[28px] font-black text-[#11142D] tracking-tight mb-3 text-center">
            Yeni Şifre Belirle
          </h2>
          <p className="text-sm font-bold text-gray-400 text-center leading-relaxed">
            Lütfen hesabınız için yeni ve güvenli bir şifre belirleyin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Yeni Şifre</label>
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

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Yeni Şifre Onay</label>
            <input 
              type="password" placeholder="••••••••" 
              className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading || pass.length === 0}
            className="w-full py-5 bg-[#11142D] text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'KAYDEDİLİYOR...' : 'ŞİFREYİ GÜNCELLE →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
