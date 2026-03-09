import React from 'react';

const Dashboard = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                Hoş Geldin, <span style={{ color: 'var(--accent-color)' }}>{user?.full_name?.split(' ')[0] || 'Kullanıcı'}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                İşte finansal durumunun bugünkü özeti. (1. Hafta Tamamlandı)
            </p>

            {/* 1. Hafta için Placeholder (Yer Tutucu) Kartları - Gerçeği İlerleyen Haftalarda Gelecek */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Net Bakiye Kartı Placeholder */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Toplam Net Bakiye</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₺0,00</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '0.5rem' }}>+ Gösterge Sonra Eklenecek</div>
                </div>

                <div style={{
                    background: 'rgba(30, 41, 59, 0.5)', border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)'
                }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💸</div>
                    <div style={{ textAlign: 'center' }}>Gelir/Gider kartları ilerleyen haftalarda eklenecek.</div>
                </div>

                <div style={{
                    background: 'rgba(30, 41, 59, 0.5)', border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)'
                }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📈</div>
                    <div style={{ textAlign: 'center' }}>Grafikler 5. haftada entegre edilecek.</div>
                </div>
            </div>

            <div style={{
                background: 'rgba(30, 41, 59, 0.7)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)', padding: '2rem', textAlign: 'center'
            }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Hafta Başarılı Şekilde Tamamlandı! 🎉</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Şu anda Kimlik Doğrulama süreçleri düzgün çalışıyor. Sol menüden projenin gelecek haftalarındaki vizyonunu görebilirsiniz.</p>
            </div>

        </div>
    );
};

export default Dashboard;
