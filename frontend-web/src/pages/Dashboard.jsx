import { useState, useMemo, useEffect } from 'react';
import { useStore, getCat, fmt, fmtDate, detectBrand } from '../store/useStore';
import * as api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import UpcomingPayments from '../components/UpcomingPayments';
import BrandIcon from '../components/BrandIcon';
import { Target, Settings, PiggyBank, BarChart3, FolderOpen, Sparkles, Send, RefreshCw } from 'lucide-react';

export default function Dashboard({ setModalOpen, setEditId, setActivePage }) {
  const user = useStore(state => state.user);
  const transactions = useStore(state => state.transactions);
  const setTransactions = useStore(state => state.setTransactions);
  const payments = useStore(state => state.payments);
  const markAsPaid = useStore(state => state.markAsPaid);
  const deleteTransaction = useStore(state => state.deleteTransaction);
  const totalBudget = useStore(state => state.totalBudget);
  const setTotalBudget = useStore(state => state.setTotalBudget);

  const now = new Date();
  
  // Local States
  const [selectedDate, setSelectedDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  const [tab, setTab] = useState('PAST'); // PAST, PLANNED
  const [searchTerm, setSearchTerm] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showBudgetPlan, setShowBudgetPlan] = useState(false);
  const [showIncomeDetails, setShowIncomeDetails] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePickerTop, setShowDatePickerTop] = useState(false);
  
  const [aiData, setAiData] = useState({ score: null, note: "Sizin için en iyi finansal tavsiyeyi hazırlıyorum..." });
  const [isLoadingAi, setIsLoadingAi] = useState(true);

  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleAskAssistant = async (question) => {
    if (!question.trim()) return;
    setChatInput('');
    setIsChatLoading(true);
    setChatResponse('');
    try {
      const res = await api.askAiAssistant(transactions, question);
      if (res && res.success && res.data && res.data.answer) {
        setChatResponse(res.data.answer);
      } else {
        setChatResponse("Üzgünüm, bir hata oluştu.");
      }
    } catch (err) {
      setChatResponse("Asistan ile bağlantı kurulamadı.");
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const txs = await api.getTransactions();
        setTransactions(txs);
        
        try {
          setIsLoadingAi(true);
          const aiRes = await api.getAiHealthCache();
          if (aiRes && aiRes.success && aiRes.data && aiRes.data.note) {
            setAiData({ score: aiRes.data.score, note: aiRes.data.note });
          } else {
            setAiData({ score: null, note: "Henüz bir analiz bulunmuyor. 'Yenile' butonuna tıklayarak ilk değerlendirmeni alabilirsin." });
          }
        } catch (aiErr) {
          console.error('AI Cache Hatası:', aiErr);
          setAiData({ score: null, note: "Şu an AI analiz servisine ulaşılamıyor." });
        } finally {
          setIsLoadingAi(false);
        }

      } catch (err) {
        console.error('Veri çekme hatası:', err);
      }
    };
    fetchData();
  }, []);

  const handleRefreshAi = async () => {
    setIsLoadingAi(true);
    setAiData({ score: null, note: "Sizin için yeni verilerle analiz yapıyorum..." });
    try {
      const now = new Date();
      const thisMonthTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const aiRes = await api.refreshAiHealth(thisMonthTxs);
      if (aiRes && aiRes.success && aiRes.data) {
        setAiData({ score: aiRes.data.score, note: aiRes.data.note });
      }
    } catch (err) {
      console.error("AI Refresh Hatası:", err);
      setAiData({ score: null, note: "Analiz güncellenirken bir hata oluştu." });
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Helper: Get all instances for a month (including recurring)
  const instancesInMonth = useMemo(() => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const instances = [];
    
    payments.forEach(p => {
      const pDate = new Date(p.date);
      if (!p.isRecurring) {
        if (pDate >= startDate && pDate <= endDate) {
          instances.push({ ...p, instanceDate: p.date, isPlanned: true });
        }
      } else {
        const dayOfMonth = pDate.getDate();
        const instanceDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;
        const instanceDate = new Date(instanceDateStr);
        if (instanceDate >= startDate && instanceDate <= endDate) {
          // Check if already paid (exists in transactions)
          const isPaid = transactions.some(t => 
            t.description.toLowerCase().includes(p.brand.toLowerCase()) && 
            t.date === instanceDateStr
          );
          if (!isPaid) {
            instances.push({ ...p, instanceDate: instanceDateStr, isPlanned: true });
          }
        }
      }
    });
    return instances;
  }, [selectedDate, payments, transactions]);

  // Filtered Data
  const currentList = useMemo(() => {
    let list = [];
    if (tab === 'PAST') {
      list = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
    } else {
      list = instancesInMonth;
    }

    if (searchTerm) {
      list = list.filter(item => 
        (item.description || item.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return list.sort((a, b) => new Date(b.date || b.instanceDate) - new Date(a.date || a.instanceDate));
  }, [tab, transactions, instancesInMonth, month, year, searchTerm]);

  // Calculations
  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const weeklyIncomeData = useMemo(() => {
    const weeks = [
      { name: '1. Hafta', amount: 0, dateRange: '1-7' },
      { name: '2. Hafta', amount: 0, dateRange: '8-14' },
      { name: '3. Hafta', amount: 0, dateRange: '15-21' },
      { name: '4. Hafta', amount: 0, dateRange: '22+' }
    ];

    const incomeTxs = thisMonthTransactions.filter(t => t.type === 'INCOME');
    
    incomeTxs.forEach(t => {
      const d = new Date(t.date);
      const day = d.getDate();
      if (day >= 1 && day <= 7) weeks[0].amount += t.amount;
      else if (day >= 8 && day <= 14) weeks[1].amount += t.amount;
      else if (day >= 15 && day <= 21) weeks[2].amount += t.amount;
      else weeks[3].amount += t.amount;
    });

    const monthName = selectedDate.toLocaleDateString('tr-TR', { month: 'long' });
    weeks[0].dateRange = `1-7 ${monthName}`;
    weeks[1].dateRange = `8-14 ${monthName}`;
    weeks[2].dateRange = `15-21 ${monthName}`;
    
    const lastDay = new Date(year, month + 1, 0).getDate();
    weeks[3].dateRange = `22-${lastDay} ${monthName}`;

    return weeks;
  }, [thisMonthTransactions, selectedDate, year, month]);

  const income = thisMonthTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expense = thisMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const pendingExpense = instancesInMonth.reduce((s, p) => s + p.amount, 0);
  const totalPredictedExpense = expense + pendingExpense;
  
  const predictedBalance = income - totalPredictedExpense;
  const calculatedHealthScore = totalBudget > 0 ? Math.min(100, Math.max(0, Math.round(100 - (totalPredictedExpense / totalBudget) * 100))) : (totalPredictedExpense > 0 ? 0 : 100);
  const healthScore = aiData.score !== null ? aiData.score : calculatedHealthScore;

  // Income Comparison
  const lastMonth = transactions.filter(t => {
    const d = new Date(t.date);
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });
  const lastIncome = lastMonth.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const incomeChange = lastIncome === 0 ? 100 : Math.round(((income - lastIncome) / lastIncome) * 100);

  const incomeByCategory = thisMonthTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});

  let aiMessage = isLoadingAi ? "AI analiz ediyor..." : aiData.note;
  const expensesByCategory = thisMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});

  const lastMonthExpensesByCategory = lastMonth.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});

  const sortedCategories = Object.keys(expensesByCategory).sort((a,b) => expensesByCategory[b] - expensesByCategory[a]).slice(0, 3);
  const totalThisMonthExpense = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
  
  let topCategoryName = 'Diğer';
  let topCategoryRatio = 0;
  const topCatId = Object.keys(expensesByCategory).sort((a,b) => expensesByCategory[b] - expensesByCategory[a])[0];
  if (topCatId) {
    topCategoryName = getCat(topCatId).name;
    topCategoryRatio = Math.min(100, (expensesByCategory[topCatId] / (totalBudget || 1000)) * 100); 
  }

  const getMonthOptions = () => {
    const opts = [];
    for(let i=-2; i<4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      opts.push(d);
    }
    return opts;
  };

  const SegmentedBar = (props) => {
    const { x, y, width, height } = props;
    const segmentHeight = 4.5;
    const gap = 2.5;
    const step = segmentHeight + gap;
    const validHeight = height > 0 ? height : 0;
    const totalSegments = Math.max(0, Math.floor(validHeight / step));
    if (totalSegments === 0) return null;
    return (
      <g>
        {[...Array(totalSegments)].map((_, i) => {
          const ratio = i / (totalSegments - 1 || 1);
          const h = 200 + (30 * ratio);
          const l = 60 - (20 * ratio);
          return (
            <rect key={i} x={x} y={y + i * step} width={width} height={segmentHeight} rx={2.5} fill={`hsl(${h}, 95%, ${l}%)`} />
          );
        })}
      </g>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#11142D] mb-1 tracking-tight">Merhaba, {user?.full_name?.split(' ')[0] || 'Kullanıcı'}! 👋</h1>
          <p className="text-sm text-gray-400 font-bold tracking-tight">Finansal durumun bugün oldukça iyi görünüyor.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 bg-[#11142D] text-white rounded-2xl font-extrabold text-[13px] shadow-lg shadow-gray-200 hover:scale-105 transition-all flex items-center gap-2 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Yeni Kayıt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Total Income Card */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 flex flex-col">
          <div className="mb-6">
            <h3 className="text-[18px] font-extrabold text-[#11142D] tracking-tight mb-0.5">Aylık Gelir Analizi</h3>
            <p className="text-[12px] text-gray-400">Seçili döneme ait gelir dağılımı</p>
          </div>
          
          <div className="bg-[#F8F9FB] rounded-[24px] p-6 flex flex-col mb-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">AKTİVİTE GRAFİĞİ</span>
              <button 
                onClick={() => setShowIncomeDetails(true)}
                className="text-[11px] font-extrabold text-[#2853FF] uppercase tracking-wider flex items-center gap-1 hover:opacity-70"
              >
                DETAYLAR <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="text-[36px] font-extrabold text-[#11142D] tracking-tight leading-none">
                {fmt(income)}
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowDatePickerTop(!showDatePickerTop)}
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#11142D] transition-all flex items-center gap-1 group"
                >
                  {selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className={`transition-transform duration-300 ${showDatePickerTop ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <AnimatePresence>
                  {showDatePickerTop && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-2 w-48 bg-white rounded-3xl shadow-2xl border border-gray-50 p-3 z-[100] overflow-hidden">
                      <div className="space-y-1">
                        {getMonthOptions().map(d => {
                          const label = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                          const isActive = d.getMonth() === month && d.getFullYear() === year;
                          return (
                            <button key={label} onClick={() => { setSelectedDate(d); setShowDatePickerTop(false); }} className={`w-full text-left px-4 py-3 rounded-2xl text-[12px] font-extrabold transition-all uppercase tracking-widest ${isActive ? 'bg-[#11142D] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
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

            <div className="h-44 w-full mt-4">
              {income === 0 && expense === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[20px] bg-gray-50/50">
                  <BarChart3 size={32} className="text-gray-300 mb-2 stroke-[1.5]" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center px-4">Veri girişi yapılana kadar <br/> grafik boş görünecektir.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyIncomeData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 700 }} tickFormatter={v => v === 0 ? '0' : `${v/1000}K`} width={35} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#11142D] text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                              <p className="text-[10px] font-extrabold text-gray-400 mb-1 uppercase tracking-widest">{data.dateRange}</p>
                              <p className="text-[18px] font-extrabold">{fmt(data.amount)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="amount" shape={<SegmentedBar />} barSize={26} animationDuration={500} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-[#FAFBFC] rounded-[32px] p-2.5 border border-gray-50 flex flex-col gap-2">
            {[
              { id: 'budget', icon: <PiggyBank size={20} className="stroke-[2.5]" />, label: 'Bütçe ve Hedefler', color: 'bg-[#F4B266] text-white', action: () => setActivePage('budget') },
              { id: 'monthly', icon: <Target size={20} className="stroke-[2.5]" />, label: 'Aylık Plan', color: 'bg-[#2853FF] text-white', action: () => setShowBudgetPlan(true) },
              { id: 'account', icon: <Settings size={20} className="stroke-[2.5]" />, label: 'Ayarlar', color: 'bg-[#4FD1C5] text-white', action: () => setActivePage('account') },
            ].map(item => (
              <button key={item.id} onClick={item.action} className="flex justify-between items-center bg-white rounded-[24px] p-3.5 px-5 hover:bg-gray-50 transition-all shadow-sm group active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${item.color}`}>{item.icon}</div>
                  <span className="font-extrabold text-[15px] text-[#11142D] tracking-tight">{item.label}</span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-[#11142D]"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
          </div>

          <UpcomingPayments setActivePage={setActivePage} />
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 flex flex-col">
              <div className="mb-6">
                <h3 className="text-[18px] font-extrabold text-[#11142D] tracking-tight mb-0.5">Finansal Özet</h3>
                <p className="text-[12px] text-gray-400">Aylık nakit akışı ve tahminler</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Tahmini Bakiye', amount: fmt(predictedBalance), bg: 'bg-[#FCEACC]', sub: 'Ay Sonu Tahmini' },
                  { title: 'Aylık Gelir', amount: fmt(income), bg: 'bg-[#D2F6F1]', sub: 'Gerçekleşen' },
                  { title: 'Tahmini Gider', amount: fmt(totalPredictedExpense), bg: 'bg-[#D8F5C1]', sub: 'Planlanan Dahil' },
                  { title: 'İşlem Sayısı', amount: `${thisMonthTransactions.length} Adet`, bg: 'bg-[#E6D4F9]', sub: 'Bu Ay' },
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} rounded-[24px] p-5 flex flex-col justify-between min-h-[125px] transition-transform hover:scale-[1.02] cursor-pointer border border-white/20 shadow-sm relative overflow-hidden group`}>

                    <div>
                      <span className="text-[13px] text-[#11142D] opacity-60 font-extrabold uppercase tracking-widest">{item.title}</span>
                      <p className="text-[9px] font-bold text-[#11142D]/40 uppercase tracking-tighter mt-0.5">{item.sub}</p>
                    </div>
                    <span className="text-[24px] font-extrabold text-[#11142D] tracking-tighter">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-7 shadow-sm border border-gray-50 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[18px] font-extrabold text-[#11142D] tracking-tight mb-1">AI Finansal Sağlık</h3>
                  <p className="text-[11px] text-gray-400 font-bold">Bütçe Analiz Skoru</p>
                </div>
                <button 
                  onClick={handleRefreshAi} 
                  disabled={isLoadingAi}
                  className="w-8 h-8 rounded-[12px] bg-gray-50 border border-gray-100 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-50 shadow-sm active:scale-95"
                  title="Skoru Yenile"
                >
                  <RefreshCw size={14} className={isLoadingAi ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="mt-4">
                {/* Yapay Zeka Notu */}
                {aiMessage && (
                  <div className="bg-[#F4F7FE] p-4 rounded-2xl border border-[#E0E7FF] flex items-center gap-4 mb-6 cursor-pointer hover:bg-[#EEF2FF] transition-colors" onClick={() => setShowAiModal(true)}>
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <h4 className="text-[12px] font-extrabold text-indigo-600 uppercase tracking-widest mb-1">Yapay Zeka Analizi</h4>
                      <p className="text-[12px] font-semibold text-gray-700 leading-snug line-clamp-2">{aiMessage}</p>
                    </div>
                    <div className="text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </div>
                )}

                {/* Harcama Karşılaştırması */}
                {sortedCategories.length > 0 && (
                  <div className="bg-[#F0F9FF] p-5 rounded-2xl border border-[#E0F2FE]">
                    <h4 className="text-[14px] font-extrabold text-[#11142D] mb-5">Harcama Karşılaştırması</h4>
                    <div className="space-y-4">
                      {sortedCategories.map(catId => {
                        const cat = getCat(catId);
                        const currentAmount = expensesByCategory[catId] || 0;
                        const prevAmount = lastMonthExpensesByCategory[catId] || 0;
                        let percentageChange = 0;
                        if (prevAmount > 0) {
                          percentageChange = Math.round(((currentAmount - prevAmount) / prevAmount) * 100);
                        } else if (currentAmount > 0) {
                          percentageChange = 100;
                        }
                        const isDown = percentageChange <= 0;
                        const badgeColor = isDown ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100';
                        const arrow = isDown ? '↘' : '↗';
                        const displayPercent = isDown ? `${percentageChange}%` : `+${percentageChange}%`;
                        const barWidth = Math.min(100, Math.max(5, (currentAmount / (totalThisMonthExpense || 1)) * 100));

                        return (
                          <div key={catId} className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 text-[20px] mr-3">
                              {cat.icon}
                            </div>
                            <div className="flex-1 mr-4">
                              <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[12px] font-extrabold text-[#11142D]">{cat.name}</span>
                                <span className="text-[12px] font-extrabold text-[#11142D]">{fmt(currentAmount)}</span>
                              </div>
                              <div className="w-full h-2.5 bg-[#E0E7FF] rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${barWidth}%`, backgroundColor: cat.color }}></div>
                              </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase whitespace-nowrap shadow-sm flex items-center gap-1 ${badgeColor}`}>
                              <span className="text-[12px] leading-none">{arrow}</span> Önceki Aya Göre: {displayPercent}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-3 z-10 relative">
                <div className="flex gap-2 flex-wrap">
                  {["Nasıl tasarruf edebilirim?", "En kritik harcamam ne?", "Tavsiyen nedir?"].map((q, i) => (
                    <button key={i} onClick={() => handleAskAssistant(q)} className="text-[10px] font-extrabold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm active:scale-95">
                      {q}
                    </button>
                  ))}
                </div>
                
                {(isChatLoading || chatResponse) && (
                  <div className="bg-[#F4F7FE] rounded-[24px] p-4 border border-indigo-50 relative overflow-hidden shadow-sm">
                    <div className="flex gap-3 relative z-10">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-indigo-600 flex-shrink-0 shadow-md">
                        <Sparkles size={14} className="stroke-[2.5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isChatLoading ? (
                           <div className="flex items-center gap-1.5 h-8">
                             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                           </div>
                        ) : (
                           <p className="text-[12px] font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{chatResponse}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="relative mt-1">
                  <input 
                    type="text" 
                    placeholder="Asistana soru sor..." 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAskAssistant(chatInput)}
                    className="w-full bg-[#FAFBFC] border border-gray-100 shadow-sm rounded-[20px] py-3 pl-4 pr-12 text-[12px] font-semibold text-[#11142D] focus:outline-none focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all placeholder-gray-400"
                  />
                  <button 
                    onClick={() => handleAskAssistant(chatInput)} 
                    disabled={isChatLoading || !chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-[14px] hover:bg-indigo-600 transition-colors disabled:opacity-50 shadow-md active:scale-95"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-6 cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-colors" onClick={() => setActivePage('budget')}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">En Çok Harcama: {topCategoryName}</span>
                  <span className={`text-[12px] font-extrabold ${topCategoryRatio > 85 ? 'text-orange-500' : 'text-indigo-500'}`}>%{Math.round(topCategoryRatio)}</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${topCategoryRatio}%` }} transition={{ duration: 1, delay: 0.5 }} className={`h-full rounded-full ${topCategoryRatio > 85 ? 'bg-orange-400' : 'bg-[#4318FF]'}`}></motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Table Section */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[20px] font-extrabold text-[#11142D] tracking-tight mb-1">İşlem Geçmişi</h3>
                <p className="text-[12px] text-gray-400">Harcamalarını ve gelirlerini yönet</p>
              </div>
              <div className="flex gap-3 items-center relative">
                <button 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#FAFBFC] rounded-full border border-gray-100 text-[11px] font-extrabold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  TARİH SEÇ
                </button>
                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-3 w-48 bg-white rounded-3xl shadow-2xl border border-gray-50 p-3 z-[100] overflow-hidden">
                      <div className="space-y-1">
                        {getMonthOptions().map(d => {
                          const label = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                          const isActive = d.getMonth() === month && d.getFullYear() === year;
                          return (
                            <button key={label} onClick={() => { setSelectedDate(d); setShowDatePicker(false); }} className={`w-full text-left px-4 py-3 rounded-2xl text-[12px] font-extrabold transition-all uppercase tracking-widest ${isActive ? 'bg-[#11142D] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
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

            <div className="flex justify-between items-center mb-6">
              <div className="flex bg-[#FAFBFC] rounded-full p-1.5 border border-gray-100 shadow-inner">
                <button onClick={() => setTab('PAST')} className={`px-8 py-3 rounded-full text-[12px] font-extrabold transition-all uppercase tracking-widest ${tab === 'PAST' ? 'bg-[#11142D] text-white shadow-lg' : 'text-gray-400 hover:text-[#11142D]'}`}>Geçmiş</button>
                <button onClick={() => setTab('PLANNED')} className={`px-8 py-3 rounded-full text-[12px] font-extrabold transition-all uppercase tracking-widest ${tab === 'PLANNED' ? 'bg-[#11142D] text-white shadow-lg' : 'text-gray-400 hover:text-[#11142D]'}`}>Planlanan</button>
              </div>
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  placeholder="İşlemlerde ara..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-full text-[12px] font-extrabold outline-none focus:border-indigo-300 w-[160px] md:w-[260px] text-gray-500 shadow-sm transition-all" 
                />
              </div>
            </div>

            {/* Table Summary Row */}
            <div className="mb-4 px-4 py-3 bg-indigo-50/50 rounded-2xl flex justify-between items-center border border-indigo-100/30">
               <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-[0.2em]">
                 {tab === 'PAST' ? 'BU AY GERÇEKLEŞEN GİDER' : 'BU AY BEKLENEN TOPLAM GİDER'}
               </span>
               <span className="text-[16px] font-extrabold text-indigo-700 tracking-tight">
                 {tab === 'PAST' ? fmt(expense) : fmt(pendingExpense)}
               </span>
            </div>

            <div className="w-full overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#FAFBFC] rounded-2xl">
                    <th className="py-4 px-6 font-extrabold text-[10px] text-gray-400 uppercase tracking-widest rounded-l-2xl">İSİM / KATEGORİ</th>
                    <th className="py-4 px-6 font-extrabold text-[10px] text-gray-400 uppercase tracking-widest">TARİH</th>
                    <th className="py-4 px-6 font-extrabold text-[10px] text-gray-400 uppercase tracking-widest">DURUM</th>
                    <th className="py-4 px-6 font-extrabold text-[10px] text-gray-400 uppercase tracking-widest text-right rounded-r-2xl">MİKTAR</th>
                  </tr>
                </thead>
                <tbody>
                  {!currentList.length ? (
                    <tr>
                      <td colSpan="4" className="py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300/80">
                            <FolderOpen size={28} className="stroke-[1.5]" />
                          </div>
                          <p className="text-gray-400 font-bold text-[13px]">Henüz bir işlem bulunmuyor.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentList.map(item => {
                      const cat = getCat(item.categoryId);
                      const isIncome = item.type === 'INCOME';
                      const isPlanned = item.isPlanned;
                      return (
                         <tr key={item.id + (item.instanceDate || '')} className="border-b border-gray-50 last:border-none hover:bg-[#FAFBFC] transition-colors cursor-pointer group">
                           <td className="py-5 px-6">
                             <div className="flex items-center gap-4">
                               <BrandIcon 
                                 domain={item.domain} 
                                 brand={item.description || item.brand} 
                                 color={item.color || (detectBrand(item.description || item.brand)?.color) || (cat.color + '15')}
                                 size="w-11 h-11"
                                 iconSize="w-6 h-6"
                                 className="rounded-2xl"
                               />
                               <div>
                                 <div className="text-[14px] font-extrabold text-[#11142D] leading-tight mb-0.5">{item.description || item.brand}</div>
                                 <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{cat.name}</div>
                               </div>
                             </div>
                           </td>
                          <td className="py-5 px-6">
                            <div className="text-[13px] font-bold text-[#11142D] leading-tight mb-0.5">{fmtDate(item.date || item.instanceDate)}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{isPlanned ? 'Planlanan' : (isIncome ? 'Gelir' : 'Gider')}</div>
                          </td>
                          <td className="py-5 px-6">
                            {isPlanned ? (
                              <button 
                                onClick={(e) => { e.stopPropagation(); markAsPaid(item.id, item.instanceDate); }}
                                className="px-5 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all"
                              >
                                ÖDE / ONAYLA
                              </button>
                            ) : (
                              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${isIncome ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                {isIncome ? 'Tamamlandı' : 'Ödendi'}
                              </span>
                            )}
                          </td>
                          <td className={`py-5 px-6 text-right text-[15px] font-extrabold ${isIncome ? 'text-emerald-500' : 'text-[#11142D]'}`}>
                            {isIncome ? '+' : '-'}{fmt(item.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <button onClick={() => setActivePage('transactions')} className="w-full py-4 mt-4 bg-[#FAFBFC] text-gray-400 rounded-2xl text-[11px] font-extrabold hover:bg-gray-100 hover:text-[#11142D] transition-all uppercase tracking-[0.2em] border border-transparent hover:border-gray-100 shadow-sm active:scale-95">TÜM İŞLEMLERİ GÖRÜNTÜLE</button>
          </div>
        </div>
      </div>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#11142D]/40 backdrop-blur-md z-[2000] flex items-center justify-center p-4" onClick={() => setShowAiModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-gray-50 bg-[#FAFBFC] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <Sparkles size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#11142D]">AI Analiz Raporu</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Finansal Sağlık Durumu</p>
                  </div>
                </div>
                <button onClick={() => setShowAiModal(false)} className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100">
                  <h4 className="text-[13px] font-extrabold text-indigo-600 uppercase tracking-widest mb-3">Analiz Özeti</h4>
                  <p className="text-sm font-semibold text-gray-700 leading-relaxed">Puanın %{healthScore}. Özellikle <strong>{topCategoryName}</strong> harcamalarına dikkat etmelisin. Tasarruf potansiyelin yüksek!</p>
                </div>
              </div>
              <div className="p-8 pt-0"><button onClick={() => setShowAiModal(false)} className="w-full py-4 bg-[#11142D] text-white rounded-[24px] font-extrabold text-[13px] uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all">Anladım</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gelir Detayları Drawer */}
      <AnimatePresence>
        {showIncomeDetails && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#11142D]/20 backdrop-blur-sm z-[2000]" onClick={() => setShowIncomeDetails(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[2001] flex flex-col border-l border-gray-100">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#FAFBFC]">
                <div><h3 className="font-extrabold text-[#11142D] text-xl tracking-tight">Gelir Detayları</h3><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Kazanç Analizi</p></div>
                <button onClick={() => setShowIncomeDetails(false)} className="w-10 h-10 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center shadow-sm"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
              <div className="p-8 flex-1 overflow-y-auto">
                <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 mb-8">
                  <p className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest mb-1">Toplam Gelir</p>
                  <div className="flex items-end gap-2"><span className="text-3xl font-extrabold text-[#11142D] tracking-tighter">{fmt(income)}</span></div>
                </div>
                <div className="space-y-3">
                  {Object.entries(incomeByCategory).map(([catId, amount]) => (
                    <div key={catId} className="flex justify-between items-center p-4 bg-[#FAFBFC] rounded-[24px] border border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">{getCat(catId).icon}</div>
                        <p className="text-[13px] font-extrabold text-[#11142D]">{getCat(catId).name}</p>
                      </div>
                      <span className="text-[14px] font-extrabold text-emerald-500">{fmt(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 border-t border-gray-50 bg-[#FAFBFC]"><button onClick={() => setShowIncomeDetails(false)} className="w-full py-4 bg-[#11142D] text-white rounded-2xl font-extrabold text-[13px] shadow-xl shadow-gray-200 active:scale-95 transition-all">Kapat</button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Monthly Plan Modal */}
      <AnimatePresence>
        {showBudgetPlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#11142D]/40 backdrop-blur-md z-[2000] flex items-center justify-center p-4" onClick={() => setShowBudgetPlan(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-gray-50 bg-[#FAFBFC] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100">
                    <Target size={22} className="stroke-[2.5]" />
                  </div>
                  <div><h3 className="text-[18px] font-extrabold text-[#11142D] tracking-tight">Aylık Limit</h3><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Bütçe Ayarı</p></div>
                </div>
                <button onClick={() => setShowBudgetPlan(false)} className="w-10 h-10 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 transition-colors shadow-sm active:scale-95"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] block mb-3 text-center">TOPLAM HARCAMA LİMİTİ</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-indigo-500">₺</span>
                    <input type="number" defaultValue={totalBudget} id="budgetInput" className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl py-5 pl-12 pr-6 text-[28px] font-extrabold text-[#11142D] outline-none focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50/30 transition-all tracking-tighter text-center" />
                  </div>
                </div>
              </div>
              <div className="p-8 pt-0"><button onClick={() => { const val = document.getElementById('budgetInput').value; setTotalBudget(parseFloat(val) || 0); setShowBudgetPlan(false); }} className="w-full py-4 bg-[#11142D] text-white rounded-[24px] font-extrabold text-[13px] uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all hover:bg-black">Değişiklikleri Kaydet</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
