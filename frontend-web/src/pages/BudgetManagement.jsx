import { useState, useMemo } from 'react';
import { useStore, getCat, fmt, CATEGORIES } from '../store/useStore';
import BudgetTracker from '../components/BudgetTracker';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Target, PiggyBank, TrendingDown, BarChart3 } from 'lucide-react';



export default function BudgetManagement() {
  const user = useStore(state => state.user);
  const showToast = useStore(state => state.showToast);
  const transactions = useStore(state => state.transactions);
  const goals = useStore(state => state.goals);
  const addToGoal = useStore(state => state.addToGoal);
  const addGoal = useStore(state => state.addGoal);
  const deleteGoal = useStore(state => state.deleteGoal);
  const updateGoal = useStore(state => state.updateGoal);
  const transferBetweenGoals = useStore(state => state.transferBetweenGoals);
  const totalBudget = useStore(state => state.totalBudget);
  const setTotalBudget = useStore(state => state.setTotalBudget);
  
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', icon: '🎯' });

  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transfer, setTransfer] = useState({ fromId: '', toId: '', amount: '' });

  const [editingTargetId, setEditingTargetId] = useState(null);
  const [newTargetValue, setNewTargetValue] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(0);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  
  const [period, setPeriod] = useState('12 Months');
  const [selectedCat, setSelectedCat] = useState('all');

  const chartData = useMemo(() => {
    let expenses = transactions.filter(t => t.type === 'EXPENSE');
    if (selectedCat !== 'all') {
      expenses = expenses.filter(t => t.categoryId === selectedCat);
    }
    const now = new Date();
    
    if (period === '7 Days') {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('tr-TR', { weekday: 'short' });
        const daySum = expenses
          .filter(t => t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);
        data.push({ name: dayLabel.toUpperCase(), value: daySum / 1000 });
      }
      return data;
    } else if (period === '30 Days') {
      const data = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.getDate().toString();
        const daySum = expenses
          .filter(t => t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);
        data.push({ name: dayLabel, value: daySum / 1000 });
      }
      return data;
    } else {
      // 12 Months
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DES'];
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        const monthSum = expenses
          .filter(t => {
            const td = new Date(t.date);
            return td.getMonth() === m && td.getFullYear() === y;
          })
          .reduce((sum, t) => sum + t.amount, 0);
        data.push({ name: months[m], value: monthSum / 1000 });
      }
      return data;
    }
  }, [transactions, period, selectedCat]);
  const thisMonthExpense = transactions.filter(t => { const d = new Date(t.date); return t.type === 'EXPENSE' && d.getMonth() === month && d.getFullYear() === year; }).reduce((s, t) => s + t.amount, 0);
  const budgetUsedPct = totalBudget > 0 ? Math.min((thisMonthExpense / totalBudget) * 100, 100) : 0;
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

  // addToGoal is now from useStore
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#11142D] mb-1 tracking-tight">Bütçe & Hedefler</h1>
          <p className="text-sm text-gray-400 font-bold tracking-tight">Harcama limitlerini ve birikim hedeflerini takip et.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-gray-200/80 transition-all duration-300 min-h-[105px]">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
            <BarChart3 size={20} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1.5">
              <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Aylık Bütçe</div>
              <span className={`text-[10px] font-extrabold ${budgetUsedPct > 90 ? 'text-red-500' : 'text-indigo-600'}`}>%{budgetUsedPct.toFixed(0)} kullanıldı</span>
            </div>
            {totalBudget === 0 && !isEditingBudget ? (
              <button 
                onClick={() => { setTempBudget(0); setIsEditingBudget(true); }}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-extrabold uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Bütçe Belirle
              </button>
            ) : isEditingBudget ? (
              <div className="flex items-center gap-2 mb-1.5">
                <input 
                  type="number" autoFocus 
                  className="w-[100px] bg-gray-50 border border-indigo-100 rounded-lg px-2 py-1 text-[15px] font-extrabold outline-none focus:ring-2 focus:ring-indigo-100"
                  value={tempBudget} onChange={e => setTempBudget(e.target.value)}
                  onBlur={() => { setTotalBudget(parseFloat(tempBudget) || 0); setIsEditingBudget(false); }}
                  onKeyDown={e => { if(e.key === 'Enter') { setTotalBudget(parseFloat(tempBudget) || 0); setIsEditingBudget(false); } }}
                />
                <button className="text-emerald-600 font-bold" onClick={() => { setTotalBudget(parseFloat(tempBudget) || 0); setIsEditingBudget(false); }}>✓</button>
              </div>
            ) : (
              <div 
                className="text-[20px] font-extrabold tracking-tight text-[#11142D] mb-1.5 cursor-pointer hover:text-indigo-600 transition-colors group flex items-center gap-2"
                onClick={() => { setTempBudget(totalBudget); setIsEditingBudget(true); }}
              >
                {fmt(totalBudget)}
                <svg className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
            )}
            <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
              <motion.div initial={{ width: 0 }} animate={{ width: `${budgetUsedPct}%` }} transition={{ duration: 1.5, type: 'spring' }} className={`h-full rounded-full ${budgetUsedPct > 90 ? 'bg-red-500' : 'bg-indigo-600'}`}></motion.div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-gray-200/80 transition-all duration-300 min-h-[105px]">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
            <Target size={20} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Toplam Birikim</div>
            <div className="text-[20px] font-extrabold tracking-tight text-emerald-600 mb-1">{fmt(totalSaved)}</div>
            <div className="text-[10px] text-gray-400 font-medium">{goals.length} aktif birikim hedefi</div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-gray-200/80 transition-all duration-300 min-h-[105px]">
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm flex-shrink-0">
            <TrendingDown size={20} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Bu Ayki Gider</div>
            <div className="text-[20px] font-extrabold tracking-tight text-red-500 mb-1">{fmt(thisMonthExpense)}</div>
            <div className="text-[10px] text-gray-400 font-medium">Bu ayki toplam harcama</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <BudgetTracker />
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col h-full">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-[18px] font-extrabold text-[#11142D] tracking-tight">Birikim Hedefleri</h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Finansal Hedeflerin</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowTransferForm(!showTransferForm)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${showTransferForm ? 'bg-[#4318FF] text-white shadow-[#4318FF]/20' : 'bg-white border border-gray-100 text-[#11142D] hover:bg-gray-50 shadow-gray-100'}`}
                  title="Hedefler Arası Aktar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 17H4M4 17L8 13M4 17L8 21M4 7H20M20 7L16 3M20 7L16 11" />
                  </svg>
                </button>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 font-bold text-xl ${showAddForm ? 'bg-red-500 text-white' : 'bg-[#11142D] text-white hover:scale-110 shadow-gray-200'}`}
                >
                  {showAddForm ? '×' : '+'}
                </button>
              </div>
            </div>

            {showAddForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 bg-indigo-50/50 rounded-[24px] border border-indigo-100">
                <h4 className="text-[13px] font-extrabold text-indigo-900 mb-4 uppercase tracking-widest">Yeni Hedef Ekle</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input 
                      type="text" placeholder="Hedef Adı (Örn: Tatil)" 
                      className="flex-1 bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none focus:ring-2 focus:ring-indigo-200"
                      value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="İkon" 
                      className="w-14 bg-white border border-indigo-100 rounded-xl px-2 py-2.5 text-center text-xl outline-none focus:ring-2 focus:ring-indigo-200"
                      value={newGoal.icon} onChange={e => setNewGoal({...newGoal, icon: e.target.value})}
                    />
                  </div>
                  <input 
                    type="number" placeholder="Hedef Tutar (₺)" 
                    className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none focus:ring-2 focus:ring-indigo-200"
                    value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})}
                  />
                  <button 
                    onClick={() => {
                      if(!newGoal.name || !newGoal.target) return;
                      addGoal({
                        ...newGoal,
                        target: parseFloat(newGoal.target),
                        saved: 0,
                        color: 'bg-indigo-500',
                        bar: 'bg-indigo-500',
                        bg: 'bg-indigo-50'
                      });
                      setShowAddForm(false);
                      setNewGoal({ name: '', target: '', icon: '🎯' });
                    }}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[12px] font-extrabold uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    HEDEF OLUŞTUR
                  </button>
                </div>
              </motion.div>
            )}

            {showTransferForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 bg-emerald-50/50 rounded-[24px] border border-emerald-100">
                <h4 className="text-[13px] font-extrabold text-emerald-900 mb-4 uppercase tracking-widest">Hedefer Arası Aktar</h4>
                <div className="space-y-3">
                  <select 
                    className="w-full bg-white border border-emerald-100 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={transfer.fromId} onChange={e => setTransfer({...transfer, fromId: e.target.value})}
                  >
                    <option value="">Nereden?</option>
                    {goals.map(g => <option key={g.id} value={g.id}>{g.name} ({fmt(g.saved)})</option>)}
                  </select>
                  <select 
                    className="w-full bg-white border border-emerald-100 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={transfer.toId} onChange={e => setTransfer({...transfer, toId: e.target.value})}
                  >
                    <option value="">Nereye?</option>
                    {goals.map(g => g.id !== transfer.fromId && <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <input 
                    type="number" placeholder="Aktarılacak Tutar (₺)" 
                    className="w-full bg-white border border-emerald-100 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={transfer.amount} onChange={e => setTransfer({...transfer, amount: e.target.value})}
                  />
                  <button 
                    onClick={() => {
                      if(!transfer.fromId || !transfer.toId || !transfer.amount) return;
                      transferBetweenGoals(transfer.fromId, transfer.toId, parseFloat(transfer.amount));
                      setShowTransferForm(false);
                      setTransfer({ fromId: '', toId: '', amount: '' });
                    }}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[12px] font-extrabold uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    AKTARIYI TAMAMLA
                  </button>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="py-10 text-center bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                  <Target size={32} className="text-gray-300 mb-4 stroke-[1.5] mx-auto opacity-50" />
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">Henüz bir hedefiniz yok</p>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest hover:underline"
                  >
                    İLK HEDEFİNİ EKLE
                  </button>
                </div>
              ) : (
                goals.map((g, i) => {
                  const pct = Math.min((g.saved / g.target) * 100, 100);
                  const isComplete = g.saved >= g.target;
                  return (
                    <motion.div 
                      key={g.id} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`p-5 rounded-[24px] transition-all border ${isComplete ? 'bg-emerald-50 border-emerald-100/50 shadow-inner' : 'bg-white border-gray-50 shadow-sm hover:shadow-md'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4 group">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${g.bg} border border-white shadow-sm transition-transform group-hover:rotate-6`}>{g.icon}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-[14px] font-extrabold text-[#11142D] tracking-tight">{g.name}</div>
                              <button onClick={() => deleteGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-[10px] text-red-400 hover:text-red-600 transition-all">Sil</button>
                            </div>
                            {editingTargetId === g.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                 <input 
                                    type="number" autoFocus 
                                    className="w-[80px] bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-[11px] font-extrabold outline-none"
                                    value={newTargetValue} onChange={e => setNewTargetValue(e.target.value)}
                                    onKeyDown={e => { if(e.key === 'Enter') { updateGoal(g.id, { target: parseFloat(newTargetValue) }); setEditingTargetId(null); } }}
                                 />
                                 <button onClick={() => { updateGoal(g.id, { target: parseFloat(newTargetValue) }); setEditingTargetId(null); }} className="text-emerald-500 text-[10px] font-bold">✓</button>
                              </div>
                            ) : (
                              <div className="text-[11px] font-bold text-gray-400 mt-0.5 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => { setEditingTargetId(g.id); setNewTargetValue(g.target); }}>
                                {fmt(g.saved)} / <span className="underline decoration-dotted">{fmt(g.target)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {!isComplete ? (
                          activeGoalId === g.id ? (
                            <div className="flex items-center gap-2">
                              <input type="number" autoFocus placeholder="Tutar" value={addAmount} onChange={e => setAddAmount(e.target.value)} className="w-[70px] bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[11px] font-extrabold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                              <button className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-600 transition-all active:scale-90" onClick={() => { addToGoal(g.id, parseFloat(addAmount) || 0); setActiveGoalId(null); setAddAmount(''); }}>✓</button>
                              <button className="w-8 h-8 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200 transition-all active:scale-90" onClick={() => setActiveGoalId(null)}>✕</button>
                            </div>
                          ) : (
                            <button className="text-[10px] font-extrabold bg-[#11142D] text-white px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-md active:scale-95 uppercase tracking-widest" onClick={() => { setActiveGoalId(g.id); setAddAmount(''); }}>
                              EKLE
                            </button>
                          )
                        ) : (
                          <div className="text-[10px] font-extrabold text-emerald-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-emerald-100 uppercase tracking-widest">Tamamlandı 🎉</div>
                        )}
                      </div>
                      <div className="h-2 w-full bg-gray-100/50 rounded-full overflow-hidden border border-gray-200/20">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, type: 'spring' }} className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : g.bar}`}></motion.div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                         <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{isComplete ? 'Hedef Başarıldı' : 'İlerleme'}</span>
                         <span className="text-[10px] font-extrabold text-[#11142D]">%{pct.toFixed(1)}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Main Chart Section */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col h-full">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[19px] font-extrabold text-[#11142D] tracking-tight">Harcama Analizi</h3>
                <p className="text-[12px] text-gray-400 font-bold mt-1">
                  {period === '12 Months' ? 'Yıllık harcama trendlerin.' : 
                   period === '30 Days' ? 'Son 30 günlük harcamaların.' : 
                   'Son 1 haftalık harcamaların.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {['12 Months', '30 Days', '7 Days'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-full text-[11px] font-extrabold transition-all ${period === p ? 'bg-[#11142D] text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {p === '12 Months' ? '12 Ay' : p === '30 Days' ? '30 Gün' : '7 Gün'}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar -mx-2 px-2">
              <button 
                onClick={() => setSelectedCat('all')}
                className={`px-4 py-2 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all border ${selectedCat === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
              >
                HEPSİ
              </button>
              {CATEGORIES.filter(c => transactions.some(t => t.categoryId === c.id)).map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all border flex items-center gap-2 ${selectedCat === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                >
                  <span>{cat.icon}</span>
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex-1 w-full min-h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4318FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }} tickFormatter={v => `₺${v}K`} />
                    <Tooltip content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#11142D] text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                              <p className="text-[10px] font-extrabold text-gray-400 mb-1 uppercase tracking-widest">{label} HARCAMASI</p>
                              <p className="text-[18px] font-extrabold">₺{payload[0].value}K</p>
                            </div>
                          );
                        }
                        return null;
                    }} />
                    <Area type="monotone" dataKey="value" stroke="#4318FF" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4, fill: '#4318FF' }} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
