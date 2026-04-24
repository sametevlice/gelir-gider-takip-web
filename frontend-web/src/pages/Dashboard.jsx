import { useState } from 'react';
import { useStore, getCat, fmt, fmtDate, CATEGORIES } from '../store/useStore';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';

const weeklyData = [
  { name: 'Pzt', amount: 120 },
  { name: 'Sal', amount: 350 },
  { name: 'Çar', amount: 80 },
  { name: 'Per', amount: 450 },
  { name: 'Cum', amount: 200 },
  { name: 'Cts', amount: 650 },
  { name: 'Paz', amount: 150 },
];

const balanceData = [
  { name: 'Oca', income: 4000, expense: 2400 },
  { name: 'Şub', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Nis', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Haz', income: 2390, expense: 3800 },
  { name: 'Tem', income: 3490, expense: 4300 },
];

export default function Dashboard({ setModalOpen, setEditId, setActivePage }) {
  const user = useStore(state => state.user);
  const transactions = useStore(state => state.transactions);
  const addTx = useStore(state => state.addTransaction);
  const showToast = useStore(state => state.showToast);

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? 'Günaydın' : h < 18 ? 'İyi öğleden sonralar' : 'İyi akşamlar';
  const greetingText = `${greeting}, ${user?.name?.split(' ')[0] || 'Kullanıcı'} 👋`;
  const dateFull = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const month = now.getMonth();
  const year = now.getFullYear();

  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  
  const lastMonth = transactions.filter(t => {
    const d = new Date(t.date);
    const lm = month === 0 ? 11 : month - 1;
    const ly = month === 0 ? year - 1 : year;
    return d.getMonth() === lm && d.getFullYear() === ly;
  });

  const income = thisMonth.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expense = thisMonth.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const prevExpense = lastMonth.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const allIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const allExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const [qaType, setQaType] = useState('EXPENSE');
  const [qaAmount, setQaAmount] = useState('');
  const [qaDesc, setQaDesc] = useState('');
  const [qaCat, setQaCat] = useState('');

  const handleQaSave = () => {
    const amt = parseFloat(qaAmount);
    if (!amt || !qaDesc.trim()) return showToast('Miktar ve açıklama gerekli', 'error');
    addTx(qaType, amt, qaDesc, new Date().toISOString().split('T')[0], qaCat);
    showToast((qaType === 'INCOME' ? '💚 Gelir' : '🔴 Gider') + ' eklendi!', 'success');
    setQaAmount('');
    setQaDesc('');
    setQaCat('');
  };

  let badgeProps = { className: 'summary-change change-down', text: 'İlk ay verisi' };
  if (prevExpense > 0) {
    const badgePct = ((expense - prevExpense) / prevExpense * 100).toFixed(1);
    const absPct = Math.abs(badgePct);
    if (expense < prevExpense) {
      badgeProps = { className: 'summary-change change-down', text: `↓ %${absPct} geçen aydan az` };
    } else {
      badgeProps = { className: 'summary-change change-up', text: `↑ %${absPct} geçen aydan fazla` };
    }
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">{greetingText}</div>
          <div className="page-sub">{dateFull}</div>
        </div>
        <button className="btn btn-purple" onClick={() => setModalOpen(true)}>＋ Yeni İşlem</button>
      </div>

      <div className="dash-grid">
        <div className="card card-lg dash-summary wallet-glow">
          <div className="stat-label">Bu Ay Harcama</div>
          <div className="summary-amount">{fmt(expense)}</div>
          <span className={badgeProps.className}>{badgeProps.text}</span>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: '600' }}>Gelir</div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--green)', marginTop: '3px' }}>{fmt(income)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: '600' }}>Gider</div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--red)', marginTop: '3px' }}>{fmt(expense)}</div>
            </div>
          </div>
        </div>

        <div className="card card-lg dash-wallet wallet-glow">
          <div className="stat-label">💳 Spending Wallet</div>
          <div className="wallet-balance">{fmt(allIncome - allExpense)}</div>
          <div style={{ height: '4px', background: 'var(--bg3)', borderRadius: '2px', margin: '12px 0' }}>
            <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg,var(--purple),var(--purple2))', borderRadius: '2px' }}></div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--t2)' }}>Bütçenin %68'ini kullandın</div>
        </div>

        <div className="card card-lg dash-balance">
          <div className="stat-icon stat-icon-green">💰</div>
          <div className="stat-label">Net Bakiye</div>
          <div className="stat-value">{fmt(income - expense)}</div>
          <div style={{ fontSize: '12px', color: 'var(--t2)', marginTop: '6px' }}>Gelir - Gider</div>
        </div>

        {/* Weekly Spending Chart */}
        <div className="card card-lg dash-weekly-chart">
          <div className="section-header">
            <div className="section-title">Haftalık Harcama</div>
          </div>
          <div style={{ height: '220px', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t3)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t3)' }} dx={-10} />
                <Tooltip 
                  cursor={{ fill: 'var(--bg3)' }}
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600, color: 'var(--purple)' }}
                  labelStyle={{ color: 'var(--t2)', marginBottom: '4px', fontSize: '11px', fontWeight: 700 }}
                />
                <Bar dataKey="amount" name="Harcama" fill="var(--purple)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance Area Chart */}
        <div className="card card-lg dash-balance-chart">
          <div className="section-header">
            <div className="section-title">Gelir-Gider Dengesi</div>
          </div>
          <div style={{ height: '220px', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--red)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--red)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t3)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t3)' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{ color: 'var(--t2)', marginBottom: '4px', fontSize: '11px', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="income" name="Gelir" stroke="var(--green)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Gider" stroke="var(--red)" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card dash-quickadd">
          <div className="qa-title">⚡ Hızlı Ekle</div>
          <div className="qa-type-toggle">
            <button className={`qa-toggle-btn ${qaType === 'EXPENSE' ? 'active-expense' : ''}`} onClick={() => setQaType('EXPENSE')}>− Gider</button>
            <button className={`qa-toggle-btn ${qaType === 'INCOME' ? 'active-income' : ''}`} onClick={() => setQaType('INCOME')}>+ Gelir</button>
          </div>
          <input className="qa-input" type="number" placeholder="₺ Miktar" min="0" step="0.01" value={qaAmount} onChange={e => setQaAmount(e.target.value)} />
          <input className="qa-input" type="text" placeholder="Açıklama" value={qaDesc} onChange={e => setQaDesc(e.target.value)} />
          <select className="qa-select" value={qaCat} onChange={e => setQaCat(e.target.value)}>
            <option value="">Kategori seç</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <button className="btn btn-purple" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} onClick={handleQaSave}>Kaydet →</button>
        </div>

        <div className="card card-lg dash-recent">
          <div className="section-header">
            <div className="section-title">Son İşlemler</div>
            <span className="see-all" onClick={() => setActivePage('transactions')}>Tümünü Gör →</span>
          </div>
          <div>
            {!recent.length ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">Henüz işlem yok</div>
                <div className="empty-text">İlk işlemini ekle!</div>
              </div>
            ) : recent.map(t => {
              const cat = getCat(t.categoryId);
              return (
                <div key={t.id} className="tx-item" onClick={() => { setEditId(t.id); setModalOpen(true); }}>
                  <div className="tx-icon" style={{ background: `${cat.color}20` }}>{cat.icon}</div>
                  <div className="tx-info">
                    <div className="tx-name">{t.description}</div>
                    <div className="tx-date">{fmtDate(t.date)}</div>
                  </div>
                  <div className={`tx-amount ${t.type === 'INCOME' ? 'income' : 'expense'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
