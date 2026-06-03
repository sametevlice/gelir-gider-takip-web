import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore, fmt, getCat, BRAND_LOGOS, detectBrand } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import BrandIcon from '../components/BrandIcon';
import { getPlannedPayments, addPlannedPayment, deletePlannedPayment, addTransaction, getTransactions } from '../services/api';

export default function PaymentsPage() {
  const payments = useStore(state => state.payments);
  const transactions = useStore(state => state.transactions);
  const markAsPaidStore = useStore(state => state.markAsPaid);
  const deletePaymentStore = useStore(state => state.deletePayment);
  const addPaymentStore = useStore(state => state.addPayment);
  const setPayments = useStore(state => state.setPayments);
  const setTransactions = useStore(state => state.setTransactions);
  const showToast = useStore(state => state.showToast);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getPlannedPayments();
        setPayments(data);
      } catch (err) {
        showToast('Planlanmış ödemeler alınamadı', 'error');
      }
    };
    fetchPayments();
  }, [setPayments, showToast]);

  const handleAddPayment = async (data) => {
    try {
      await addPlannedPayment({
        title: data.brand,
        amount: data.amount,
        date: data.date,
        category_id: data.categoryId,
        domain: data.domain,
        color: data.color
      });
      // Veritabanından en güncel haliyle çek ki UUID ve maplenmiş veriler doğru gelsin
      const updatedPayments = await getPlannedPayments();
      setPayments(updatedPayments);
      showToast('Plan başarıyla eklendi', 'success');
    } catch (err) {
      showToast('Plan eklenirken hata oluştu', 'error');
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      await deletePlannedPayment(id);
      deletePaymentStore(id);
      showToast('Plan başarıyla silindi', 'success');
    } catch (err) {
      showToast('Plan silinirken hata oluştu', 'error');
    }
  };

  const handleMarkAsPaid = async (payment) => {
    try {
      await addTransaction({
        type: 'EXPENSE',
        amount: payment.amount,
        description: payment.brand,
        category: payment.categoryId,
        date: payment.instanceDate || new Date().toISOString().split('T')[0]
      });
      // İşlemleri güncellemek için backendden çek
      const newTransactions = await getTransactions();
      setTransactions(newTransactions);
      
      showToast('Ödeme gerçekleşti', 'success');
    } catch (err) {
      showToast('Ödeme kaydedilemedi', 'error');
    }
  };

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [newPaymentDesc, setNewPaymentDesc] = useState('');
  const [newPaymentBrand, setNewPaymentBrand] = useState(null);
  const [showBrandPicker, setShowBrandPicker] = useState(false);

  // Helper to get all instances for a month (including recurring)
  const instancesInMonth = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const instances = [];
    
    payments.forEach(p => {
      const pDate = new Date(p.date);
      
      if (!p.isRecurring) {
        if (pDate >= startDate && pDate <= endDate) {
          instances.push({ ...p, instanceDate: p.date });
        }
      } else {
        const dayOfMonth = pDate.getDate();
        const instanceDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;
        const instanceDate = new Date(instanceDateStr);
        
        if (instanceDate >= startDate && instanceDate <= endDate) {
          instances.push({ ...p, instanceDate: instanceDateStr });
        }
      }
    });
    
    return instances;
  }, [selectedMonth, payments]);

  // Calendar Logic
  const daysInMonth = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];
    
    const days = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push({ day: null, type: 'padding' });
    }
    for (let i = 1; i <= daysCount; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayInstances = instancesInMonth.filter(inst => inst.instanceDate === dateStr);
      
      const processedInstances = dayInstances.map(inst => {
        const isPaid = transactions.some(t => 
          t.description.toLowerCase().includes(inst.brand.toLowerCase()) && 
          t.date === inst.instanceDate &&
          t.type === 'EXPENSE'
        );
        const isOverdue = !isPaid && inst.instanceDate < today;
        return { ...inst, isPaid, isOverdue };
      });

      days.push({ day: i, date: dateStr, instances: processedInstances, type: 'current' });
    }
    return days;
  }, [selectedMonth, instancesInMonth, transactions]);

  const subscriptions = useMemo(() => {
    const subs = [];
    const seen = new Set();
    payments.forEach(p => {
      if (!seen.has(p.brand)) {
        seen.add(p.brand);
        subs.push({
          ...p,
          annualCost: p.amount * 12,
          isUnused: ['Adobe', 'Figma'].includes(p.brand)
        });
      }
    });
    return subs;
  }, [payments]);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-12 gap-8"
      >
        {/* Left Section: Calendar */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-[#11142D] tracking-tight">Ödeme Takvimi</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Gelecek Ödemelerini Planla</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowManualAdd(true)}
                className="px-6 py-3 bg-[#11142D] text-white rounded-2xl font-extrabold text-[12px] uppercase tracking-widest shadow-lg shadow-gray-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                Ödeme Planla
              </button>
              <div className="flex bg-[#FAFBFC] rounded-2xl p-1.5 border border-gray-100 shadow-inner">
                <button onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))} className="px-3 py-2 text-gray-400 hover:text-[#11142D] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg></button>
                <span className="px-4 py-2 text-[13px] font-extrabold text-[#11142D] uppercase tracking-wider min-w-[140px] text-center">
                  {selectedMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))} className="px-3 py-2 text-gray-400 hover:text-[#11142D] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
              <div key={day} className="bg-white p-4 text-center text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em]">
                {day}
              </div>
            ))}
            {daysInMonth.map((dayObj, idx) => {
              return (
                <div 
                  key={idx} 
                  className={`min-h-[140px] bg-white p-3 border-t border-r border-gray-50 relative group transition-colors hover:bg-gray-50/50 ${dayObj.type === 'padding' ? 'bg-[#FAFBFC]/50' : ''}`}
                >
                  {dayObj.day && (
                    <span className={`text-[12px] font-extrabold transition-colors text-gray-400 group-hover:text-[#11142D]`}>
                      {dayObj.day}
                    </span>
                  )}
                  
                  <div className="mt-2 flex flex-col gap-1.5">
                    {dayObj.instances?.map(inst => (
                      <div 
                        key={inst.id + inst.instanceDate}
                        onClick={() => setSelectedPayment(inst)}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all relative ${
                          inst.isPaid 
                            ? 'bg-emerald-50 border-emerald-100 opacity-60' 
                            : inst.isOverdue 
                              ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-100' 
                              : 'bg-indigo-50 border-indigo-100'
                        }`}
                      >
                         <div className="shrink-0">
                           <BrandIcon 
                             domain={inst.domain} 
                             brand={inst.brand} 
                             color={inst.color} 
                             size="w-8 h-8" 
                             iconSize="w-5 h-5"
                             className="rounded-xl"
                           />
                           {inst.isOverdue && !inst.isPaid && (
                             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold animate-pulse">!</div>
                           )}
                           {inst.isPaid && (
                             <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">✓</div>
                           )}
                         </div>
                        <div className="flex-1 min-width-0">
                          <p className={`text-[9px] font-extrabold truncate uppercase tracking-tighter ${inst.isPaid ? 'line-through text-emerald-700' : inst.isOverdue ? 'text-orange-700' : 'text-indigo-700'}`}>{inst.brand}</p>
                          <p className="text-[10px] font-bold text-gray-500">{fmt(inst.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Subs */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 flex flex-col">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-extrabold text-[#11142D] tracking-tight">Abonelik Yönetimi</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Yıllık Gider Analizi</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100">💳</div>
            </div>
            
            <div className="space-y-4">
              {subscriptions.map(sub => (
                 <div key={sub.id} className="p-4 bg-[#FAFBFC] rounded-[24px] border border-gray-50 flex items-center gap-4 group hover:bg-white hover:border-indigo-100 transition-all cursor-pointer">
                   <BrandIcon 
                     domain={sub.domain} 
                     brand={sub.brand} 
                     color={sub.color}
                     size="w-12 h-12"
                     iconSize="w-7 h-7"
                     className="rounded-2xl group-hover:scale-110 transition-transform"
                   />
                   <div className="flex-1">
                     <div className="flex items-center gap-2">
                       <p className="text-[14px] font-extrabold text-[#11142D]">{sub.brand}</p>
                       {sub.isUnused && (
                         <span className="text-[8px] font-extrabold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-orange-100">Düşük Kullanım</span>
                       )}
                     </div>
                     <p className="text-[11px] font-bold text-gray-400 mt-0.5">Yıllık: <span className="text-indigo-500">{fmt(sub.annualCost)}</span></p>
                   </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeletePayment(sub.id); }}
                    className="w-8 h-8 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-red-500 transition-colors shadow-sm flex items-center justify-center active:scale-90"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-indigo-50 rounded-[32px] border border-indigo-100 relative overflow-hidden">
               <div className="flex gap-3 relative z-10">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest mb-1">Akıllı İpucu</p>
                    <p className="text-[12px] font-bold text-gray-600 leading-relaxed">
                      Aboneliklerini yıllık plana taşıyarak ortalama ₺1.200 tasarruf edebilirsin.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals using Portals to escape parent transforms */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showManualAdd && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowManualAdd(false)} 
                className="absolute inset-0 bg-[#11142D]/40 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 p-8"
              >
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-2xl font-extrabold text-[#11142D] tracking-tight">Yeni Ödeme Planla</h3>
                   <button onClick={() => setShowManualAdd(false)} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                   </button>
                 </div>

                 <div className="space-y-6">
                   <div>
                     <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">AÇIKLAMA</label>
                     <div className="relative">
                      <input 
                        id="pDesc" 
                        type="text" 
                        placeholder="Örn: Netflix" 
                        value={newPaymentDesc}
                        onChange={(e) => setNewPaymentDesc(e.target.value)}
                        className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-[#11142D] outline-none focus:border-indigo-500 transition-all" 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {newPaymentBrand ? (
                          <BrandIcon 
                            domain={newPaymentBrand.domain} 
                            brand={newPaymentBrand.brand} 
                            color={newPaymentBrand.color}
                            size="w-8 h-8"
                            iconSize="w-5 h-5"
                          />
                        ) : (
                          <button 
                            onClick={() => setShowBrandPicker(!showBrandPicker)}
                            className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all border border-gray-100"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                          </button>
                        )}
                      </div>
                     </div>
                   </div>

                   {/* Brand Picker Popover */}
                   <AnimatePresence>
                     {showBrandPicker && (
                       <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                       >
                         <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-4 gap-2">
                           {BRAND_LOGOS.map((b, idx) => (
                             <button 
                              key={idx}
                              onClick={() => { setNewPaymentBrand(b); setNewPaymentDesc(b.brand); setShowBrandPicker(false); }}
                              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white transition-all group"
                             >
                                <BrandIcon 
                                  domain={b.domain} 
                                  brand={b.brand} 
                                  color={b.color}
                                  size="w-8 h-8"
                                  iconSize="w-5 h-5"
                                  className="rounded-lg"
                                />
                                <span className="text-[7px] font-bold text-gray-400 group-hover:text-[#11142D] truncate w-full text-center">{b.brand}</span>
                             </button>
                           ))}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">TUTAR (₺)</label>
                       <input id="pAmt" type="number" placeholder="0" className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-[#11142D] outline-none focus:border-indigo-500 transition-all" />
                     </div>
                     <div>
                       <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">TARİH</label>
                       <input id="pDate" type="date" className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-[#11142D] outline-none focus:border-indigo-500 transition-all" />
                     </div>
                   </div>
                   <button 
                     onClick={() => {
                       const brand = newPaymentDesc;
                       const amount = parseFloat(document.getElementById('pAmt').value);
                       const date = document.getElementById('pDate').value;
                       if (!brand || !amount || !date) return;
                       handleAddPayment({ 
                         brand, 
                         amount, 
                         date, 
                         categoryId: newPaymentBrand?.categoryId || 'cat15', 
                         domain: newPaymentBrand?.domain || 'generic', 
                         color: newPaymentBrand?.color || 'bg-indigo-50 border-indigo-100' 
                       });
                       setShowManualAdd(false);
                       setNewPaymentDesc('');
                       setNewPaymentBrand(null);
                     }}
                     className="w-full py-4 bg-[#11142D] text-white rounded-2xl font-extrabold text-[13px] uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all mt-4"
                   >
                     Planı Kaydet
                   </button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedPayment && (
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setSelectedPayment(null)} 
                className="absolute inset-0 bg-[#11142D]/40 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
              >
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all z-10"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>

                 <div className="p-8 border-b border-gray-50 flex flex-col items-center text-center bg-[#FAFBFC]">
                   <BrandIcon 
                     domain={selectedPayment.domain} 
                     brand={selectedPayment.brand} 
                     color={selectedPayment.color}
                     size="w-20 h-20"
                     iconSize="w-12 h-12"
                     className="rounded-3xl mb-6 shadow-lg"
                   />
                   <h3 className="text-2xl font-extrabold text-[#11142D] tracking-tight">{selectedPayment.brand}</h3>
                   <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                     {selectedPayment.isRecurring ? `${selectedPayment.frequency} Tekrarlanan` : 'Tek Seferlik'} Ödeme
                   </p>
                 </div>
                
                <div className="p-8 space-y-6 text-center">
                  <div className="text-4xl font-extrabold text-[#11142D] tracking-tighter">
                    {fmt(selectedPayment.amount)}
                  </div>
                  <p className={`text-[11px] font-extrabold py-2 px-4 rounded-full inline-block border uppercase tracking-widest ${selectedPayment.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'}`}>
                    {selectedPayment.isPaid ? 'ÖDENDİ' : `PLANLANAN: ${new Date(selectedPayment.instanceDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`}
                  </p>
                  
                  {!selectedPayment.isPaid && (
                    <div className="grid grid-cols-1 gap-3 pt-4">
                      <button 
                        onClick={() => { handleMarkAsPaid(selectedPayment); setSelectedPayment(null); }}
                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-extrabold text-[13px] uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95"
                      >
                        Ödeme Gerçekleşti
                      </button>
                      <button 
                        onClick={() => { handleDeletePayment(selectedPayment.id); setSelectedPayment(null); }}
                        className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-extrabold text-[13px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all active:scale-95"
                      >
                        Planı İptal Et
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-6 bg-gray-50 text-center">
                  <button onClick={() => setSelectedPayment(null)} className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.2em] hover:text-[#11142D] transition-colors">Vazgeç</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
