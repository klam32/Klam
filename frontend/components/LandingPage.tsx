import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { View, User } from '../types';

interface LandingPageProps {
  user: User | null;
  onViewChange: (view: View) => void;
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ user, onViewChange, onLoginClick }) => {
  const [bgIndex, setBgIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [fadeText, setFadeText] = useState(true);

  const backgrounds = [
    '/hero-bg.png', 
    '/hero-bg-2.png', 
    '/hero-bg-3.png',
    '/hero-bg-4.png',
    '/hero-bg-5.jpg',
    '/hero-bg-6.jpg',
    '/hero-bg-7.jpg'
  ];

  const cyclingWords = ['vũ trụ', 'vận mệnh', 'tâm hồn', 'tương lai'];

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);

    const textInterval = setInterval(() => {
      setFadeText(false);
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % cyclingWords.length);
        setFadeText(true);
      }, 500);
    }, 3000);

    return () => {
      clearInterval(bgInterval);
      clearInterval(textInterval);
    };
  }, []);

  const zodiacSigns = [
    { name: 'Bạch Dương', icon: '♈' }, { name: 'Kim Ngưu', icon: '♉' },
    { name: 'Song Tử', icon: '♊' }, { name: 'Cự Giải', icon: '♋' },
    { name: 'Sư Tử', icon: '♌' }, { name: 'Xử Nữ', icon: '♍' },
    { name: 'Thiên Bình', icon: '♎' }, { name: 'Bọ Cạp', icon: '♏' },
    { name: 'Nhân Mã', icon: '♐' }, { name: 'Ma Kết', icon: '♑' },
    { name: 'Bảo Bình', icon: '♒' }, { name: 'Song Ngư', icon: '♓' }
  ];

  const planets = [
    { name: 'Mặt Trời', icon: '☀️' }, { name: 'Mặt Trăng', icon: '🌙' },
    { name: 'Sao Thủy', icon: '☿' }, { name: 'Sao Kim', icon: '♀' },
    { name: 'Sao Hỏa', icon: '♂' }, { name: 'Sao Mộc', icon: '♃' },
    { name: 'Sao Thổ', icon: '♄' }, { name: 'Thiên Vương', icon: '♅' },
    { name: 'Hải Vương', icon: '♆' }, { name: 'Diêm Vương', icon: '♇' }
  ];

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
          <span>✨</span> Zodiac Whisper
        </div>
        <nav className="nav-links">
          <a href="#features">Tính năng</a>
          <a href="#about">Về chúng tôi</a>
          <span onClick={() => onViewChange('contact')} style={{ cursor: 'pointer' }}>Liên hệ</span>
        </nav>
        <div className="auth-buttons">
          {user ? (
            <button className="btn btn-outline" onClick={() => onViewChange('profile')}>
              Hi, {user.full_name || user.username}
            </button>
          ) : (
            <button className="btn btn-outline" onClick={onLoginClick}>Đăng nhập</button>
          )}
          <button className="btn btn-primary" onClick={() => onViewChange('chat')}>Bắt đầu ngay</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-container">
          {backgrounds.map((bg, index) => (
            <img 
              key={index} 
              src={bg} 
              alt="Cosmic Background" 
              className={`hero-bg ${index === bgIndex ? 'active' : ''}`} 
            />
          ))}
        </div>
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <div className="badge">Công nghệ AI tiên tiến</div>
          <h1>
            Khám phá <span className={`cycling-text ${fadeText ? 'text-fade-in' : 'text-fade-out'}`}>
              {cyclingWords[textIndex]}
            </span><br />bên trong bạn
          </h1>
          <p>
            Phân tích tinh vân, thấu hiểu bản thân qua các công cụ Chiêm tinh AI chuyên sâu nhất. 
            Bắt đầu hành trình tìm kiếm sự bình an và định hướng tương lai.
          </p>
          <div className="auth-buttons" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 4rem', fontSize: '1.2rem' }} onClick={() => onViewChange('chat')}>
              Bắt đầu ngay
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="section-header">
          <div className="badge">Về Zodiac Whisper</div>
          <h2>Nền tảng Chiêm tinh AI hàng đầu</h2>
          <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)' }}>
            Zodiac Whisper là nền tảng giúp bạn khám phá vũ trụ nội tâm qua các công cụ: Tử vi cá nhân, 
            Giải mã giấc mơ và Tính toán tình yêu. Mỗi tính năng được thiết kế trực quan, 
            dễ dùng, hỗ trợ bạn tìm ra thông điệp từ các vì sao.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <div className="badge">Tính năng nổi bật</div>
          <h2>Kiến thức Chiêm Tinh Toàn Diện</h2>
          <button 
            className="btn btn-outline" 
            style={{ marginTop: '1.5rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            onClick={() => onViewChange('details')}
          >
            Xem chi tiết toàn tập ✦
          </button>
        </div>
        <div className="features-grid">
          <div className="feature-card" onClick={() => onViewChange('chat')}>
            <span className="feature-icon">🗺️</span>
            <h3>Bản Đồ Sao</h3>
            <p>Vị trí các hành tinh, Ascendant & Midheaven tại thời điểm bạn chào đời.</p>
          </div>
          <div className="feature-card" onClick={() => onViewChange('chat')}>
            <span className="feature-icon">☀️</span>
            <h3>Mặt Trời & Mặt Trăng</h3>
            <p>Thấu hiểu linh hồn, cảm xúc và cách bạn thể hiện bản thân ra thế giới.</p>
          </div>
          <div className="feature-card" onClick={() => onViewChange('chat')}>
            <span className="feature-icon">🏠</span>
            <h3>12 Nhà</h3>
            <p>Khám phá các khía cạnh cuộc sống: tài chính, sự nghiệp, tình yêu...</p>
          </div>
          <div className="feature-card" onClick={() => onViewChange('chat')}>
            <span className="feature-icon">💖</span>
            <h3>Synastry</h3>
            <p>So sánh hai bản đồ sao để đánh giá mức độ hòa hợp trong tình duyên.</p>
          </div>
          <div className="feature-card" onClick={() => onViewChange('chat')}>
            <span className="feature-icon">🔮</span>
            <h3>Giải Mã Giấc Mơ</h3>
            <p>Giải mã các tín hiệu từ tiềm thức qua những giấc mộng của bạn.</p>
          </div>
          <div className="feature-card" onClick={() => onViewChange('chat')}>
            <span className="feature-icon">📅</span>
            <h3>Dự Báo Hằng Ngày</h3>
            <p>Cập nhật xu hướng năng lượng và lời khuyên cho mỗi ngày mới.</p>
          </div>
        </div>
      </section>

      {/* Zodiac Section */}
      <section id="zodiac" className="section">
        <div className="section-header">
          <div className="badge">12 Cung Hoàng Đạo</div>
          <h2>Tìm hiểu về chòm sao của bạn</h2>
        </div>
        <div className="grid-container">
          {zodiacSigns.map(sign => (
            <div key={sign.name} className="grid-item">
              <div className="grid-icon-wrapper">{sign.icon}</div>
              <span>{sign.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Planets Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <div className="badge">Hành Tinh</div>
          <h2>Năng lượng từ các thiên thể</h2>
        </div>
        <div className="grid-container">
          {planets.map(planet => (
            <div key={planet.name} className="grid-item">
              <div className="grid-icon-wrapper">{planet.icon}</div>
              <span>{planet.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-premium-section" style={{ background: '#6e2cf2', textAlign: 'center', padding: '6rem 10%' }}>
        <div className="cta-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="badge" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>✦ VỀ CHÚNG TÔI</div>
          <h2 style={{ color: 'white', fontSize: '3.5rem', marginBottom: '2rem', fontWeight: '800' }}>
            Zodiac Whisper, hệ thống chuyên gia chiêm tinh AI thấu hiểu vận mệnh
          </h2>
          
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ KỸ THUẬT TIÊN PHONG — chuyên cung cấp giải<br />
            pháp công nghệ kỹ thuật cao và xuất nhập khẩu các mặt hàng công nghệ tiên tiến.
          </p>

          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '3rem', lineHeight: '1.8' }}>
            MST: 1801526082 · Người đại diện: NGÔ HỒ ANH KHÔI<br />
            P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ<br />
            0916 416 409 · Hoạt động từ 05/04/2017
          </div>

          <button className="btn" style={{ background: 'white', color: '#6e2cf2', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '50px' }} onClick={() => onViewChange('chat')}>
            ✦ Bắt đầu ngay
          </button>
          
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
            Không cần thẻ tín dụng · 10 token miễn phí khi đăng ký
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h2>Zodiac Whisper</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '1rem' }}>
              Bộ công cụ công nghệ AI toàn diện giúp bạn thấu hiểu bản thân và định hướng tương lai qua ngôn ngữ của các vì sao.
            </p>
            <div className="social-links" style={{ marginTop: '2rem' }}>
              <a href="https://www.facebook.com/share/1Nmf3mz9Qv/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">🔵</a> 
              <a href="#">🟣</a> <a href="#">⚪</a>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Về chúng tôi</h4>
              <ul>
                <li><a href="#about">Giới thiệu</a></li>
                <li><span onClick={() => onViewChange('terms')} style={{ cursor: 'pointer' }}>Điều khoản</span></li>
                <li><span onClick={() => onViewChange('terms')} style={{ cursor: 'pointer' }}>Bảo mật</span></li>
                <li><span onClick={() => onViewChange('contact')} style={{ cursor: 'pointer' }}>Liên hệ</span></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Tính năng</h4>
              <ul>
                <li><a href="#features">Bản đồ sao</a></li>
                <li><a href="#features">Tình yêu</a></li>
                <li><a href="#features">Giấc mơ</a></li>
                <li><a href="#features">Lịch cát tường</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Hỗ trợ</h4>
              <ul>
                <li><span onClick={() => onViewChange('contact')} style={{ cursor: 'pointer' }}>Trung tâm trợ giúp</span></li>
                <li><span onClick={() => onViewChange('guide')} style={{ cursor: 'pointer' }}>Hướng dẫn sử dụng</span></li>
                <li><span onClick={() => onViewChange('faq')} style={{ cursor: 'pointer' }}>Câu hỏi thường gặp</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Zodiac Whisper - AI Technology. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span onClick={() => onViewChange('terms')} style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span onClick={() => onViewChange('terms')} style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
