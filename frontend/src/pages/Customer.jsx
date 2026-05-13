import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Search, CheckCircle, Truck, MapPin, Star, CreditCard, User, Home, ArrowRight, Leaf, AlertCircle, Filter, Sparkles, Sprout } from 'lucide-react';

// DIKKAT: Props olarak 'user' ve 'openAuth' alıyoruz (App.jsx'ten geliyor)
export default function Customer({ user, openAuth }) {
  const [view, setView] = useState('shop'); 
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({ card: '', cvv: '', expiry: '', address: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [products, setProducts] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (view === 'orders' && user?.email) {
      setLoadingOrders(true);
      fetch(`http://localhost:8000/api/orders/${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setUserOrders(data);
          setLoadingOrders(false);
        })
        .catch((err) => {
          console.error("Siparişler yüklenemedi:", err);
          setLoadingOrders(false);
        });
    }
  }, [view, user?.email]);

  const handleCancelOrder = (orderId) => {
    if (window.confirm(`Sipariş #${orderId} iptal edilecek. Emin misiniz?`)) {
      fetch(`http://localhost:8000/api/orders/${orderId}/cancel`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
          setNotification(`Sipariş #${orderId} iptal edildi. 🛑`);
          // Refresh orders
          fetch(`http://localhost:8000/api/orders/${user.email}`)
            .then(res => res.json())
            .then(data => setUserOrders(data));
        })
        .catch(err => console.error("İptal hatası:", err));
    }
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart(item);
    });
    setNotification("Eski siparişinizdeki ürünler sepete eklendi! 🛒");
    setView('cart');
  };

  const fillMockData = () => {
    setPaymentInfo({
      card: '4242 4242 4242 4242',
      expiry: '12/28',
      cvv: '123',
      address: 'Merkez Mah. Ataturk Cad. No:123 Kadikoy, Istanbul'
    });
    setErrors({});
    setNotification("Ödeme bilgileri otomatik dolduruldu! 💳");
  };

  const normalizeText = (str) => str.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').trim();
  const getLevenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
        else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  };

  const filteredProducts = products.filter(p => normalizeText(p.name).includes(normalizeText(searchTerm)));
  const findSuggestion = () => {
    if (searchTerm.length < 2) return null;
    let bestMatch = null;
    let minDistance = 4;
    products.forEach(p => {
      const distance = getLevenshteinDistance(normalizeText(searchTerm), normalizeText(p.name).substring(0, searchTerm.length + 2));
      if (distance < minDistance) { minDistance = distance; bestMatch = p.name; }
    });
    return bestMatch;
  };
  const suggestion = filteredProducts.length === 0 ? findSuggestion() : null;

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setNotification(`${product.name} sepete eklendi! 🛒`);
  };

  const handlePaymentInput = (field, value) => {
    let raw = value.replace(/\D/g, ''); 
    let errorMsg = "";

    if (field === 'card') {
      const val = raw.slice(0, 16);
      const masked = val.match(/.{1,4}/g)?.join(' ') || val;
      setPaymentInfo(prev => ({ ...prev, card: masked }));
      if (val.length > 0 && val.length < 16) errorMsg = "16 hane gerekli.";
    } 
    else if (field === 'expiry') {
      const val = raw.slice(0, 4);
      let masked = val;
      if (val.length >= 2) masked = val.slice(0, 2) + '/' + val.slice(2);
      setPaymentInfo(prev => ({ ...prev, expiry: masked }));

      if (val.length === 4) {
        const m = parseInt(val.slice(0, 2));
        const y = parseInt("20" + val.slice(2, 4));
        const curY = 2026; 
        const curM = 5;    

        if (m < 1 || m > 12) errorMsg = "Geçersiz ay (01-12).";
        else if (y < curY || (y === curY && m < curM)) errorMsg = "Kartın süresi dolmuş!";
      } else if (val.length > 0) {
        errorMsg = "AA/YY formatında girin.";
      }
    } 
    else if (field === 'cvv') {
      const val = raw.slice(0, 3);
      setPaymentInfo(prev => ({ ...prev, cvv: val }));
      if (val.length > 0 && val.length < 3) errorMsg = "3 hane gerekli.";
    } 
    else if (field === 'address') {
      setPaymentInfo(prev => ({ ...prev, address: value }));
      if (value.length > 0 && value.length < 15) errorMsg = "Lütfen tam adres yazın.";
    }

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  const totalPrice = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const isFormValid = paymentInfo.card.replace(/\s/g, '').length === 16 && paymentInfo.cvv.length === 3 && paymentInfo.expiry.length === 5 && paymentInfo.address.length >= 15 && Object.values(errors).every(x => x === "");
const createOrder = () => {
  const orderData = {
    id: Date.now(),
    user_email: user?.email || "zeynepmrv741@gmail.com",
    items: cart,
    total: totalPrice,
    address: paymentInfo.address,
  };

  fetch("http://localhost:8000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((res) => res.json())
    .then(() => {
      setCart([]);
      setView("success");
    })
    .catch((err) => {
      console.log(err);
      alert("Sipariş oluşturulurken hata oluştu.");
    });
};
  // --- KRİTİK NOKTA: GİRİŞ KONTROLÜ (GUARD) ---
  const handleProtectedAction = (actionView) => {
    if (!user) {
      openAuth(); // Kullanıcı giriş yapmamışsa, App.jsx'teki Pop-up'ı açar.
    } else {
      setView(actionView); // Giriş yapmışsa sayfaya yönlendirir.
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fcfdfd', position: 'relative' }}>
      
      {notification && (
        <div style={notificationStyle}>
          <div style={notifProgress}></div>
          <Sparkles size={18} color="#f59e0b" />
          <span>{notification}</span>
        </div>
      )}

      {/* --- GÜNCELLENMİŞ ALT MENÜ --- */}
      <div style={subNavbar}>
        <button onClick={() => setView('shop')} style={view === 'shop' ? activeTab : inactiveTab}>Mağaza</button>
        <button onClick={() => handleProtectedAction('orders')} style={view === 'orders' ? activeTab : inactiveTab}>Siparişlerim</button>
        <button onClick={() => setView('cart')} style={view === 'cart' ? activeTab : inactiveTab}>
          Sepetim <span style={cartCount}>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {view === 'shop' && (
          <div>
            <div style={heroBanner}>
              <div style={heroAnimatedBg}></div>
              <div style={heroOverlay}></div>
              <div style={heroContent}>
                <span style={heroBadge} className="hero-anim"><Sprout size={14} /> Üreticilerimizin Emeğiyle İlmek İlmek</span>
                <h2 style={heroTitle} className="hero-anim">Emeğin Bereketini <br /> Teknolojiyle Buluşturuyoruz</h2>
                <p style={heroSubtitle} className="hero-anim">Üretim sürecimizin kalbinde yer alan üreticilerimizin alın terini, modern teknolojimizle tüm Türkiye'ye ulaştırıyoruz.</p>
                <button style={heroBtn} onClick={() => document.getElementById('market').scrollIntoView({behavior: 'smooth'})}>Hemen Keşfet</button>
              </div>
            </div>

            <div id="market" style={{ padding: '40px 5%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{fontSize: '24px', color: '#1e293b'}}>Öne Çıkan Lezzetler</h3>
                <div style={searchBar}><Search size={18}/><input style={{border:'none', outline:'none', background:'transparent'}} placeholder="Ürün ara..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}/></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                  <div key={p.id} style={productCard} className="product-card">
                    <div style={productBadge}>{p.tag}</div>
                    <div style={{ fontSize: '70px', margin: '20px 0' }}>{p.img}</div>
                    <h4 style={{ fontSize: '18px', color: '#1e293b' }}>{p.name}</h4>
                    <p style={{ color: '#059669', fontWeight: 'bold', fontSize: '22px' }}>{p.price} TL</p>
                    <button onClick={() => addToCart(p)} style={addBtn}>Sepete Ekle</button>
                  </div>
                )) : (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
                    <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                    <p>Ürün bulunamadı.</p>
                    {suggestion && <p>Şunu mu demek istediniz: <strong style={{color:'#059669', cursor:'pointer', textDecoration:'underline'}} onClick={()=>setSearchTerm(suggestion)}>{suggestion}</strong></p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'cart' && (
          <div style={{padding: '40px 5%'}}>
            <div style={containerNarrow}>
              <h3>Alışveriş Sepetiniz</h3>
              {cart.length === 0 ? <p>Sepetiniz şu an boş.</p> : (
                <>
                  {cart.map((item, i) => (
                    <div key={i} style={cartItem}>
                      <span>{item.name} <strong>(x{item.quantity})</strong></span>
                      <strong>{item.price * item.quantity} TL</strong>
                    </div>
                  ))}
                  <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <h4>Toplam: {totalPrice} TL</h4>
                    {/* --- GÜNCELLENMİŞ ÖDEMEYE GEÇ BUTONU --- */}
                    <button style={primaryBtn} onClick={() => handleProtectedAction('checkout')}>
                      Ödeme Adımına Geç <ArrowRight size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {view === 'checkout' && (
          <div style={{padding: '40px 5%'}}>
            <div style={containerNarrow}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}><CreditCard size={20} /> Güvenli Ödeme</h3>
                <button 
                  onClick={fillMockData}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Hızlı Doldur ⚡
                </button>
              </div>
              
              <div style={cardForm}>
                <div style={{ ...inputGroup, borderColor: errors.address ? '#ef4444' : '#eee' }}><Home size={18} color="#9ca3af" /> <input type="text" placeholder="Teslimat Adresi" value={paymentInfo.address} onChange={(e) => handlePaymentInput('address', e.target.value)} style={input} /></div>{errors.address && <span style={errorText}>{errors.address}</span>}
                <div style={{ ...inputGroup, borderColor: errors.card ? '#ef4444' : '#eee' }}><CreditCard size={18} color="#9ca3af" /> <input type="text" placeholder="0000 0000 0000 0000" value={paymentInfo.card} onChange={(e) => handlePaymentInput('card', e.target.value)} style={{ ...input, letterSpacing: '2px', fontWeight: 'bold' }} /></div>{errors.card && <span style={errorText}>{errors.card}</span>}
                <div style={{ display: 'flex', gap: '10px' }}><div style={{ flex: 1 }}><div style={{ ...inputGroup, borderColor: errors.expiry ? '#ef4444' : '#eee' }}><input type="text" placeholder="AA/YY" value={paymentInfo.expiry} onChange={(e) => handlePaymentInput('expiry', e.target.value)} style={input} /></div>{errors.expiry && <span style={errorText}>{errors.expiry}</span>}</div><div style={{ flex: 1 }}><div style={{ ...inputGroup, borderColor: errors.cvv ? '#ef4444' : '#eee' }}><input type="text" placeholder="CVV" value={paymentInfo.cvv} onChange={(e) => handlePaymentInput('cvv', e.target.value)} style={input} /></div>{errors.cvv && <span style={errorText}>{errors.cvv}</span>}</div></div>
                
                <div style={totalSummary}>Ödenecek Tutar: <strong>{totalPrice} TL</strong></div>
                
                <button style={{ ...payBtn, opacity: !isFormValid ? 0.6 : 1, cursor: isFormValid ? 'pointer' : 'not-allowed' }} disabled={!isFormValid} onClick={createOrder}>
                  {isFormValid ? "Ödemeyi Tamamla" : "Bilgileri Kontrol Edin"}
                </button>

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <CheckCircle size={12} color="#059669" /> 256-bit SSL ve PCI-DSS Güvencesi
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'success' && (
          <div style={{ textAlign: 'center', padding: '100px 5%' }}>
            <CheckCircle size={80} color="#059669" style={{ marginBottom: '20px' }} />
            <h2 style={{ color: '#064e3b' }}>Siparişiniz Alındı!</h2>
            <p>Üreticilerimize siparişin düştü bile. Takibe tıkla.</p>
            <button style={secondaryBtn} onClick={() => setView('orders')}>Siparişimi Takip Et</button>
          </div>
        )}

        {view === 'orders' && (
          <div style={{ padding: '40px 5%', maxWidth: '700px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Aktif Siparişlerim</h3>
            
            {loadingOrders ? (
              <p>Siparişleriniz yükleniyor...</p>
            ) : userOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: '1px solid #eee' }}>
                <Package size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
                <p>Henüz bir siparişiniz bulunmuyor.</p>
                <button style={secondaryBtn} onClick={() => setView('shop')}>Alışverişe Başla</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {userOrders.map((order) => (
                  <div key={order.id} style={orderCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <strong>Sipariş #{order.id}</strong>
                      <span style={{ 
                        color: order.status === 'İptal Edildi' ? '#ef4444' : '#059669', 
                        fontWeight: 'bold' 
                      }}>
                        {order.status}
                      </span>
                    </div>
                    
                    {order.status !== 'İptal Edildi' ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={step}><CheckCircle size={20} color="#059669"/><br />Onay</div>
                        <div style={step}><Package size={20} color={(order.status === 'Yolda' || order.status === 'Teslim Edildi' || order.status === 'Hazırlanıyor') ? "#059669" : "#9ca3af"}/><br />Hazırlık</div>
                        <div style={step}><Truck size={20} color={(order.status === 'Yolda' || order.status === 'Teslim Edildi') ? "#059669" : "#9ca3af"}/><br />Yolda</div>
                        <div style={{ ...step, color: order.status === 'Teslim Edildi' ? '#059669' : '#9ca3af' }}><MapPin size={20} /><br />Teslim</div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center' }}>Bu sipariş iptal edilmiştir.</p>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        <strong>Detay:</strong> {order.shipping_details}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {order.status === 'Hazırlanıyor' && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            style={{ padding: '8px 15px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            Siparişi İptal Et
                          </button>
                        )}
                        
                        {(order.status === 'İptal Edildi' || order.status === 'Teslim Edildi') && (
                          <button 
                            onClick={() => handleReorder(order)}
                            style={{ padding: '8px 15px', background: '#dcfce7', color: '#059669', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ShoppingCart size={14} /> Yeniden Sipariş Et
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- STİLLER ---
const heroBanner = { position: 'relative', height: '450px', borderRadius: '0 0 50px 50px', marginBottom: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 8%' };
const heroAnimatedBg = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1400")', backgroundSize: 'cover', backgroundPosition: 'center', animation: 'kenBurnsEffect 20s infinite alternate ease-in-out', zIndex: 0 };
const heroOverlay = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, rgba(6, 78, 59, 0.9) 0%, rgba(6, 78, 59, 0.4) 100%)', zIndex: 1 };
const heroContent = { position: 'relative', zIndex: 2, maxWidth: '700px', color: 'white' };
const heroBadge = { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '6px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px', width: 'fit-content' };
const heroTitle = { fontSize: '48px', margin: '0 0 15px 0', lineHeight: '1.1' };
const heroSubtitle = { fontSize: '18px', marginBottom: '30px', opacity: 0.9 };
const heroBtn = { background: 'white', color: '#064e3b', border: 'none', padding: '12px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const subNavbar = { display: 'flex', justifyContent: 'center', gap: '15px', padding: '15px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10 };
const activeTab = { padding: '10px 25px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const inactiveTab = { padding: '10px 25px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' };
const cartCount = { background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', marginLeft: '5px' };
const productCard = { background: 'white', padding: '30px', borderRadius: '24px', textAlign: 'center', border: '1px solid #f1f5f9', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const productBadge = { position: 'absolute', top: '15px', right: '15px', background: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' };
const searchBar = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', padding: '10px 20px', borderRadius: '15px' };
const addBtn = { width: '100%', padding: '14px', marginTop: '15px', background: '#059669', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold' };
const notificationStyle = { position: 'fixed', top: '90px', right: '20px', background: '#1e293b', color: 'white', padding: '16px 28px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', zIndex: 5000, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', animation: 'slideIn 0.4s ease' };
const notifProgress = { position: 'absolute', bottom: 0, left: 0, height: '4px', background: '#059669', borderRadius: '0 0 0 16px', width: '100%', animation: 'notifTime 3s linear forwards' };
const containerNarrow = { maxWidth: '500px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const cartItem = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' };
const primaryBtn = { background: '#059669', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' };
const secondaryBtn = { background: '#1e293b', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', marginTop: '20px' };
const cardForm = { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '12px', border: '2px solid #eee', padding: '12px', borderRadius: '12px', transition: '0.3s' };
const input = { border: 'none', outline: 'none', flex: 1, fontSize: '15px', background:'transparent' };
const payBtn = { background: '#2563eb', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' };
const totalSummary = { textAlign: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dotted #cbd5e1' };
const orderCard = { background: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #eee' };
const step = { textAlign: 'center', fontSize: '12px' };
const errorText = { color: '#ef4444', fontSize: '12px', marginTop: '-5px', marginBottom: '5px', fontWeight: 'bold' };
