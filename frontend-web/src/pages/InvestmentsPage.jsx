import { useState, useEffect } from 'react';
import { fmt } from '../store/useStore';

const MOCK_ASSETS = [
  { id: 'a1', name: 'Altın (Gram)', type: 'Altın', amount: 15.2, buyPrice: 2850, currentPrice: 3120, icon: '🥇', color: '#F59E0B' },
  { id: 'a2', name: 'THYAO', type: 'Hisse', amount: 200, buyPrice: 185, currentPrice: 210, icon: '✈️', color: '#3B82F6' },
  { id: 'a3', name: 'Bitcoin', type: 'Kripto', amount: 0.035, buyPrice: 2200000, currentPrice: 2450000, icon: '₿', color: '#F97316' },
  { id: 'a4', name: 'ASELS', type: 'Hisse', amount: 500, buyPrice: 42, currentPrice: 51, icon: '🛡️', color: '#6366F1' },
  { id: 'a5', name: 'Ethereum', type: 'Kripto', amount: 1.2, buyPrice: 55000, currentPrice: 62000, icon: '💎', color: '#8B5CF6' },
  { id: 'a6', name: 'Gümüş (Gram)', type: 'Altın', amount: 100, buyPrice: 35, currentPrice: 38, icon: '🪙', color: '#94A3B8' },
  { id: 'a7', name: 'SASA', type: 'Hisse', amount: 300, buyPrice: 65, currentPrice: 58, icon: '🏭', color: '#EC4899' },
  { id: 'a8', name: 'Dolar Mevduat', type: 'Döviz', amount: 1500, buyPrice: 32, currentPrice: 34.2, icon: '💵', color: '#10B981' },
];

