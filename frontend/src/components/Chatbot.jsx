import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

export default function Chatbot({ userRole, userName, userEmail, assistantName = "Eko-Rehber" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Ziyaretçi ve Rol bazlı AKILLI VE DİNAMİK karşılama
  useEffect(() => {
    const firstName = userName ? userName.split(' ')[0] : '';
    let welcomeText = `Merhaba! Ben ${assistantName}, Eko-Portal'a hoş geldin. Üretici kooperatiflerimiz veya sistemimiz hakkında sana nasıl yardımcı olabilirim?`;
    
    if (userRole === 'admin') {
      welcomeText = `Merhaba ${firstName}! Sistem analizleri, VRP rota optimizasyonu veya stok durumu hakkında ne öğrenmek istersin?`;
    } else if (userRole === 'customer') {
      welcomeText = `Tekrar hoş geldin ${firstName}! Siparişlerin veya yeni ürünlerimiz hakkında sormak istediğin bir şey var mı?`;
    }

    setMessages([{ text: welcomeText, isBot: true }]);
  }, [userRole, userName, assistantName]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { text: inputValue, isBot: false }];
    setMessages(newMessages);
    setInputValue('');

   fetch("http://localhost:8000/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: inputValue,
    user_role: userRole || "customer",
    user_name: userName || "Misafir",
    user_email: userEmail || "misafir@eko.com",
  }),
})
  .then((res) => res.json())
  .then((data) => {
    setMessages((prev) => [
      ...prev,
      {
        text: data.response || "Üzgünüm, şu an cevap veremiyorum.",
        isBot: true,
      },
    ]);
  })
  .catch((err) => {
    console.log(err);
    setMessages((prev) => [
      ...prev,
      {
        text: "Bağlantı sorunu yaşıyorum 🌱 Lütfen internet bağlantınızı ve backend servisini kontrol edin.",
        isBot: true,
      },
    ]);
  });
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          style={floatingBtnStyle}
          title="AI Asistan ile Konuş"
        >
          <MessageSquare size={24} />
          <span style={badgeStyle}>1</span>
        </button>
      )}

      {isOpen && (
        <div style={chatWindowStyle}>
          
          <div style={chatHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={botAvatarStyle}>
                <Bot size={20} color="#059669" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>{assistantName}</strong>
                <span style={{ fontSize: '11px', color: '#d1fae5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={10} /> AI Destekli
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={closeBtnStyle}>
              <X size={20} />
            </button>
          </div>

          <div style={chatBodyStyle}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: msg.isBot ? 'flex-start' : 'flex-end',
                marginBottom: '15px'
              }}>
                <div style={msg.isBot ? botBubbleStyle : userBubbleStyle}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={chatFooterStyle}>
            <input 
              type="text" 
              placeholder="Bir soru sor..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" disabled={!inputValue.trim()} style={sendBtnStyle(inputValue.trim())}>
              <Send size={18} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}

const floatingBtnStyle = { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#059669', color: 'white', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, transition: 'transform 0.2s' };
const badgeStyle = { position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid white' };
const chatWindowStyle = { position: 'fixed', bottom: '30px', right: '30px', width: '350px', height: '500px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', zIndex: 9998, overflow: 'hidden', border: '1px solid #e2e8f0' };
const chatHeaderStyle = { backgroundColor: '#064e3b', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #047857' };
const botAvatarStyle = { backgroundColor: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const closeBtnStyle = { background: 'transparent', border: 'none', color: '#a7f3d0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const chatBodyStyle = { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' };
const bubbleBase = { padding: '12px 16px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.5', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', wordWrap: 'break-word' };
const botBubbleStyle = { ...bubbleBase, backgroundColor: 'white', color: '#1e293b', border: '1px solid #e2e8f0', borderBottomLeftRadius: '4px' };
const userBubbleStyle = { ...bubbleBase, backgroundColor: '#059669', color: 'white', borderBottomRightRadius: '4px' };
const chatFooterStyle = { padding: '15px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' };
const inputStyle = { flex: 1, padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '24px', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc' };
const sendBtnStyle = (isActive) => ({ backgroundColor: isActive ? '#059669' : '#e2e8f0', color: isActive ? 'white' : '#94a3b8', border: 'none', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: isActive ? 'pointer' : 'default', transition: '0.2s' });