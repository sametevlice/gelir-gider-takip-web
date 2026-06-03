import { useState } from 'react';
import { useStore, getCat, fmt } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function Analytics() {
  const transactions = useStore(state => state.transactions);
  const [period, setPeriod] = useState(6);

  const now = new Date();
  const months = [];
  for (let i = period - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ 
      year: d.getFullYear(), 
      month: d.getMonth(), 
      label: d.toLocaleDateString('tr-TR', { month: 'short' }) 
    });
  }

  const chartData = months.map(m => {
    const txs = transactions.filter(t => { 
      const d = new Date(t.date); 
      return d.getFullYear() === m.year && d.getMonth() === m.month; 
    });
    return {
      name: m.label,
      gelir: txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
      gider: txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
    };
  });

  const catSpend = {};
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => { 
    catSpend[t.categoryId || 'cat15'] = (catSpend[t.categoryId || 'cat15'] || 0) + t.amount; 
  });
  const topCats = Object.entries(catSpend)
    .sort((a, b) => b[1] - a[1])
    .map(([id, value]) => ({ id, value, name: getCat(id).name, icon: getCat(id).icon, color: getCat(id).color }));
  
  const totalExp = topCats.reduce((s, t) => s + t.value, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#11142D] text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
          <p className="text-[11px] font-extrabold text-gray-400 mb-3 uppercase tracking-[0.2em]">{label}</p>
          <div className="space-y-2">
            {payload.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <span className="text-[13px] font-bold text-gray-200">{p.name === 'gelir' ? 'Gelir' : 'Gider'}</span>
                </div>
                <span className="text-[14px] font-extrabold">{fmt(p.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#11142D] mb-1 tracking-tight">Finansal Analiz</h1>
          <p className="text-sm text-gray-400 font-bold tracking-tight">Harcama ve gelir dengeni detaylıca incele.</p>
        </div>
        <div className="relative">
          <select 
            className="bg-white border border-gray-100 rounded-2xl pl-6 pr-12 py-3.5 text-[12px] font-extrabold text-[#11142D] tracking-widest uppercase shadow-sm appearance-none outline-none focus:ring-4 focus:ring-indigo-50/50 cursor-pointer transition-all" 
            value={period} 
            onChange={e => setPeriod(parseInt(e.target.value))}
          >
            <option value={3}>Son 3 Ay</option>
            <option value={6}>Son 6 Ay</option>
            <option value={12}>Son 12 Ay</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Ana Grafik */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col min-h-[480px]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-[18px] font-extrabold text-[#11142D] tracking-tight">Gelir & Gider Akışı</h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Aylık Karşılaştırma</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200"></div><span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Gelir</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-200"></div><span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Gider</span></div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 10 }} />
                <Bar dataKey="gelir" fill="#4318FF" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="gider" fill="#FF5252" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pasta Grafik */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col">
          <h3 className="text-[18px] font-extrabold text-[#11142D] mb-2 tracking-tight">Kategori Dağılımı</h3>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-10">En Çok Harcananlar</p>
          
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full h-[240px] relative mb-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCats}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {topCats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#11142D] text-white p-3 rounded-xl shadow-xl text-center">
                            <div className="text-[13px] font-extrabold">{payload[0].name}</div>
                            <div className="text-[11px] font-bold text-gray-400">{fmt(payload[0].value)}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[32px] font-extrabold text-[#11142D] tracking-tighter">%{totalExp > 0 ? (topCats[0]?.value / totalExp * 100).toFixed(0) : 0}</span>
                <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-[0.2em]">{topCats[0]?.name}</span>
              </div>
            </div>
            
            <div className="w-full space-y-4">
              {topCats.slice(0, 4).map((cat, i) => {
                const pct = totalExp > 0 ? (cat.value / totalExp * 100).toFixed(1) : 0;
                return (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-50 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">{cat.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[13px] font-extrabold text-[#11142D]">{cat.name}</span>
                        <span className="text-[12px] font-bold text-gray-400">%{pct}</span>
                      </div>
                      <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100/50">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full rounded-full" style={{ backgroundColor: cat.color }}></motion.div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detaylı Liste */}
        <div className="col-span-12 bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-[18px] font-extrabold text-[#11142D] tracking-tight">Kategori Detayları</h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Harama Analizi</p>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em] mb-4">
            <div className="col-span-4 md:col-span-3">KATEGORİ</div>
            <div className="col-span-2 hidden md:block text-right">ORAN</div>
            <div className="col-span-4 md:col-span-5 px-6">DAĞILIM</div>
            <div className="col-span-4 md:col-span-2 text-right">TOPLAM TUTAR</div>
          </div>

          <div className="space-y-2">
            {!topCats.length ? (
              <div className="py-12 text-center text-[15px] font-extrabold text-gray-300">Bu dönemde henüz bir harcama kaydı bulunmuyor.</div>
            ) : topCats.map((cat, i) => {
              const pct = totalExp > 0 ? (cat.value / totalExp * 100).toFixed(1) : 0;
              return (
                <motion.div 
                  key={cat.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4.5 bg-white hover:bg-[#FAFBFC] rounded-2xl border border-transparent hover:border-gray-100 transition-all cursor-default group"
                >
                  <div className="col-span-4 md:col-span-3 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-white border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">{cat.icon}</div>
                    <div className="font-extrabold text-[#11142D] text-[14px]">{cat.name}</div>
                  </div>
                  <div className="col-span-2 hidden md:block text-right text-[13px] font-bold text-gray-400">%{pct}</div>
                  <div className="col-span-4 md:col-span-5 px-6">
                    <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100/50 relative">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, type: 'spring' }} className="absolute left-0 top-0 h-full rounded-full" style={{ backgroundColor: cat.color }}></motion.div>
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-2 text-right text-[15px] font-extrabold text-[#11142D]">{fmt(cat.value)}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
