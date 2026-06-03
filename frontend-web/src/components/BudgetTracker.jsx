import { useState } from 'react';
import { useStore, getCat, fmt, CATEGORIES } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function BudgetTracker() {
  const transactions = useStore(state => state.transactions);
  const user = useStore(state => state.user);
  const budgetLimits = useStore(state => state.budgetLimits);
  const updateBudgetLimit = useStore(state => state.updateBudgetLimit);

  const [editingCatId, setEditingCatId] = useState(null);
  const [tempLimit, setTempLimit] = useState('');

  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  const getMonthOptions = () => {
    const opts = [];
    for(let i=-3; i<1; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      opts.push(d);
    }
    return opts;
  };

  const catSpend = {};
  transactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date).getMonth() === month && new Date(t.date).getFullYear() === year)
    .forEach(t => {
      const cid = t.categoryId || 'cat15';
      catSpend[cid] = (catSpend[cid] || 0) + t.amount;
    });

  const budgetItems = CATEGORIES
    .filter(c => c.id !== 'cat15') // Exclude 'Other' for cleaner look
    .map((cat) => {
      const catId = cat.id;
      const limit = budgetLimits[catId] || 0;
      const spent = catSpend[catId] || 0;
      const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
      return { catId, limit, spent, pct, cat };
    })
    .sort((a, b) => b.limit - a.limit || b.spent - a.spent);

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[17px] font-extrabold text-[#11142D] mb-0.5 tracking-tight">Kategori Bütçeleri</h3>
          <p className="text-[11px] text-gray-400 font-semibold">Harcama limitlerini takip et</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="bg-[#FAFBFC] border border-gray-100 rounded-full px-4 py-2 text-[10px] font-extrabold text-[#11142D] tracking-widest uppercase shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            {selectedDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className={`transition-transform ${showDatePicker ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
          </button>

          <AnimatePresence>
            {showDatePicker && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-50 p-2 z-50 overflow-hidden"
              >
                {getMonthOptions().map(d => {
                  const label = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                  const isActive = d.getMonth() === month && d.getFullYear() === year;
                  return (
                    <button 
                      key={label} 
                      onClick={() => { setSelectedDate(d); setShowDatePicker(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-extrabold transition-all uppercase tracking-wider ${isActive ? 'bg-[#11142D] text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {budgetItems.map(({ catId, limit, spent, pct, cat }) => {
          const isDanger = pct >= 90;
          const isWarning = pct >= 70 && pct < 90;
          const barColor = isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-indigo-600';
          const textColor = isDanger ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-[#11142D]';

          return (
            <div key={catId} className="flex flex-col gap-2 group">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FAFBFC] border border-gray-100 flex items-center justify-center text-sm">{cat.icon}</div>
                  <span className="text-[13px] font-extrabold text-[#11142D] tracking-tight">{cat.name}</span>
                </div>
                <div className="text-[12px] font-bold text-gray-400 flex items-center gap-1">
                  <span className={`font-extrabold ${textColor}`}>{fmt(spent)}</span>
                  <span>/</span>
                  {editingCatId === catId ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" autoFocus 
                        className="w-[60px] bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-[11px] font-extrabold outline-none"
                        value={tempLimit} onChange={e => setTempLimit(e.target.value)}
                        onBlur={() => { updateBudgetLimit(catId, parseFloat(tempLimit) || 0); setEditingCatId(null); }}
                        onKeyDown={e => { if(e.key === 'Enter') { updateBudgetLimit(catId, parseFloat(tempLimit) || 0); setEditingCatId(null); } }}
                      />
                    </div>
                  ) : (
                    <span 
                      className="cursor-pointer hover:text-indigo-500 hover:underline decoration-dotted transition-colors"
                      onClick={() => { setEditingCatId(catId); setTempLimit(limit); }}
                      title="Limiti Düzenle"
                    >
                      {fmt(limit)}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2.5 w-full bg-[#FAFBFC] rounded-full overflow-hidden border border-gray-100/50 relative">
                <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${pct}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
