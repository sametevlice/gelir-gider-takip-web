import React from 'react';

const TransactionList = ({ transactions, onDeleteTransaction, onEditTransaction }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>Henüz hiçbir kayıt bulunmuyor.</p>
                <p>İlk gelir veya giderinizi sol taraftaki formdan ekleyebilirsiniz.</p>
            </div>
        );
    }

    // Tarihleri güzel formatlamak için
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map((tx) => (
                <div key={tx.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.2rem 1.5rem',
                    marginBottom: '1rem',
                    background: '#FFFFFF',
                    border: '1px solid #F3F4F6',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                    {/* Sol Kısım: İkon + Detaylar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <div style={{
                            width: '50px', height: '50px', borderRadius: '14px',
                            backgroundColor: tx.type === 'income' ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            {tx.type === 'income' ? '↓' : '↑'}
                        </div>

                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{tx.category}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                <span>{formatDate(tx.date)}</span>
                                {tx.description && <span>• {tx.description}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Sağ Kısım: Tutar + Aksiyon Butonları */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            fontWeight: '800',
                            fontSize: '1.3rem',
                            color: tx.type === 'income' ? 'var(--success)' : 'var(--text-primary)'
                        }}>
                            {tx.type === 'income' ? '+' : '-'}₺{parseFloat(tx.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => onEditTransaction(tx)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    fontSize: '1.2rem',
                                    transition: 'color 0.2s',
                                }}
                                title="Düzenle"
                                onMouseOver={(e) => e.target.style.color = '#3b82f6'}
                                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                            >
                                ✎
                            </button>
                            <button
                                onClick={() => onDeleteTransaction(tx.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    fontSize: '1.4rem',
                                    transition: 'color 0.2s',
                                    lineHeight: 1
                                }}
                                title="Sil"
                                onMouseOver={(e) => e.target.style.color = 'var(--danger)'}
                                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TransactionList;
