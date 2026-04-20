import React from 'react';
import './SubPage.css';
import { View } from '../types';

interface FAQPageProps {
  onBack: () => void;
  onLogin: () => void;
  onContact: () => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onBack, onLogin, onContact }) => {
  const faqs = [
    {
      q: 'Token được trừ như thế nào khi xem chiêm tinh?',
      a: 'Mỗi lần bạn nhận được lời tư vấn chi tiết từ AI (như Bản đồ sao, Giải mã giấc mơ, hoặc Dự báo hằng ngày), hệ thống sẽ trừ 1 Token. Chúng tôi chỉ tính phí trên kết quả cuối cùng, không tính phí khi bạn đang nhập thông tin hoặc tìm hiểu kiến thức cơ bản.'
    },
    {
      q: 'Nạp tiền bao lâu thì nhận được Token?',
      a: 'Hệ thống thanh toán của chúng tôi hoàn toàn tự động qua Momo và Chuyển khoản ngân hàng. Thông thường, Token sẽ được cộng vào tài khoản của bạn chỉ sau 1-3 phút kể từ khi giao dịch chuyển khoản thành công.'
    },
    {
      q: 'Nếu AI tư vấn không đúng ý có được hoàn lại Token không?',
      a: 'Vì đây là sản phẩm tư vấn từ trí tuệ nhân tạo dựa trên các thuật toán chiêm tinh học, chúng tôi không hỗ trợ hoàn lại token cho các phiên tư vấn đã hoàn thành. Tuy nhiên, bạn có thể xem các thông tin tóm tắt trước khi quyết định dùng token để xem bản phân tích chuyên sâu.'
    },
    {
      q: 'Hệ thống hỗ trợ xem những thông tin chiêm tinh nào?',
      a: 'Zodiac Whisper cung cấp bộ giải pháp toàn diện bao gồm: Bản đồ sao cá nhân (Natal Chart), So sánh độ hòa hợp tình duyên (Synastry), Giải mã thông điệp giấc mơ, và Lịch cát tường cá nhân hóa theo từng ngày.'
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
          <h1 className="subpage-title">Câu hỏi thường gặp</h1>
          <p className="subpage-subtitle">Cập nhật lần cuối: 20/4/2026</p>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Giải đáp thắc mắc & Câu hỏi thường gặp (FAQ)</h2>
            <p style={{ color: '#666' }}>Mọi thứ bạn cần biết về hệ thống token và quy trình tư vấn chiêm tinh AI.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question">
                  <span className="faq-q-mark">Q.</span>
                  <span>{faq.q}</span>
                </div>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>

          <div className="message-box" style={{ textAlign: 'center', marginTop: '4rem', background: '#1a202c' }}>
            <h3 style={{ marginBottom: '1rem' }}>Vẫn còn thắc mắc khác?</h3>
            <p style={{ color: '#cbd5e0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
            </p>
            <button className="btn btn-primary" onClick={onContact}>Liên hệ ngay</button>
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

export default FAQPage;
