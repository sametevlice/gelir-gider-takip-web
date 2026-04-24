import { useState } from 'react';
import { useStore, getCat, fmt } from '../store/useStore';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

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
      label: d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }) 
    });
  }

  const incomeData = [];
  const expenseData = [];
  months.forEach(m => {
    const txs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    });
    incomeData.push(txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0));
    expenseData.push(txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0));
  });

  const barData = {
    labels: months.map(m => m.label),
    datasets: [
      { label: 'Gelir', data: incomeData, backgroundColor: 'rgba(171,227,158,0.7)', borderRadius: 6, borderSkipped: false },
      { label: 'Gider', data: expenseData, backgroundColor: 'rgba(255,92,92,0.7)', borderRadius: 6, borderSkipped: false }
    ]
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } } },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6B7280', font: { family: 'Manrope' } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6B7280', font: { family: 'Manrope' }, callback: v => fmt(v) } }
    }
  };

  const catSpend = {};
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    catSpend[t.categoryId || 'cat15'] = (catSpend[t.categoryId || 'cat15'] || 0) + t.amount;
  });
  const topCats = Object.entries(catSpend).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const totalExp = topCats.reduce((s, [, v]) => s + v, 0);

  const cats = topCats.map(([id]) => getCat(id));
  const donutData = {
    labels: cats.map(c => c.name),
    datasets: [{
      data: topCats.map(([, v]) => v),
      backgroundColor: cats.map(c => c.color + 'cc'),
      borderWidth: 0, hoverOffset: 4
    }]
  };
  const donutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '72%',
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } } }
  };

  const topPct = totalExp > 0 ? (topCats[0][1] / totalExp * 100).toFixed(0) : 0;

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const totalNet = totalIncome - totalExpense;
  const totalAll = totalIncome || 1;

  const bars = [
    { label: 'Gelir', value: totalIncome, pct: 100, color: 'var(--green)' },
    { label: 'Gider', value: totalExpense, pct: (totalExpense / totalAll * 100).toFixed(0), color: 'var(--red)' },
    { label: 'Net', value: Math.max(totalNet, 0), pct: (Math.max(totalNet, 0) / totalAll * 100).toFixed(0), color: 'var(--purple)' },
  ];

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Analitik</div>
          <div className="page-sub">Finansal içgörüler</div>
        </div>
        <select className="filter-input" style={{ cursor: 'pointer', width: 'auto' }} value={period} onChange={e => setPeriod(parseInt(e.target.value))}>
          <option value={6}>Son 6 Ay</option>
          <option value={12}>Son 12 Ay</option>
          <option value={3}>Son 3 Ay</option>
        </select>
      </div>

      <div className="analytics-grid">
        <div className="card card-lg analytics-full">
          <div className="section-header">
            <div className="section-title">📈 Aylık Gelir & Gider</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: '600' }}>
              <span style={{ color: 'var(--green)' }}>● Gelir</span>
              <span style={{ color: 'var(--red)' }}>● Gider</span>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="card card-lg">
          <div className="section-header">
            <div className="section-title">🍩 Gider Dağılımı</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '160px', height: '160px', flexShrink: 0, position: 'relative' }}>
              {topCats.length > 0 && <Doughnut data={donutData} options={donutOptions} />}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ fontSize: '22px', fontWeight: '800' }}>{topCats.length ? topPct + '%' : '—'}</div>
                <div style={{ fontSize: '10px', color: 'var(--t2)', fontWeight: '600' }}>En Çok</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topCats.slice(0, 5).map(([id, amt]) => {
                const cat = getCat(id);
                const pct = totalExp > 0 ? (amt / totalExp * 100).toFixed(1) : 0;
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, flexShrink: 0 }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '600', flex: 1, color: 'var(--t2)' }}>{cat.icon} {cat.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card card-lg">
          <div className="section-header">
            <div className="section-title">⚖️ Gelir/Gider Oranı</div>
          </div>
          <div className="ratio-bars">
            {bars.map(b => (
              <div key={b.label} className="ratio-bar">
                <div className="ratio-bar-fill" style={{ background: `${b.color}15` }}>
                  <div className="ratio-bar-inner" style={{ height: `${b.pct}%`, background: b.color }}></div>
                </div>
                <div className="ratio-bar-label">{b.label}</div>
                <div className="ratio-bar-value" style={{ color: b.color }}>{fmt(b.value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-lg analytics-full">
          <div className="section-header">
            <div className="section-title">📋 Kategori Detayı</div>
          </div>
          <div className="category-dist">
            {!topCats.length ? (
              <div className="empty-state" style={{ padding: '20px' }}><div className="empty-text">Henüz gider yok</div></div>
            ) : topCats.map(([id, amt]) => {
              const cat = getCat(id);
              const pct = totalExp > 0 ? (amt / totalExp * 100).toFixed(1) : 0;
              return (
                <div key={id} className="cat-dist-row">
                  <div className="cat-dist-icon" style={{ background: `${cat.color}20` }}>{cat.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>{cat.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--t2)', minWidth: '36px' }}>{pct}%</div>
                  <div className="cat-dist-bar-wrap" style={{ flex: 3 }}><div className="cat-dist-bar" style={{ width: `${pct}%`, background: cat.color }}></div></div>
                  <div className="cat-dist-amount">{fmt(amt)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
