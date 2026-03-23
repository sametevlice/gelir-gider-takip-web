import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marketData, setMarketData] = useState({
        usd: null,
        eur: null,
        btc: null,
        gold: null,
        loading: true
    });
    const navigate = useNavigate();

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:5050/api',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await axiosInstance.get('/transactions');
                setTransactions(res.data.transactions || []);
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchMarkets = async () => {
            try {
                // Ücretsiz public API'lerden kur ve kripto verileri
                const fiatRes = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                const usdTry = fiatRes.data.rates.TRY;
                const eurTry = usdTry / fiatRes.data.rates.EUR;

                const [btcRes, paxgRes] = await Promise.all([
                    axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
                    axios.get('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT')
                ]);

                const btcUsd = parseFloat(btcRes.data.price);
                const goldOzUsd = parseFloat(paxgRes.data.price);
                
                // 1 Ons Altın = 31.1034768 Gram.
                const gramGoldTry = (goldOzUsd / 31.1034768) * usdTry;

                setMarketData({
                    usd: usdTry,
                    eur: eurTry,
                    btc: btcUsd,
                    gold: gramGoldTry,
                    loading: false
                });
            } catch (err) {
                console.error("Piyasa verileri çekilemedi", err);
                setMarketData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchTransactions();
        fetchMarkets();
    }, [navigate]);

    // Hesaplamalar
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);
    const totalBalance = totalIncome - totalExpense;

    // Kategori Dağılımı (Sadece Giderler için)
    const categoryTotals = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
    });
    
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const categoryColors = ['var(--accent-color)', '#F59E0B', '#8B5CF6'];

    const recentTransactions = transactions.slice(0, 5);
    const budgetPercentage = totalIncome > 0 ? Math.min(Math.round((totalExpense / totalIncome) * 100), 100) : 0;

    // Son 6 Ayın İstatistikleri (Aylık Net Bakiye)
    const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const last6Months = [...Array(6)].map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
            monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
        };
    }).reverse();

    const monthlyStatsData = last6Months.map(m => {
        const monthTx = transactions.filter(t => t.date.startsWith(m.monthKey));
        const monthIncome = monthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        return {
            name: m.label,
            Gelir: monthIncome,
            Gider: monthExpense,
            Net: monthIncome - monthExpense
        };
    });

    // Harcama Trendi (Son 7 Gün)
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const spendingTrendData = last7Days.map(date => {
        const dayExpense = transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(date))
            .reduce((acc, t) => acc + parseFloat(t.amount), 0);
        return {
            name: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            tutar: dayExpense
        };
    });

    // Kategori Grafiği Verisi
    const categoryChartData = Object.entries(categoryTotals).map(([name, value]) => ({
        name: name.substring(0, 8) + (name.length > 8 ? '..' : ''), // Kısa isim
        tutar: value
    })).sort((a, b) => b.tutar - a.tutar).slice(0, 5);

    // Tarih Formatlayıcı
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Üst Kısım: İki Sütunlu Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
                {/* Sol Sütun (Ana Metrikler + Grafik) */}
                <div className="dash-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Toplam Bakiye</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                                    ₺{totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                {totalBalance >= 0 ? (
                                    <span className="stat-badge-green" style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '16px' }}>Pozitif</span>
                                ) : (
                                    <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '16px', background: 'var(--danger-bg)', color: 'var(--danger)' }}>Negatif</span>
                                )}
                            </div>
                        </div>
                        <button style={{ border: '1px solid var(--border-color)', background: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}>
                            💰 TR Lirası ▾
                        </button>
                    </div>

                    <div style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '1rem' }}>Aylık Net Bakiye (Son 6 Ay)</span>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                <span>1D</span><span style={{ color: 'var(--text-primary)', background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px' }}>6M</span><span>1Y</span><span>ALL</span>
                            </div>
                        </div>

                        {/* Canlı Grafik Alanı */}
                        <div style={{
                            height: '240px',
                            background: 'white',
                            borderBottom: '1px solid var(--border-color)',
                            position: 'relative',
                            paddingBottom: '10px'
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(val) => `₺${val}`} />
                                    <Tooltip 
                                        cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }} 
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
                                        formatter={(value, name) => [`₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, name]} 
                                    />
                                    <Area type="monotone" dataKey="Net" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {/* Sol Grafik: Harcama Trendi */}
                            <div>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: '600' }}>Harcama Trendi (Son 7 Gün)</h3>
                                <div style={{ height: '220px', width: '100%', background: '#F9FAFB', borderRadius: 'var(--border-radius-md)', padding: '10px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={spendingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(val) => `₺${val}`} />
                                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="tutar" fill="var(--accent-color)" radius={[4, 4, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Sağ Grafik: Kategoriler */}
                            <div>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: '600' }}>Kategori Harcamaları</h3>
                                <div style={{ height: '220px', width: '100%', background: '#F9FAFB', borderRadius: 'var(--border-radius-md)', padding: '10px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(val) => `₺${val}`} />
                                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="tutar" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sağ Sütun (Dağılım ve Bütçe Statüsü) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="dash-card">
                        <div className="dash-card-title">
                            Gider Dağılımı <Link to="/dashboard/transactions" style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>View All +</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1rem' }}>
                            {sortedCategories.length > 0 ? sortedCategories.map((cat, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: '600' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: categoryColors[idx % categoryColors.length] }}></div> {cat[0]}
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {((cat[1] / totalExpense) * 100).toFixed(1)}%
                                    </span>
                                    <span>₺{cat[1].toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )) : (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Henüz gider bulunmuyor.</div>
                            )}
                        </div>
                    </div>

                    <div className="dash-card">
                        <div className="dash-card-title">
                            Aylık Bütçe Durumu
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: '800' }}>{budgetPercentage}%</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: budgetPercentage > 80 ? 'var(--danger)' : '#F59E0B' }}>
                                {budgetPercentage > 80 ? 'Limit Aşımı Yakın' : 'Dikkatli Harcama'}
                            </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '4px', marginTop: '1rem', position: 'relative' }}>
                            <div style={{ width: `${budgetPercentage}%`, height: '100%', background: budgetPercentage > 80 ? 'var(--danger)' : 'linear-gradient(90deg, #10B981 0%, #F59E0B 100%)', borderRadius: '4px' }}></div>
                            <div style={{ position: 'absolute', left: `${budgetPercentage}%`, top: '-4px', width: '16px', height: '16px', background: '#111', borderRadius: '50%', border: '2px solid white', transform: 'translateX(-50%)' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            <span>Harcanan: ₺{totalExpense.toLocaleString('tr-TR')}</span><span>Toplam Gelir: ₺{totalIncome.toLocaleString('tr-TR')}</span>
                        </div>
                    </div>

                    {/* Canlı Piyasalar (Market Widget) */}
                    <div className="dash-card">
                        <div className="dash-card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🌍 Canlı Piyasalar
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {marketData.loading ? (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span> Fiyatlar güncelleniyor...
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', color: 'var(--text-primary)' }}><span style={{ fontSize: '1.2rem' }}>💵</span> Dolar / TL</div>
                                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₺{marketData.usd?.toFixed(2) || '---'}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', color: 'var(--text-primary)' }}><span style={{ fontSize: '1.2rem' }}>💶</span> Euro / TL</div>
                                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₺{marketData.eur?.toFixed(2) || '---'}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', color: 'var(--text-primary)' }}><span style={{ fontSize: '1.2rem' }}>🥇</span> Gram Altın</div>
                                        <div style={{ fontWeight: '700', color: 'var(--success)' }}>₺{marketData.gold?.toFixed(2) || '---'}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', color: 'var(--text-primary)' }}><span style={{ fontSize: '1.2rem' }}>₿</span> Bitcoin</div>
                                        <div style={{ fontWeight: '700', color: '#F59E0B' }}>${marketData.btc?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Alt Kısım: İşlemler Tablosu */}
            <div className="dash-card">
                <div className="dash-card-title" style={{ marginBottom: '1.5rem' }}>
                    Son Finansal İşlemler
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to="/dashboard/transactions" style={{ textDecoration: 'none' }}>
                            <button style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', color: 'var(--text-primary)' }}>
                                Tümünü Gör →
                            </button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>İşlemler yükleniyor...</div>
                ) : recentTransactions.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '1rem 0', width: '5%' }}></th>
                                <th style={{ padding: '1rem 0', width: '25%' }}>KATEGORİ</th>
                                <th style={{ padding: '1rem 0' }}>TUTAR</th>
                                <th style={{ padding: '1rem 0' }}>TARİH</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.map((tx) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1.2rem 0', color: tx.type === 'income' ? 'var(--success)' : '#F59E0B' }}>
                                        {tx.type === 'income' ? '↓' : '↑'}
                                    </td>
                                    <td style={{ fontWeight: '600' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {tx.category} 
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '400' }}>
                                                {tx.type === 'expense' ? 'Gider' : 'Gelir'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '600', color: tx.type === 'income' ? 'var(--success)' : 'inherit' }}>
                                        {tx.type === 'income' ? '+' : '-'}₺{parseFloat(tx.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(tx.date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Henüz işlem bulunmuyor.</div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
