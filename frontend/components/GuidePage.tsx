import React from 'react';
import './SubPage.css';
import { View } from '../types';

interface GuidePageProps {
  onBack: () => void;
  onLogin: () => void;
  onStart: () => void;
}

const GuidePage: React.FC<GuidePageProps> = ({ onBack, onLogin, onStart }) => {
  const steps = [
    {
      title: 'Đăng ký & Nhận Token miễn phí',
      description: 'Chỉ cần đăng ký tài khoản mới, bạn sẽ nhận ngay 10 Token miễn phí để trải nghiệm toàn bộ tính năng của hệ thống Zodiac Whisper AI.'
    },
    {
      title: 'Chọn tính năng Chiêm tinh',
      description: 'Tại giao diện chính, hãy chọn tính năng bạn quan tâm: Lập bản đồ sao cá nhân, Xem độ hòa hợp tình duyên, Giải mã giấc mơ hoặc Dự báo hằng ngày.'
    },
    {
      title: 'Nhập thông tin cá nhân',
      description: 'Cung cấp ngày, giờ và địa điểm sinh chính xác nhất có thể. Đây là cơ sở dữ liệu quan trọng để AI tính toán vị trí các hành tinh tại thời điểm bạn chào đời.'
    },
    {
      title: 'Nhận lời tư vấn từ AI Chuyên gia',
      description: 'Hệ thống sẽ phân tích hàng ngàn dữ liệu thiên văn và gửi đến bạn lời giải mã chi tiết, dễ hiểu và mang tính cá nhân hóa cực cao.'
    },
    {
      title: 'Lưu trữ & Chia sẻ',
      description: 'Tất cả các bản phân tích sẽ được lưu trong mục Lịch sử. Bạn có thể xem lại bất cứ lúc nào hoặc tải về để chia sẻ với bạn bè.'
    }
  ];

  return (
    <div className="subpage-container">
      <header className="subpage-header">
        <div className="subpage-logo" onClick={onBack} style={{ cursor: 'pointer' }}>
          <span>✨</span> Zodiac Whisper
        </div>
        <button className="btn btn-primary" onClick={onLogin}>Đăng nhập</button>
      </header>

      <main className="subpage-content">
        <div className="subpage-card">
          <h1 className="subpage-title">Hướng dẫn sử dụng toàn hệ thống</h1>
          <p className="subpage-subtitle">Khám phá hành trình thấu hiểu bản thân cùng Zodiac Whisper</p>

          <div style={{ marginTop: '4rem' }}>
            {steps.map((step, index) => (
              <div key={index} className="guide-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem', padding: '3rem', background: '#f8faff', borderRadius: '24px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Bắt đầu hành trình của bạn ngay bây giờ</h2>
            <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }} onClick={onStart}>
              Khám phá ngay
            </button>
          </div>
        </div>
      </main>

      <footer className="subpage-footer">
        <div>© 2026 Zodiac Whisper. Đã đăng ký bản quyền. <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>BETA</span></div>
        <div style={{ marginTop: '1rem' }}>
          <span onClick={onBack} style={{ cursor: 'pointer', color: '#6e2cf2' }}>Trang chủ</span>
        </div>
      </footer>
    </div>
  );
};

export default GuidePage;
