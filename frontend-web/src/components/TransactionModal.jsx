import { useState, useEffect, useRef } from 'react';
import { useStore, CATEGORIES, BRAND_LOGOS, detectBrand } from '../store/useStore';
import * as api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import BrandIcon from '../components/BrandIcon';

export default function TransactionModal({ isOpen, onClose, editId = null }) {
  const transactions = useStore(state => state.transactions);
  const addTx = useStore(state => state.addTransaction);
  const updateTx = useStore(state => state.updateTransaction);

  const showToast = useStore(state => state.showToast);
  const user = useStore(state => state.user);

  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [catId, setCatId] = useState('');
  const [note, setNote] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('MONTHLY');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const panelRef = useRef(null);

  const addPayment = useStore(state => state.addPayment);

  useEffect(() => {
    if (isOpen) {
      if (editId) {
        const t = transactions.find(x => x.id === editId);
        if (t) {
          setType(t.type);
          setAmount(t.amount.toString());
          setDesc(t.description);
          setDate(t.date.split('T')[0]);
          setCatId(t.categoryId || '');
          setNote(t.note || '');
          setIsRecurring(false);
          if (t.domain && t.domain !== 'generic') {
            setSelectedBrand(BRAND_LOGOS.find(b => b.domain === t.domain));
          }
        }
      } else {
        setType('EXPENSE');
        setAmount('');
        setDesc('');
        setDate(new Date().toISOString().split('T')[0]);
        setCatId('');
        setNote('');
        setIsRecurring(false);
        setSelectedBrand(null);
      }
    }
  }, [isOpen, editId, transactions]);

  // Real-time detection
  useEffect(() => {
    if (!editId && desc.length > 2) {
      const detected = detectBrand(desc);
      if (detected) {
        setSelectedBrand(detected);
        if (detected.categoryId) setCatId(detected.categoryId);
      }
    }
  }, [desc, editId]);

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return showToast('Lütfen geçerli bir tutar girin', 'error');
    if (!desc.trim()) return showToast('Açıklama boş bırakılamaz', 'error');
    if (!date) return showToast('Lütfen bir tarih seçin', 'error');

    try {
      const payload = {
        amount: amt,
        category: catId || selectedBrand?.categoryId || 'cat15',
        description: desc,
        type,
        date
      };

      if (editId) {
        await api.updateTransaction(editId, payload);
        showToast('İşlem güncellendi ✓', 'success');
      } else {
        await api.addTransaction(payload);
        showToast('İşlem kaydedildi ✓', 'success');
      }

      // Refresh data in store
      const txs = await api.getTransactions();
      useStore.getState().setTransactions(txs);
      
      onClose();
    } catch (err) {
      console.error('İşlem kaydedilirken hata:', err);
      const errorMsg = err.response?.data?.message || 'İşlem kaydedilemedi. Lütfen tekrar deneyin.';
      showToast(errorMsg, 'error');
    }
  };

  const handleOverlayClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      onClose();
    }
  };

  const currSymbol = { TRY: '₺', USD: '$', EUR: '€' }[currency] || '₺';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-[#11142D]/20 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div 
            className="bg-white rounded-[32px] w-full max-w-[520px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            ref={panelRef}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex justify-between items-start border-b border-gray-50">
              <div>
                <h2 className="text-[24px] font-extrabold text-[#11142D] tracking-tight">{editId ? '✏️ İşlemi Düzenle' : '✨ Yeni Kayıt'}</h2>
                <p className="text-[13px] font-bold text-gray-400 mt-1">İşlem detaylarını aşağıya girebilirsin.</p>
              </div>
              <button className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto flex-1 scrollbar-hide">
              
              {/* Type Toggle */}
              <div className="flex bg-[#FAFBFC] p-1.5 rounded-2xl mb-8 border border-gray-100 shadow-inner">
                <button 
                  className={`flex-1 py-3.5 text-[12px] font-extrabold rounded-xl transition-all uppercase tracking-widest active:scale-95 ${type === 'EXPENSE' ? 'bg-white text-red-500 shadow-md border border-gray-50' : 'text-gray-400 hover:text-[#11142D]'}`}
                  onClick={() => setType('EXPENSE')}
                >
                  📉 Gider
                </button>
                <button 
                  className={`flex-1 py-3.5 text-[12px] font-extrabold rounded-xl transition-all uppercase tracking-widest active:scale-95 ${type === 'INCOME' ? 'bg-white text-emerald-500 shadow-md border border-gray-50' : 'text-gray-400 hover:text-[#11142D]'}`}
                  onClick={() => setType('INCOME')}
                >
                  📈 Gelir
                </button>

              </div>

              {/* Amount */}
              <div className="mb-8">
                <label className="text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em] block mb-3">TUTAR GİRİN</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <span className={`absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-extrabold ${type === 'EXPENSE' ? 'text-red-500' : type === 'INCOME' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                      {type === 'EXPENSE' ? '-' : type === 'INCOME' ? '+' : ''}{currSymbol}
                    </span>
                    <input 
                      type="number" 
                      placeholder="0,00" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      className={`w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl py-5 pl-[4.5rem] pr-6 text-[28px] font-extrabold outline-none focus:bg-white focus:ring-8 transition-all tracking-tighter ${
                        type === 'EXPENSE' 
                          ? 'text-red-500 focus:border-red-500 focus:ring-red-50/30' 
                          : 'text-emerald-500 focus:border-emerald-500 focus:ring-emerald-50/30'
                      }`} 
                      autoFocus 
                    />
                  </div>
                </div>
              </div>

              {/* Description & Date */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em] block mb-3">AÇIKLAMA</label>
                  <div className="relative">
                    <input type="text" placeholder="Örn: Market Harcaması" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-[#11142D] outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {selectedBrand ? (
                        <BrandIcon 
                          domain={selectedBrand.domain} 
                          brand={selectedBrand.brand} 
                          color={selectedBrand.color}
                          size="w-8 h-8"
                          iconSize="w-5 h-5"
                        />
                      ) : (
                        <button 
                          onClick={() => setShowBrandPicker(true)}
                          className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all border border-gray-100"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em] block mb-3">TARİH</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-[#11142D] outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm" />
                </div>
              </div>

              {/* Brand Picker Popover */}
              <AnimatePresence>
                {showBrandPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-8 p-6 bg-white border border-gray-100 rounded-[32px] shadow-xl relative z-20"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[12px] font-extrabold text-[#11142D] uppercase tracking-widest">Popüler Servisler</h4>
                      <button onClick={() => setShowBrandPicker(false)} className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest">Kapat</button>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {BRAND_LOGOS.map((b, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => { setSelectedBrand(b); setDesc(b.brand); if (b.categoryId) setCatId(b.categoryId); setShowBrandPicker(false); }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${selectedBrand?.brand === b.brand ? 'border-indigo-500 bg-indigo-50' : 'border-gray-50 bg-gray-50 hover:bg-white hover:border-gray-100'}`}
                        >
                          <BrandIcon 
                            domain={b.domain} 
                            brand={b.brand} 
                            color={b.color}
                            size="w-10 h-10"
                            iconSize="w-6 h-6"
                            className="rounded-xl"
                          />
                          <span className="text-[8px] font-extrabold text-gray-500 truncate w-full text-center">{b.brand}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recurring Toggle */}
              {type === 'EXPENSE' && (
                <div className="mb-8 p-6 bg-[#FAFBFC] rounded-[24px] border border-gray-100 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-[14px] font-extrabold text-[#11142D] tracking-tight">Tekrarlanan Ödeme mi?</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Düzenli faturalar için kullan</p>
                    </div>
                    <button 
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`w-12 h-6 rounded-full transition-all relative ${isRecurring ? 'bg-indigo-500 shadow-lg shadow-indigo-100' : 'bg-gray-200'}`}
                    >
                      <motion.div 
                        animate={{ x: isRecurring ? 26 : 2 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isRecurring && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-gray-100">
                          <label className="text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em] block mb-3">TEKRAR FREKANSI</label>
                          <select 
                            value={frequency} 
                            onChange={e => setFrequency(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-[#11142D] outline-none focus:border-indigo-500 transition-all shadow-sm"
                          >
                            <option value="WEEKLY">Her Hafta</option>
                            <option value="MONTHLY">Her Ay</option>
                            <option value="YEARLY">Her Yıl</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Category */}
              <div className="mb-2">
                <label className="text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em] block mb-3">KATEGORİ SEÇİN</label>
                  <div className="grid grid-cols-4 gap-3 max-h-[180px] overflow-y-auto pr-2 scrollbar-hide">
                    {CATEGORIES.filter(c => {
                      if (type === 'EXPENSE') return ['cat1', 'cat2', 'cat8', 'cat10', 'cat11', 'cat4'].includes(c.id);
                      if (type === 'INCOME') return ['cat12', 'cat14', 'cat16', 'cat17'].includes(c.id);
                      return true;
                    }).map(c => (
                      <button key={c.id} onClick={() => setCatId(c.id)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${catId === c.id ? (type === 'EXPENSE' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white') : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                        <span className="text-2xl">{c.icon}</span>
                        <span className={`text-[10px] font-extrabold truncate w-full text-center tracking-tight ${catId === c.id ? 'text-white' : 'text-gray-400'}`}>{c.name}</span>
                      </button>
                    ))}
                  </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-50 flex gap-4 justify-end bg-[#FAFBFC]">
              <button className="px-8 py-4 rounded-2xl text-[13px] font-extrabold text-gray-400 hover:text-[#11142D] transition-colors uppercase tracking-widest" onClick={onClose}>Vazgeç</button>
              <button className="px-10 py-4 rounded-2xl bg-[#11142D] text-white text-[13px] font-extrabold hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 uppercase tracking-widest" onClick={handleSave}>
                {editId ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
