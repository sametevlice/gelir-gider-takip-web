import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const login = useStore(state => state.login);
  const register = useStore(state => state.register);
  const showToast = useStore(state => state.showToast);

  const [email, setEmail] = useState('demo@fintech.app');
  const [pass, setPass] = useState('demo1234');
  const [name, setName] = useState('');
  
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');

  const handleLogin = () => {
    setEmailErr('');
    setPassErr('');
    if (!email.trim()) return setEmailErr('E-posta gerekli');
    if (pass.length < 6) return setPassErr('En az 6 karakter');
    
    login(email, pass);
  };

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || pass.length < 8) {
      return showToast('Tüm alanları doldurun (şifre min. 8)', 'error');
    }
    register(name, email, pass);
  };

  return (
    <div id="auth-screen">
      <div className="auth-bg">
        <div className="auth-orb auth-orb1"></div>
        <div className="auth-orb auth-orb2"></div>
      </div>
      
      {isLogin ? (
        <div className="auth-box">
          <div className="auth-logo">
            <div className="auth-logo-icon">F</div>
            <span>Fin<em>Tech</em>.</span>
          </div>
          <h2 className="auth-title">Tekrar hoş geldin 👋</h2>
          <p className="auth-sub">Hesabına giriş yap ve finansını kontrol et</p>
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input className="form-input" type="email" placeholder="ornek@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            {emailErr && <span className="form-error" style={{ display: 'block' }}>{emailErr}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input className="form-input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
            {passErr && <span className="form-error" style={{ display: 'block' }}>{passErr}</span>}
          </div>
          <button className="btn-primary" onClick={handleLogin}>Giriş Yap →</button>
          <p className="auth-switch">Hesabın yok mu? <a onClick={() => setIsLogin(false)}>Kayıt Ol</a></p>
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--t3)' }}>Demo: demo@fintech.app / demo1234</p>
        </div>
      ) : (
        <div className="auth-box">
          <div className="auth-logo">
            <div className="auth-logo-icon">F</div>
            <span>Fin<em>Tech</em>.</span>
          </div>
          <h2 className="auth-title">Hesap oluştur ✨</h2>
          <p className="auth-sub">Finansal özgürlüğüne ilk adım</p>
          <div className="form-group">
            <label className="form-label">Ad Soyad</label>
            <input className="form-input" type="text" placeholder="Adın Soyadın" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input className="form-input" type="email" placeholder="ornek@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input className="form-input" type="password" placeholder="Min. 8 karakter" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={handleRegister}>Hesap Oluştur →</button>
          <p className="auth-switch">Zaten hesabın var mı? <a onClick={() => setIsLogin(true)}>Giriş Yap</a></p>
        </div>
      )}
    </div>
  );
}
