import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  Bot, 
  Truck,
  ArrowRight,
  Users,
  Plus,
  Trash2,
  Download,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const cardStyle = { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const badgeStyle = (bg, col) => ({ backgroundColor: bg, color: col, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' });

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [brief, setBrief] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:8000/api/admin/stats").then(res => res.json()),
      fetch("http://localhost:8000/api/admin/daily-brief").then(res => res.json()),
      fetch("http://localhost:8000/api/admin/inventory/forecast").then(res => res.json()),
      fetch("http://localhost:8000/api/admin/orders").then(res => res.json())
    ]).then(([statsData, briefData, forecastsData, ordersData]) => {
      setStats(statsData);
      setBrief(briefData);
      setForecasts(forecastsData);
      setOrders(ordersData);
      setLoading(false);
    }).catch(err => {
      console.error("Veri çekme hatası:", err);
      setLoading(false);
    });
  }, []);

  const [admins, setAdmins] = useState([
    { id: 1, name: 'Sudegül Bayram', email: 'admin@ekosistem.ai', role: 'Kurucu Yönetici' }
  ]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Operatör' });

  const handleAddAdmin = () => {
    if (newAdmin.name && newAdmin.email) {
      setAdmins([...admins, { ...newAdmin, id: Date.now() }]);
      setNewAdmin({ name: '', email: '', role: 'Operatör' });
      alert("Sisteme yeni yetkili başarıyla eklendi! 🎉");
    }
  };

  const handleDownloadReport = () => {
    window.open("http://localhost:8000/api/admin/download-report", "_blank");
  };

  const SidebarItem = ({ label, id, icon }) => (
    <div 
      onClick={() => setActiveTab(id)} 
      style={{ 
        padding: '12px 20px', 
        cursor: 'pointer', 
        backgroundColor: activeTab === id ? '#3b82f6' : 'transparent', 
        borderRadius: '8px', 
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: '0.3s'
      }}>
      {icon} {label}
    </div>
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#64748b' }}>Yönetici Paneli Yükleniyor...</div>;

  return (
    <div className="admin-mobile-container" style={{ display: 'flex', flex: 1, minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      <aside className="admin-mobile-sidebar" style={{ width: '280px', backgroundColor: '#1e293b', color: 'white', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '30px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={28} /> Eko-Sistem AI
        </h2>
        <SidebarItem label="Dashboard" id="dashboard" icon={<LayoutDashboard size={20} />} />
        <SidebarItem label="Sipariş Yönetimi" id="orders" icon={<Package size={20} />} />
        <SidebarItem label="Stok & Envanter" id="stock" icon={<TrendingDown size={20} />} />
        <SidebarItem label="Yetkili Yönetimi" id="manage-admins" icon={<Users size={20} />} />
        
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #334155' }}>
           <button onClick={handleDownloadReport} style={{ width: '100%', background: '#059669', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
             <Download size={18} /> AI Raporu İndir
           </button>
        </div>
      </aside>

      <main className="admin-mobile-content" style={{ flex: 1, padding: '30px 40px' }}>
        
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Bugünkü Sipariş</span>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '5px' }}>{stats?.today_orders || 0}</div>
              </div>
              <div style={cardStyle}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Stok Uyarısı</span>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginTop: '5px' }}>{stats?.stock_warnings || 0}</div>
              </div>
              <div style={cardStyle}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Tarih</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="#3b82f6" /> {brief?.date}
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', margin: '0 0 10px 0' }}>
                <Bot size={20} /> Günlük Operasyon Özeti
              </h4>
              <p style={{ color: '#14532d', fontSize: '15px', lineHeight: '1.6' }}>{brief?.summary}</p>
              <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#166534' }}>Öncelikli Görevler:</h5>
                  {brief?.tasks.map((task, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '5px', color: '#14532d' }}>
                      <CheckCircle2 size={14} /> {task}
                    </div>
                  ))}
                </div>
                <div>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#166534' }}>Önerilen Lojistik Rotası:</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {brief?.optimized_route.map((point, idx) => (
                      <span key={idx} style={{ background: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', border: '1px solid #dcfce7' }}>
                        {point} {idx < brief.optimized_route.length - 1 && "→"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {stats?.ai_suggestions.map((sug, idx) => (
                <div key={idx} style={{ ...cardStyle, borderLeft: `5px solid ${sug.type === 'logistic' ? '#3b82f6' : '#f59e0b'}` }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: sug.type === 'logistic' ? '#1e40af' : '#92400e', margin: '0 0 10px 0' }}>
                    {sug.type === 'logistic' ? <Truck size={20} /> : <AlertTriangle size={20} />} {sug.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155' }}>{sug.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div style={cardStyle}>
            <h4 style={{ marginBottom: '20px' }}>Sistemdeki Tüm Siparişler</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left', color: '#6b7280', fontSize: '14px' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th>Müşteri</th>
                    <th>Toplam</th>
                    <th>Durum</th>
                    <th>Risk Skoru</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px' }}>#{order.id}</td>
                      <td>{order.user_email}</td>
                      <td>{order.total} TL</td>
                      <td>
                        <span style={badgeStyle(
                          order.status === 'Yolda' ? '#dcfce7' : order.status === 'Hazırlanıyor' ? '#fef9c3' : '#f3f4f6',
                          order.status === 'Yolda' ? '#166534' : order.status === 'Hazırlanıyor' ? '#854d0e' : '#374151'
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ color: order.risk_score > 0.5 ? '#ef4444' : '#059669', fontSize: '13px', fontWeight: 'bold' }}>
                        {order.risk_score > 0.5 && <AlertTriangle size={14} style={{ marginRight: '5px' }} />}
                        {Math.round(order.risk_score * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <h4 style={{ marginBottom: '15px' }}>AI Envanter Tahmini & Kritik Stoklar</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {forecasts.map((f, idx) => (
                  <div key={idx} style={{ 
                    padding: '15px', 
                    border: '1px solid #eee', 
                    borderRadius: '10px', 
                    backgroundColor: f.recommendation === 'Acil Sipariş' ? '#fef2f2' : 'white',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <strong style={{ color: f.recommendation === 'Acil Sipariş' ? '#991b1b' : '#1e293b' }}>{f.product}</strong>
                      <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                        Mevcut Stok: {f.current_stock} | Tahmini Kalan Süre: <b>{f.days_until_empty} gün</b>
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                       <span style={badgeStyle(f.recommendation === 'Acil Sipariş' ? '#fee2e2' : '#f1f5f9', f.recommendation === 'Acil Sipariş' ? '#991b1b' : '#475569')}>
                         {f.recommendation}
                       </span>
                       {f.recommendation === 'Acil Sipariş' && (
                         <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                           Sipariş Ver
                         </button>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...cardStyle, borderLeft: '5px solid #2563eb' }}>
              <h4 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 10px 0' }}>
                <Bot size={20} /> AI Otomatik Tedarik Analizi
              </h4>
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#334155' }}>
                Sistemimiz, kritik stok seviyesindeki ürünler için en yakın kooperatiflerden fiyat teklifi topladı. 
                <b> {forecasts.find(f => f.recommendation === 'Acil Sipariş')?.product || "Ürünler"}</b> için toplu alım yaparak %12 maliyet avantajı sağlayabilirsiniz.
              </p>
              <button style={{ marginTop: '10px', background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Tedarik Planını Onayla <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'manage-admins' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Yeni Yetkili Ekle</h4>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <input 
                  style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #d1d5db', flex: 1, outline: 'none', minWidth: '200px' }} 
                  placeholder="Ad Soyad" 
                  value={newAdmin.name} 
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})} 
                />
                <input 
                  style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #d1d5db', flex: 1, outline: 'none', minWidth: '200px' }} 
                  placeholder="E-posta Adresi" 
                  value={newAdmin.email} 
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} 
                />
                <select 
                  style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', flex: 1, minWidth: '200px' }} 
                  value={newAdmin.role} 
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                >
                  <option>Operatör</option>
                  <option>Lojistik Uzmanı</option>
                  <option>Sistem Yöneticisi</option>
                </select>
                <button 
                  onClick={handleAddAdmin} 
                  style={{ background: '#1e293b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <Plus size={18} /> Ekle
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Aktif Yetkililer</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left', color: '#6b7280', fontSize: '14px' }}>
                      <th style={{ padding: '12px' }}>Yetkili Personel</th>
                      <th>E-posta</th>
                      <th>Rol / Yetki</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(adm => (
                      <tr key={adm.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#1f2937' }}>{adm.name}</td>
                        <td style={{ color: '#6b7280', fontSize: '14px' }}>{adm.email}</td>
                        <td>
                          <span style={badgeStyle(adm.role === 'Kurucu Yönetici' ? '#dcfce7' : '#f3f4f6', adm.role === 'Kurucu Yönetici' ? '#166534' : '#374151')}>
                            {adm.role}
                          </span>
                        </td>
                        <td>
                          {adm.role !== 'Kurucu Yönetici' && (
                            <button 
                              onClick={() => setAdmins(admins.filter(a => a.id !== adm.id))}
                              style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}