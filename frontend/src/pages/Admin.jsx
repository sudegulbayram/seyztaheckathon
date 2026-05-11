import React, { useState } from 'react';
// Yeni eklenen özellikleri desteklemek için Users, Plus ve Trash2 ikonlarını ekledim
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
  Trash2
} from 'lucide-react';

const cardStyle = { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const badgeStyle = (bg, col) => ({ backgroundColor: bg, color: col, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' });

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- YENİ EKLENEN KISIM: Yetkili (Admin) Yönetimi State'leri ---
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
  // ---------------------------------------------------------------

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

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      {/* SOL SIDEBAR */}
      <aside style={{ width: '280px', backgroundColor: '#1e293b', color: 'white', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '30px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={28} /> Eko-Sistem AI
        </h2>
        <SidebarItem label="Dashboard" id="dashboard" icon={<LayoutDashboard size={20} />} />
        <SidebarItem label="Sipariş Yönetimi" id="orders" icon={<Package size={20} />} />
        <SidebarItem label="Stok & Envanter" id="stock" icon={<TrendingDown size={20} />} />
        {/* YENİ EKLENEN MENÜ */}
        <SidebarItem label="Yetkili Yönetimi" id="manage-admins" icon={<Users size={20} />} />
      </aside>

      {/* SAĞ İÇERİK */}
      <main style={{ flex: 1, padding: '30px 40px' }}>
        
        {/* DASHBOARD SEKMESİ */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={cardStyle}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Bugünkü Sipariş</span>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '5px' }}>24</div>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Stok Uyarısı</span>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginTop: '5px' }}>3</div>
            </div>
            
            {/* AI Operasyon Önerisi (Lojistik ve Rota Optimizasyonu) */}
            <div style={{ ...cardStyle, gridColumn: 'span 3', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e40af', margin: '0 0 10px 0' }}>
                <Truck size={20} /> AI Operasyon Önerisi
              </h4>
              <p style={{ margin: 0, color: '#1e3a8a' }}>
                Yarın için lojistik rotasını sabah 08:00'e planlamanızı öneririm. Bu sayede teslimat verimliliği %15 artacaktır.
              </p>
            </div>
          </div>
        )}

        {/* SİPARİŞ YÖNETİMİ SEKMESİ */}
        {activeTab === 'orders' && (
          <div style={cardStyle}>
            <h4 style={{ marginBottom: '20px' }}>Son Sipariş Analizi</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left', color: '#6b7280', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th>Müşteri</th>
                  <th>Durum</th>
                  <th>AI Risk Analizi</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px' }}>#1285</td>
                  <td>Ayşegül Kılıç</td>
                  <td><span style={badgeStyle('#fee2e2', '#991b1b')}>Gecikme Riski</span></td>
                  <td style={{ color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertTriangle size={14} /> Kargo yoğunluğu tespit edildi.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* STOK & ENVANTER SEKMESİ */}
        {activeTab === 'stock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <h4 style={{ marginBottom: '15px' }}>Kritik Stok Seviyeleri </h4>
              <div style={{ padding: '15px', border: '1px solid #fee2e2', borderRadius: '10px', backgroundColor: '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#991b1b' }}>Domates (Organik)</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#b91c1c' }}>Mevcut: 42 kg / Eşik: 50 kg </p>
                </div>
                <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  Sipariş Ver
                </button>
              </div>
            </div>

            {/* AI Tedarik Önerisi */}
            <div style={{ ...cardStyle, borderLeft: '5px solid #2563eb' }}>
              <h4 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 10px 0' }}>
                <Bot size={20} /> AI Otomatik Yenileme Önerisi
              </h4>
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Geçmiş satış verilerine göre Domates stoklarının yarın tükenmesi öngörülüyor. 
                Sistemin <b>100 kg ek sipariş</b> oluşturması ve tedarikçiye taslak mail hazırlaması onayınızı bekliyor.
              </p>
              <button style={{ marginTop: '10px', background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Onayla ve Gönder <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* --- YENİ EKLENEN KISIM: YETKİLİ YÖNETİMİ SEKMESİ --- */}
        {activeTab === 'manage-admins' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Yönetici Ekleme Formu */}
            <div style={cardStyle}>
              <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Yeni Yetkili Ekle</h4>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <input 
                  style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #d1d5db', flex: 1, outline: 'none' }} 
                  placeholder="Ad Soyad" 
                  value={newAdmin.name} 
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})} 
                />
                <input 
                  style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #d1d5db', flex: 1, outline: 'none' }} 
                  placeholder="E-posta Adresi" 
                  value={newAdmin.email} 
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} 
                />
                <select 
                  style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white' }} 
                  value={newAdmin.role} 
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                >
                  <option>Operatör</option>
                  <option>Lojistik Uzmanı</option>
                  <option>Sistem Yöneticisi</option>
                </select>
                <button 
                  onClick={handleAddAdmin} 
                  style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <Plus size={18} /> Ekle
                </button>
              </div>
            </div>

            {/* Yönetici Listesi Tablosu */}
            <div style={cardStyle}>
              <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Aktif Yetkililer</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
        )}

      </main>
    </div>
  );
}