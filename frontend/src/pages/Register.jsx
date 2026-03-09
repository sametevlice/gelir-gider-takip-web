import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Şifre eşleşme kontrolü
        if (formData.password !== formData.confirm_password) {
            return setError('Şifreler eşleşmiyor, lütfen kontrol ediniz.');
        }

        setIsLoading(true);

        try {
            // Backend api endpoitine istek at
            const response = await axios.post('http://localhost:5050/api/auth/register', {
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password
            });

            setSuccess('Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');

            // 2 saniye sonra login sayfasına yönlendir
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Kayıt olurken bir hata oluştu. Sunucu bağlantısını kontrol edin.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">FinansTakip</h1>
                <p className="auth-subtitle">Yeni bir hesap oluşturarak harcamalarınızı yönetmeye başlayın.</p>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="full_name">Ad Soyad</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            className="form-input"
                            placeholder="Örn: Ahmet Yılmaz"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">E-posta Adresi</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="ornek@posta.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Şifre</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirm_password">Şifre Tekrar</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '1rem' }}>
                        {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Zaten bir hesabınız var mı? <Link to="/login" style={{ fontWeight: '500' }}>Giriş Yapın</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
