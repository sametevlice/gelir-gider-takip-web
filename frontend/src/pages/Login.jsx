import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5050/api/auth/login', formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Giriş yapılırken bir hata oluştu. Sunucuya ulaşılamıyor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-split-bg">
            <div className="auth-overlay"></div>

            <div className="auth-content-wrapper">
                <div className="auth-left-pane">
                    <h1 className="auth-left-text">Great to<br />have you<br />back!</h1>
                </div>

                <div className="auth-right-pane">
                    <div className="auth-white-card">
                        <h2 className="auth-title">Sign in</h2>

                        <button type="button" className="social-btn">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="18" />
                            Continue with Google
                        </button>
                        <button type="button" className="social-btn">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" width="18" />
                            Continue with Apple
                        </button>
                        <button type="button" className="social-btn">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" width="18" />
                            Continue with Facebook
                        </button>

                        <div className="auth-divider">or</div>

                        {error && <div className="error-msg">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="auth-label">
                                <label htmlFor="email">Username or Email</label>
                                <a href="#">Remind me</a>
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="auth-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <div className="auth-label">
                                <label htmlFor="password">Password</label>
                                <a href="#">Forgot</a>
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="auth-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <button type="submit" className="btn-green" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            New here? <Link to="/register">Create an account</Link>
                        </div>

                        <div className="auth-terms-text">
                            Application collects and uses personal data in accordance with our <a href="#">Privacy Policy</a>. By creating an account, you agree to our <a href="#">User Terms</a>, including our <a href="#">Fair Use Policy</a>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
