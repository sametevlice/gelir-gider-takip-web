import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const CODE_LENGTH = 6;

export default function EmailVerification({ email, type = 'signup', onVerify, onBack }) {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (!value) return;

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Otomatik olarak bir sonraki kutuya geç
    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newCode = [...code];
      if (code[index]) {
        // Mevcut kutuyu temizle
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        // Bir öncekini temizle ve oraya odaklan
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    if (!pastedData) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    
    // Yapıştırılan veriden sonra son boş kutuya odaklan
    const focusIndex = pastedData.length < CODE_LENGTH ? pastedData.length : CODE_LENGTH - 1;
    inputRefs.current[focusIndex].focus();
  };

  const handleVerifyClick = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: fullCode,
        type: type,
      });

      if (error) throw error;

      if (onVerify) onVerify(fullCode);
    } catch (err) {
      console.error('Doğrulama hatası:', err.message);
      alert('Doğrulama hatası: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: type,
        email: email,
      });
      if (error) throw error;
      alert('Yeni kod gönderildi!');
    } catch (err) {
      console.error('Gönderim hatası:', err.message);
      alert('Hata: ' + err.message);
    }
  };

  const isComplete = code.join('').length === CODE_LENGTH;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Arka plan dekoratif öğeler */}
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
        {/* Geri Butonu */}
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 w-10 h-10 rounded-full border border-gray-50 flex items-center justify-center text-gray-400 hover:text-[#11142D] hover:bg-gray-50 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        <div className="flex flex-col items-center mb-10 mt-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h2 className="text-[28px] font-black text-[#11142D] tracking-tight mb-3 text-center">
            E-posta Doğrulama
          </h2>
          <p className="text-sm font-bold text-gray-400 text-center leading-relaxed">
            <span className="text-[#11142D]">{email || 'E-posta adresinize'}</span> adresine gönderdiğimiz 6 haneli doğrulama kodunu girin.
          </p>
        </div>

        <div className="flex justify-between gap-2 mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 outline-none transition-all ${
                digit 
                  ? 'border-[#11142D] bg-white text-[#11142D]' 
                  : 'border-gray-100 bg-gray-50 text-[#11142D] focus:border-indigo-400 focus:bg-white'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={handleVerifyClick}
          disabled={!isComplete || isLoading}
          className="w-full py-5 bg-[#11142D] text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-8"
        >
          {isLoading ? 'DOĞRULANIYOR...' : 'KODU DOĞRULA →'}
        </button>

        <div className="text-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
            Kod gelmedi mi?
            <button 
              onClick={handleResend}
              className="ml-2 text-indigo-600 font-black hover:text-indigo-700 transition-colors"
            >
              TEKRAR GÖNDER
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