export default function InvestmentsPage() {
  const [animateIn, setAnimateIn] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculations
  const assets = MOCK_ASSETS.map(a => {
    const totalCost = a.amount * a.buyPrice;
    const totalValue = a.amount * a.currentPrice;
    const pnl = totalValue - totalCost;
    const pnlPct = ((pnl / totalCost) * 100).toFixed(2);
    return { ...a, totalCost, totalValue, pnl, pnlPct: parseFloat(pnlPct) };
  });

  const totalInvestment = assets.reduce((s, a) => s + a.totalCost, 0);
  const totalValue = assets.reduce((s, a) => s + a.totalValue, 0);
  const totalPnl = totalValue - totalInvestment;
  const totalPnlPct = totalInvestment > 0 ? ((totalPnl / totalInvestment) * 100).toFixed(2) : 0;

  // Group by type for donut
  const typeGroups = {};
  assets.forEach(a => {
    if (!typeGroups[a.type]) typeGroups[a.type] = { value: 0, color: a.color, icon: '' };
    typeGroups[a.type].value += a.totalValue;
    if (!typeGroups[a.type].icon) typeGroups[a.type].icon = a.icon;
  });
  const typeColors = { 'Altın': '#F59E0B', 'Hisse': '#3B82F6', 'Kripto': '#8B5CF6', 'Döviz': '#10B981' };
  const typeEntries = Object.entries(typeGroups).sort((a, b) => b[1].value - a[1].value);

  // SVG Donut
  const donutData = typeEntries.map(([name, data]) => ({
    name, value: data.value, color: typeColors[name] || data.color, pct: ((data.value / totalValue) * 100)
  }));

  let cumulativeAngle = 0;
  const donutSegments = donutData.map(d => {
    const angle = (d.pct / 100) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;
    const largeArc = angle > 180 ? 1 : 0;
    const rad = Math.PI / 180;
    const r = 80;
    const cx = 100, cy = 100;
    const x1 = cx + r * Math.cos((startAngle - 90) * rad);
    const y1 = cy + r * Math.sin((startAngle - 90) * rad);
    const x2 = cx + r * Math.cos((endAngle - 90) * rad);
    const y2 = cy + r * Math.sin((endAngle - 90) * rad);
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });

  const filtered = selectedType === 'all' ? assets : assets.filter(a => a.type === selectedType);

  return (
    <div className="page active bm-page">
      <div className="page-header">
        <div>
          <div className="page-title">📈 Yatırımlarım</div>
          <div className="page-sub">Portföy takibi ve varlık dağılımı</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bm-summary-row">
        <div className="card bm-summary-card">
          <div className="bm-summary-icon" style={{ background: 'var(--purple3)' }}>💼</div>
          <div className="bm-summary-info">
            <div className="bm-summary-label">Toplam Yatırım</div>
            <div className="bm-summary-value">{fmt(totalInvestment)}</div>
          </div>
        </div>
        <div className="card bm-summary-card">
          <div className="bm-summary-icon" style={{ background: totalPnl >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)' }}>
            {totalPnl >= 0 ? '📈' : '📉'}
          </div>
          <div className="bm-summary-info">
            <div className="bm-summary-label">Kar / Zarar</div>
            <div className="bm-summary-value" style={{ color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {totalPnl >= 0 ? '+' : ''}{fmt(totalPnl)}
            </div>
          </div>
          <div className="bm-summary-badge">
            <span className={`inv-pnl-badge ${totalPnl >= 0 ? 'profit' : 'loss'}`}>
              {totalPnl >= 0 ? '▲' : '▼'} %{Math.abs(totalPnlPct)}
            </span>
          </div>
        </div>
        <div className="card bm-summary-card">
          <div className="bm-summary-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>💰</div>
          <div className="bm-summary-info">
            <div className="bm-summary-label">Portföy Değeri</div>
            <div className="bm-summary-value" style={{ color: 'var(--purple)' }}>{fmt(totalValue)}</div>
          </div>
        </div>
      </div>

      {/* Grid: Donut + Asset List */}
      <div className="inv-grid">
        {/* Donut Chart */}
        <div className="card card-lg inv-donut-card">
          <div className="section-title" style={{ marginBottom: '16px' }}>🎯 Varlık Dağılımı</div>
          <div className="inv-donut-wrap">
            <svg viewBox="0 0 200 200" className="inv-donut-svg">
              {donutSegments.map((seg, i) => (
                <path
                  key={seg.name}
                  d={seg.path}
                  fill={seg.color}
                  stroke="var(--card)"
                  strokeWidth="2"
                  className="inv-donut-segment"
                  style={{ animationDelay: `${i * 100}ms`, opacity: animateIn ? 1 : 0 }}
                />
              ))}
              <circle cx="100" cy="100" r="50" fill="var(--card)" />
              <text x="100" y="95" textAnchor="middle" fill="var(--t1)" fontSize="14" fontWeight="800">
                {fmt(totalValue)}
              </text>
              <text x="100" y="112" textAnchor="middle" fill="var(--t3)" fontSize="10" fontWeight="600">
                Toplam Değer
              </text>
            </svg>
          </div>
          <div className="inv-donut-legend">
            {donutData.map(d => (
              <div key={d.name} className="inv-legend-item" onClick={() => setSelectedType(selectedType === d.name ? 'all' : d.name)}>
                <div className="inv-legend-dot" style={{ background: d.color }}></div>
                <span className="inv-legend-name">{d.name}</span>
                <span className="inv-legend-pct">%{d.pct.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset List */}
        <div className="card card-lg inv-list-card">
          <div className="section-header">
            <div className="section-title">📋 Varlık Listesi</div>
            <div className="inv-type-filters">
              <button className={`filter-btn btn-sm ${selectedType === 'all' ? 'active' : ''}`} onClick={() => setSelectedType('all')}>Tümü</button>
              {Object.keys(typeColors).map(t => (
                <button key={t} className={`filter-btn btn-sm ${selectedType === t ? 'active' : ''}`} onClick={() => setSelectedType(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="inv-table">
            <div className="inv-table-header">
              <span>Varlık</span>
              <span>Miktar</span>
              <span>Maliyet</span>
              <span>Güncel Değer</span>
              <span>K/Z</span>
            </div>
            {filtered.map((a, i) => (
              <div
                key={a.id}
                className="inv-table-row"
                style={{ animationDelay: `${i * 60}ms`, opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(8px)', transition: `all .3s ease ${i * 60}ms` }}
              >
                <div className="inv-row-asset">
                  <div className="inv-row-icon" style={{ background: `${a.color}18` }}>{a.icon}</div>
                  <div>
                    <div className="inv-row-name">{a.name}</div>
                    <div className="inv-row-type">{a.type}</div>
                  </div>
                </div>
                <span className="inv-row-amount">{a.amount.toLocaleString('tr-TR')}</span>
                <span className="inv-row-cost">{fmt(a.totalCost)}</span>
                <span className="inv-row-value">{fmt(a.totalValue)}</span>
                <div className={`inv-row-pnl ${a.pnl >= 0 ? 'profit' : 'loss'}`}>
                  <span>{a.pnl >= 0 ? '+' : ''}{fmt(a.pnl)}</span>
                  <span className="inv-pnl-pct">{a.pnl >= 0 ? '▲' : '▼'} %{Math.abs(a.pnlPct)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
