import { useState, useRef } from 'react';
import { useStore, getCat, fmt, fmtDate, CATEGORIES } from '../store/useStore';

const TX_PER_PAGE = 10;

export default function Transactions({ setModalOpen, setEditId }) {
  const transactions = useStore(state => state.transactions);
  const deleteTx = useStore(state => state.deleteTransaction);
  const showToast = useStore(state => state.showToast);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState([]);
  const [page, setPage] = useState(1);

  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef(null);

  // Toggle category in multi-select
  const toggleCat = (catId) => {
    setCatFilter(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilter('all');
    setSearch('');
    setCatFilter([]);
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setPage(1);
  };

  const hasActiveFilters = filter !== 'all' || search || catFilter.length > 0 || dateFrom || dateTo || amountMin || amountMax;

  let filtered = transactions;
  if (filter !== 'all') filtered = filtered.filter(t => t.type === filter);
  if (search) filtered = filtered.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
  if (catFilter.length > 0) filtered = filtered.filter(t => catFilter.includes(t.categoryId));
  if (dateFrom) filtered = filtered.filter(t => t.date >= dateFrom);
  if (dateTo) filtered = filtered.filter(t => t.date <= dateTo);
  if (amountMin) filtered = filtered.filter(t => t.amount >= parseFloat(amountMin));
  if (amountMax) filtered = filtered.filter(t => t.amount <= parseFloat(amountMax));

  filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = filtered.length;
  const pages = Math.ceil(total / TX_PER_PAGE);
  if (page > pages && pages > 0) setPage(pages);
  
  const paged = filtered.slice((page - 1) * TX_PER_PAGE, page * TX_PER_PAGE);

  const handleDelete = (id) => {
    if (window.confirm('Bu işlemi silmek istediğinden emin misin?')) {
      deleteTx(id);
      showToast('İşlem silindi', 'success');
    }
  };

  // Totals for filtered results
  const filteredIncome = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const filteredExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">İşlemler</div>
          <div className="page-sub">{total} işlem listeleniyor</div>
        </div>
        <button className="btn btn-purple" onClick={() => setModalOpen(true)}>＋ Yeni İşlem</button>
      </div>

      {/* Filter Stats Bar */}
      <div className="filter-stats-bar">
        <div className="filter-stat">
          <span className="filter-stat-icon">📊</span>
          <span className="filter-stat-label">Toplam</span>
          <span className="filter-stat-value">{total}</span>
        </div>
        <div className="filter-stat">
          <span className="filter-stat-icon">💚</span>
          <span className="filter-stat-label">Gelir</span>
          <span className="filter-stat-value income">{fmt(filteredIncome)}</span>
        </div>
        <div className="filter-stat">
          <span className="filter-stat-icon">🔴</span>
          <span className="filter-stat-label">Gider</span>
          <span className="filter-stat-value expense">{fmt(filteredExpense)}</span>
        </div>
        <div className="filter-stat">
          <span className="filter-stat-icon">💰</span>
          <span className="filter-stat-label">Net</span>
          <span className={`filter-stat-value ${filteredIncome - filteredExpense >= 0 ? 'income' : 'expense'}`}>
            {fmt(filteredIncome - filteredExpense)}
          </span>
        </div>
      </div>

      {/* Primary Filters */}
      <div className="tx-filters">
        <div className="filter-row-primary">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => { setFilter('all'); setPage(1); }}>Tümü</button>
          <button className={`filter-btn ${filter === 'INCOME' ? 'active' : ''}`} onClick={() => { setFilter('INCOME'); setPage(1); }}>💚 Gelir</button>
          <button className={`filter-btn ${filter === 'EXPENSE' ? 'active' : ''}`} onClick={() => { setFilter('EXPENSE'); setPage(1); }}>🔴 Gider</button>

          <div className="filter-search-wrap">
            <span className="filter-search-icon">🔍</span>
            <input className="filter-search" type="text" placeholder="İşlem ara..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>

          <button
            className={`filter-btn filter-advanced-toggle ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            ⚙️ {showAdvanced ? 'Filtreleri Gizle' : 'Gelişmiş Filtreler'}
          </button>

          {hasActiveFilters && (
            <button className="filter-btn filter-clear" onClick={clearAllFilters}>
              ✕ Temizle
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className={`advanced-filters-panel ${showAdvanced ? 'open' : ''}`}>
        <div className="adv-filter-grid">
          {/* Date Range */}
          <div className="adv-filter-group">
            <label className="adv-filter-label">📅 Tarih Aralığı</label>
            <div className="adv-filter-row">
              <input
                className="adv-filter-input"
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                placeholder="Başlangıç"
              />
              <span className="adv-filter-sep">→</span>
              <input
                className="adv-filter-input"
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                placeholder="Bitiş"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="adv-filter-group">
            <label className="adv-filter-label">💰 Tutar Aralığı</label>
            <div className="adv-filter-row">
              <input
                className="adv-filter-input"
                type="number"
                placeholder="Min ₺"
                min="0"
                value={amountMin}
                onChange={e => { setAmountMin(e.target.value); setPage(1); }}
              />
              <span className="adv-filter-sep">—</span>
              <input
                className="adv-filter-input"
                type="number"
                placeholder="Max ₺"
                min="0"
                value={amountMax}
                onChange={e => { setAmountMax(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {/* Category Multi-select */}
          <div className="adv-filter-group adv-filter-cats">
            <label className="adv-filter-label">🏷️ Kategoriler</label>
            <div className="cat-multiselect" ref={catDropdownRef}>
              <button
                className="cat-multiselect-trigger"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              >
                <span>
                  {catFilter.length === 0
                    ? 'Tüm Kategoriler'
                    : `${catFilter.length} kategori seçili`
                  }
                </span>
                <span className="cat-multiselect-arrow">{catDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {catDropdownOpen && (
                <div className="cat-multiselect-dropdown">
                  {CATEGORIES.map(c => (
                    <label key={c.id} className={`cat-multiselect-item ${catFilter.includes(c.id) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={catFilter.includes(c.id)}
                        onChange={() => toggleCat(c.id)}
                      />
                      <span className="cat-ms-icon" style={{ background: `${c.color}18` }}>{c.icon}</span>
                      <span className="cat-ms-name">{c.name}</span>
                      {catFilter.includes(c.id) && <span className="cat-ms-check">✓</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {catFilter.length > 0 && (
              <div className="cat-selected-tags">
                {catFilter.map(cid => {
                  const cat = getCat(cid);
                  return (
                    <span key={cid} className="cat-tag" onClick={() => toggleCat(cid)}>
                      {cat.icon} {cat.name} ✕
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tx-table-header">
          <span>İşlem</span>
          <span>Kategori</span>
          <span>Tarih</span>
          <span>Miktar</span>
          <span>İşlem</span>
        </div>
        <div>
          {!paged.length ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">İşlem bulunamadı</div>
              <div className="empty-text">Farklı bir filtre dene</div>
            </div>
          ) : paged.map(t => {
            const cat = getCat(t.categoryId);
            return (
              <div key={t.id} className="tx-table-row">
                <div className="tx-row-desc">
                  <div className="tx-row-icon" style={{ background: `${cat.color}20` }}>{cat.icon}</div>
                  <div>
                    <div className="tx-row-title">{t.description}</div>
                    <div className="tx-row-cat">{cat.name}</div>
                  </div>
                </div>
                <span>
                  <span className={`badge ${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                    {t.type === 'INCOME' ? 'Gelir' : 'Gider'}
                  </span>
                </span>
                <span style={{ fontSize: '13px', color: 'var(--t2)' }}>{fmtDate(t.date)}</span>
                <span className={`tx-amount ${t.type === 'INCOME' ? 'income' : 'expense'}`} style={{ fontSize: '14px' }}>
                  {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                </span>
                <div className="tx-actions">
                  <button className="action-btn action-edit" onClick={() => { setEditId(t.id); setModalOpen(true); }}>✏️</button>
                  <button className="action-btn action-del" onClick={() => handleDelete(t.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '13px', color: 'var(--t2)' }}>
          Sayfa {page} / {pages || 1} ({total} işlem)
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Önceki</button>
          <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Sonraki →</button>
        </div>
      </div>
    </div>
  );
}
