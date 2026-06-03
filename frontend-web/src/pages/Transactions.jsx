import { useState, useMemo } from 'react';
import { useStore, getCat, fmt, fmtDate } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Transactions({ setModalOpen, setEditId }) {
  const transactions = useStore(state => state.transactions);
  const deleteTransaction = useStore(state => state.deleteTransaction);
  
  const [filter, setFilter] = useState('ALL'); // ALL, INCOME, EXPENSE
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const month = selectedMonth.getMonth();
  const year = selectedMonth.getFullYear();

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        // Date filter
        const d = new Date(t.date);
        if (d.getMonth() !== month || d.getFullYear() !== year) return false;

        // Tab filter
        if (filter === 'INCOME') return t.type === 'INCOME';
        if (filter === 'EXPENSE') return t.type === 'EXPENSE';
        return true;
      })
      .filter(t => {
        const term = search.toLowerCase();
        return t.description.toLowerCase().includes(term) || getCat(t.categoryId).name.toLowerCase().includes(term);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filter, search, month, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const displayed = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const [openMenuId, setOpenMenuId] = useState(null);

  const getMonthOptions = () => {
    const opts = [];
    const now = new Date();
    for(let i=-6; i<6; i++) {
      opts.push(new Date(now.getFullYear(), now.getMonth() + i, 1));
    }
    return opts;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10 flex flex-col h-full">
      
      <div className="mb-8">
        <h1 className="text-[32px] font-extrabold text-[#11142D] mb-1 tracking-tight">İşlem Geçmişi</h1>
        <p className="text-sm text-gray-400 font-bold tracking-tight">Tüm finansal hareketlerini detaylı olarak incele ve yönet.</p>
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 flex flex-col flex-1">
        
        {/* Controls */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
          
          <div className="flex items-center bg-[#FAFBFC] rounded-full p-1.5 border border-gray-100 shadow-inner">
            {[
              { id: 'ALL', label: 'Tümü' },
              { id: 'INCOME', label: 'Gelir' },
              { id: 'EXPENSE', label: 'Gider' },
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => { setFilter(f.id); setPage(1); }}
                className={`px-8 py-3 rounded-full text-[12px] font-extrabold transition-all uppercase tracking-widest ${filter === f.id ? 'bg-[#11142D] text-white shadow-lg' : 'text-gray-400 hover:text-[#11142D]'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-[320px]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="İşlemlerde ara..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-12 pr-6 py-4 bg-[#FAFBFC] border border-gray-100 rounded-full text-[13px] font-bold outline-none focus:border-indigo-300 focus:bg-white text-gray-600 shadow-sm transition-all" 
              />
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center gap-3 px-6 py-4 bg-[#FAFBFC] rounded-full border border-gray-100 text-[12px] font-extrabold text-gray-500 hover:bg-gray-100 transition-all shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span className="uppercase tracking-widest">{selectedMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-300 ${showMonthPicker ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
              </button>

              <AnimatePresence>
                {showMonthPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-[32px] shadow-2xl border border-gray-50 p-3 z-[100] overflow-hidden"
                  >
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                      {getMonthOptions().map(d => {
                        const label = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                        const isActive = d.getMonth() === month && d.getFullYear() === year;
                        return (
                          <button 
                            key={label} 
                            onClick={() => { setSelectedMonth(d); setShowMonthPicker(false); setPage(1); }} 
                            className={`w-full text-left px-5 py-3.5 rounded-2xl text-[12px] font-extrabold transition-all uppercase tracking-widest ${isActive ? 'bg-[#11142D] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#FAFBFC] rounded-2xl overflow-hidden">
                <th className="py-5 px-6 font-extrabold text-[11px] text-gray-400 uppercase tracking-widest rounded-l-2xl">İŞLEM / KATEGORİ</th>
                <th className="py-5 px-6 font-extrabold text-[11px] text-gray-400 uppercase tracking-widest">TARİH</th>
                <th className="py-5 px-6 font-extrabold text-[11px] text-gray-400 uppercase tracking-widest">DURUM</th>
                <th className="py-5 px-6 font-extrabold text-[11px] text-gray-400 uppercase tracking-widest text-right">MİKTAR</th>
                <th className="py-5 px-6 font-extrabold text-[11px] text-gray-400 uppercase tracking-widest rounded-r-2xl text-center w-24">AKSİYON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!displayed.length ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50">🔍</div>
                      <p className="text-gray-400 font-extrabold text-sm uppercase tracking-widest">İşlem bulunamadı</p>
                    </div>
                  </td>
                </tr>
              ) : displayed.map((t, i) => {
                const cat = getCat(t.categoryId);
                const isIncome = t.type === 'INCOME';
                
                return (
                  <motion.tr 
                    key={t.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.03 }}
                    className="group hover:bg-[#FAFBFC]/60 transition-colors"
                  >
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[18px] flex items-center justify-center text-[22px] shadow-sm border border-white" style={{ backgroundColor: cat.color + '15', color: cat.color }}>
                          {cat.icon}
                        </div>
                        <div>
                          <div className="text-[15px] font-extrabold text-[#11142D] leading-tight mb-1">{t.description}</div>
                          <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{cat.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="text-[13px] font-bold text-[#11142D] mb-1">{fmtDate(t.date)}</div>
                      <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Tamamlandı</div>
                    </td>
                    <td className="py-6 px-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                        isIncome ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        'bg-gray-50 text-gray-500 border border-gray-100'
                      }`}>
                        {isIncome ? 'Gelir' : 'Gider'}
                      </span>
                    </td>
                    <td className="py-6 px-6 text-right">
                      <div className={`text-[18px] font-extrabold tracking-tighter ${
                        isIncome ? 'text-emerald-500' : 
                        'text-[#11142D]'
                      }`}>
                        {isIncome ? '+' : '-'}{fmt(t.amount)}
                      </div>
                    </td>
                    <td className="py-6 px-6 text-center relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-white hover:text-[#11142D] transition-all shadow-sm border border-transparent hover:border-gray-100 active:scale-90 mx-auto"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                      </button>
                      
                      <AnimatePresence>
                        {openMenuId === t.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-16 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2.5 w-40 z-[100] flex flex-col gap-1"
                          >
                            <button onClick={() => { setEditId(t.id); setModalOpen(true); setOpenMenuId(null); }} className="w-full text-left px-5 py-3 text-[12px] font-extrabold text-[#11142D] hover:bg-gray-50 rounded-2xl transition-colors uppercase tracking-widest">Düzenle</button>
                            <div className="w-full h-px bg-gray-50"></div>
                            <button onClick={() => { deleteTransaction(t.id); setOpenMenuId(null); }} className="w-full text-left px-5 py-3 text-[12px] font-extrabold text-red-500 hover:bg-red-50 rounded-2xl transition-colors uppercase tracking-widest">Sil</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-8 border-t border-gray-50 gap-6">
          <p className="text-[12px] font-extrabold text-gray-400 uppercase tracking-widest">
            <span className="text-[#11142D]">{filtered.length}</span> İŞLEMDEN <span className="text-[#11142D]">{displayed.length}</span> TANESİ GÖSTERİLİYOR
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }}
              disabled={page === 1}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 text-gray-500 hover:bg-[#11142D] hover:text-white hover:border-[#11142D] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-100 transition-all shadow-sm active:scale-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                .map((p, i, arr) => {
                  const isGap = i > 0 && p !== arr[i-1] + 1;
                  return (
                    <div key={p} className="flex items-center gap-2">
                      {isGap && <span className="text-gray-300 font-bold">...</span>}
                      <button 
                        onClick={() => { setPage(p); window.scrollTo(0,0); }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[13px] font-extrabold transition-all active:scale-90 ${page === p ? 'bg-[#4318FF] text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:bg-gray-50 border border-transparent hover:border-gray-100'}`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button 
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }}
              disabled={page === totalPages}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 text-gray-500 hover:bg-[#11142D] hover:text-white hover:border-[#11142D] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-100 transition-all shadow-sm active:scale-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
