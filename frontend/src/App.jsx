import React, { useState, useEffect } from 'react';
import Admin from './pages/Admin';
import Customer from './pages/Customer';
import Chatbot from './components/Chatbot';

import { 
  User, ShieldCheck, LogOut, Layout, Mail, Lock, 
  ArrowRight, CheckCircle, Sprout, AlertCircle, X, 
  Phone, MapPin, CreditCard, Globe, ChevronDown
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
  const [isLoginView, setIsLoginView] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- DİNAMİK VERİTABANI (Local Storage Destekli) ---
  const [usersDb, setUsersDb] = useState(() => {
    // Sayfa yenilense bile kayıtlı kullanıcıları hatırla
    const savedUsers = localStorage.getItem('ekoUsersDb');
    return savedUsers ? JSON.parse(savedUsers) : [
      { name: 'Sudegül Bayram', email: 'sude@eko.com', password: 'password123' }
    ];
  });

  // Yeni kullanıcı eklendiğinde bunu tarayıcının hafızasına kaydet
  useEffect(() => {
    localStorage.setItem('ekoUsersDb', JSON.stringify(usersDb));
  }, [usersDb]);
  // ----------------------------------------------------

  const [regData, setRegData] = useState({ name: '', email: '', password: '', confirmPassword: '', agreeTerms: false });
  const [regErrors, setRegErrors] = useState({});
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogin = (role) => {
    if (!loginData.email || !loginData.password) {
      setLoginError("E-posta ve şifre gereklidir.");
      return;
    }

    if (role === 'admin') {
      if (loginData.email === 'admin@ekosistem.ai' && loginData.password === 'admin123') {
        setUser({ role: 'admin', name: 'Sudegül Bayram (Yönetici)' });
        setIsAuthModalOpen(false);
        setNotification("Yönetici girişi başarılı.");
        setLoginError('');
      } else {
        setLoginError("Yönetici bilgileri hatalı!");
      }
    } else {
      const foundUser = usersDb.find(u => u.email === loginData.email && u.password === loginData.password);
      if (foundUser) {
        setUser({ role: 'customer', name: foundUser.name });
        setIsAuthModalOpen(false);
        setNotification(`Hoş geldin, ${foundUser.name}!`);
        setLoginError('');
      } else {
        setLoginError("Müşteri hesabı bulunamadı veya şifre hatalı.");
      }
    }
  };

  const logout = () => {
    setUser(null);
    setIsDropdownOpen(false);
    setNotification("Güvenli çıkış yapıldı.");
    setIsAuthModalOpen(true); 
  };

  const handleRegInput = (field, value) => {
    setRegData(prev => ({ ...prev, [field]: value }));
    let errorMsg = "";

    if (field === 'name' && value.length > 0 && value.length < 5) errorMsg = "Ad Soyad en az 5 karakter olmalıdır.";
    else if (field === 'email' && value.length > 0) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const domainTypoRegex = /@(gmal|hotmal|yaho|outlok)\./; 

      if (!emailRegex.test(value)) errorMsg = "Lütfen geçerli bir e-posta formatı girin.";
      else if (value.endsWith('.co')) errorMsg = "Uzantı hatası: '.com' yazmak istediğinizden emin olun.";
      else if (domainTypoRegex.test(value)) errorMsg = "E-posta sağlayıcısını hatalı yazdınız (Örn: gmal değil gmail).";
      else if (usersDb.some(u => u.email.toLowerCase() === value.toLowerCase())) errorMsg = "Bu e-posta adresi zaten kullanımda.";
    } 
    else if (field === 'password' && value.length > 0 && value.length < 8) errorMsg = "Şifreniz en az 8 karakter olmalıdır.";
    else if (field === 'confirmPassword' && value !== regData.password) errorMsg = "Şifreler eşleşmiyor.";

    setRegErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  const isRegFormValid = 
    regData.name.length >= 5 && 
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(regData.email) && 
    !regData.email.endsWith('.co') &&
    !/@(gmal|hotmal|yaho|outlok)\./.test(regData.email) &&
    !usersDb.some(u => u.email.toLowerCase() === regData.email.toLowerCase()) &&
    regData.password.length >= 8 && 
    regData.password === regData.confirmPassword && 
    regData.agreeTerms;

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (isRegFormValid) {
      setUsersDb([...usersDb, { name: regData.name, email: regData.email, password: regData.password }]);
      setNotification("Kaydınız başarıyla oluşturuldu! 🎉");
      setIsLoginView(true);
      setRegData({ name: '', email: '', password: '', confirmPassword: '', agreeTerms: false });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      
      {notification && (
        <div style={notificationStyle}><CheckCircle size={18} color="#10b981" /><span>{notification}</span></div>
      )}

      {/* NAVBAR */}
      <nav style={navbarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layout color="#059669" size={24} /><strong style={{ fontSize: '20px' }}>eko<span style={{color:'#059669'}}>portal</span></strong>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          {user ? (
            <div 
              style={{ position: 'relative', cursor: 'pointer' }}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div style={userGreetingStyle}>
                <span>Hoş geldin, <b style={{color:'#1e293b'}}>{user.name}</b></span>
                <ChevronDown size={16} />
              </div>
              
              {isDropdownOpen && (
                <div style={dropdownMenuStyle}>
                  {user.role === 'customer' && (
                    <div style={dropdownItemStyle} onClick={() => { logout(); setIsLoginView(false); }}>
                      <User size={14} /> Hesap Değiştir
                    </div>
                  )}
                  <div style={{...dropdownItemStyle, color: '#ef4444', borderTop: user.role === 'customer' ? '1px solid #f1f5f9' : 'none'}} onClick={logout}>
                    <LogOut size={14} /> Çıkış Yap
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} style={loginNavBtnStyle}>Giriş Yap</button>
          )}
        </div>
      </nav>

      <div style={{ flex: 1 }}>
        {user?.role === 'admin' ? <Admin /> : <Customer user={user} openAuth={() => setIsAuthModalOpen(true)} />}
      </div>

      {/* --- DİNAMİK İSİM İÇİN userName EKLENDİ --- */}
      <Chatbot userRole={user?.role} userName={user?.name} assistantName="Eko-Rehber" />

      {/* SOFT SAGE FOOTER */}
      <footer style={footerContainer}>
        <div style={footerContent}>
          <div style={footerSection}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <Sprout color="#059669" size={24} />
              <span style={{ fontWeight: '800', fontSize: '19px', color: '#064e3b' }}>Eko-Sistem AI</span>
            </div>
            <p style={footerSlogan}>Sürdürülebilir üretim ve kooperatif dayanışması için dijital operasyon merkezi.</p>
          </div>
          <div style={footerSection}>
            <h4 style={footerHeading}>Kurumsal</h4>
            <div style={footerLinks}><span>Hakkımızda</span><span>Kooperatiflerimiz</span><span>KVKK Aydınlatma</span></div>
          </div>
          <div style={footerSection}>
            <h4 style={footerHeading}>İletişim</h4>
            <div style={contactItem}><Mail size={14} color="#059669" /> destek@ekosistem.ai</div>
            <div style={contactItem}><Phone size={14} color="#059669" /> 0850 555 00 00</div>
          </div>
          <div style={footerSection}>
            <h4 style={footerHeading}>Güvenlik</h4>
            <div style={securityBadge}>
              <CreditCard size={18} color="#059669" />
              <div style={{display:'flex', flexDirection:'column'}}>
                <span style={{fontSize:'10px', fontWeight:'800', color:'#064e3b'}}>PCI-DSS SECURE</span>
                <span style={{fontSize:'9px', color:'#6d8a83'}}>256-Bit SSL Protected</span>
              </div>
            </div>
          </div>
        </div>
        <div style={footerBottom}>
          <p>© 2026 Eko-Sistem AI — <b>Sudegül Bayram</b></p>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {isAuthModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={authCardStyle}>
            <button onClick={() => setIsAuthModalOpen(false)} style={closeBtnStyle}><X size={20}/></button>
            {isLoginView ? (
              <div>
                <h2 style={{ color: '#1e293b', marginBottom: '15px' }}>Giriş Yap</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="email" placeholder="E-posta" style={inputStyle} value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} />
                  <input type="password" placeholder="Şifre" style={inputStyle} value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
                  {loginError && <span style={errorTextStyle}>{loginError}</span>}
                  <button onClick={() => handleLogin('customer')} style={customerBtnStyle}>Müşteri Girişi</button>
                  <button onClick={() => handleLogin('admin')} style={adminBtnStyle}>Yönetici Girişi</button>
                </div>
                <p style={{ marginTop: '20px', fontSize: '13px' }}>Henüz bir hesabınız yok mu? <span style={linkStyle} onClick={() => { setIsLoginView(false); setLoginError(''); }}>Kaydolun.</span></p>
              </div>
            ) : (
              <div>
                <h2 style={{ color: '#1e293b', marginBottom: '15px' }}>Yeni Hesap Oluştur</h2>
                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign:'left' }}>
                  <div><input type="text" placeholder="Ad Soyad" style={inputStyle} value={regData.name} onChange={(e) => handleRegInput('name', e.target.value)} />{regErrors.name && <span style={errorTextStyle}>{regErrors.name}</span>}</div>
                  <div><input type="email" placeholder="E-posta" style={inputStyle} value={regData.email} onChange={(e) => handleRegInput('email', e.target.value)} />{regErrors.email && <span style={errorTextStyle}>{regErrors.email}</span>}</div>
                  <div><input type="password" placeholder="Şifre (Min. 8 Karakter)" style={inputStyle} value={regData.password} onChange={(e) => handleRegInput('password', e.target.value)} />{regErrors.password && <span style={errorTextStyle}>{regErrors.password}</span>}</div>
                  <div><input type="password" placeholder="Şifreyi Doğrula" style={inputStyle} value={regData.confirmPassword} onChange={(e) => handleRegInput('confirmPassword', e.target.value)} />{regErrors.confirmPassword && <span style={errorTextStyle}>{regErrors.confirmPassword}</span>}</div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', cursor: 'pointer', marginTop:'10px' }}>
                    <input type="checkbox" checked={regData.agreeTerms} onChange={(e) => setRegData({...regData, agreeTerms: e.target.checked})} style={{accentColor:'#059669', marginTop:'3px'}} />
                    <span style={{color:'#64748b'}}><strong style={{color:'#1e293b'}}>Kullanıcı Sözleşmesi</strong> ve <strong style={{color:'#1e293b'}}>KVKK Metni</strong>'ni okudum, kabul ediyorum.</span>
                  </label>
                  <button type="submit" disabled={!isRegFormValid} style={{...customerBtnStyle, opacity: isRegFormValid ? 1 : 0.5, marginTop:'15px'}}>Kayıt Ol</button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '13px' }}>Zaten bir hesabınız var mı? <span style={linkStyle} onClick={() => setIsLoginView(true)}>Giriş Yapın.</span></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// STİLLER
const navbarStyle = { padding: '0 8%', height: '80px', background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 };
const loginNavBtnStyle = { background: '#1e293b', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' };
const userGreetingStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563', padding: '8px 12px', borderRadius: '10px', transition: '0.2s', background: '#f8fafc' };
const dropdownMenuStyle = { position: 'absolute', top: '100%', right: 0, width: '200px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '8px', zIndex: 200 };
const dropdownItemStyle = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', fontSize: '13px', borderRadius: '10px', color: '#475569', transition: '0.2s', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const authCardStyle = { position: 'relative', background: 'white', padding: '40px', borderRadius: '32px', textAlign: 'center', width: '380px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline:'none', backgroundColor:'#f8fafc' };
const customerBtnStyle = { background: '#059669', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', width: '100%', cursor:'pointer' };
const adminBtnStyle = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', width: '100%', marginTop: '8px', fontSize:'13px' };
const linkStyle = { color: '#059669', fontWeight: 'bold', cursor: 'pointer' };
const errorTextStyle = { color: '#ef4444', fontSize: '11px', fontWeight:'bold', textAlign:'left', marginTop:'3px' };
const notificationStyle = { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1100, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' };
const closeBtnStyle = { position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' };
const footerContainer = { backgroundColor: '#f1f7f5', color: '#4a615c', padding: '70px 8% 40px', borderTop: '4px solid #059669', marginTop:'60px' };
const footerContent = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '50px', marginBottom: '50px' };
const footerSection = { display: 'flex', flexDirection: 'column' };
const footerSlogan = { fontSize: '14px', lineHeight: '1.7', color: '#6d8a83', maxWidth: '280px', marginTop: '5px' };
const footerHeading = { fontSize: '13px', color: '#064e3b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' };
const footerLinks = { display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' };
const contactItem = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', marginBottom: '12px', color: '#4a615c' };
const securityBadge = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e1ede8', width: 'fit-content' };
const footerBottom = { textAlign: 'center', paddingTop: '30px', borderTop: '1px solid #e1ede8', fontSize: '13px', color: '#94a3b8', fontWeight: '500' };