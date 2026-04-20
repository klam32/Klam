import React from 'react';
import './SubPage.css';
import { View } from '../types';

interface TermsPageProps {
  onBack: () => void;
  onLogin: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onBack, onLogin }) => {
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
          <h1 className="subpage-title">Điều khoản dịch vụ & Chính sách bảo mật</h1>
          <p className="subpage-subtitle">Cập nhật lần cuối: 20/4/2026</p>

          <div className="terms-section">
            <h3>🔵 1. Chấp thuận điều khoản</h3>
            <div className="terms-text">
              Bằng việc truy cập và sử dụng dịch vụ tại <strong>Zodiac Whisper AI</strong>, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng dịch vụ của chúng tôi.
            </div>
          </div>

          <div className="terms-section">
            <h3>🔵 2. Quy định về Token và Thanh toán</h3>
            <div className="terms-text">
              Token là đơn vị thanh toán nội bộ để sử dụng các tính năng cao cấp của Chatbot Chiêm tinh AI.
              <ul>
                <li>Mọi giao dịch nạp Token qua cổng thanh toán tự động (Momo, Chuyển khoản ngân hàng) đều được xử lý ngay lập tức.</li>
                <li>Giá trị Token không có giá trị đổi ngược lại thành tiền mặt.</li>
                <li>Hệ thống cam kết bảo mật thông tin giao dịch của khách hàng.</li>
              </ul>
            </div>
          </div>

          <div className="refund-box">
            <h3 style={{ color: '#c05621', margin: 0 }}>3. Chính sách hoàn tiền (Refund)</h3>
            <div className="terms-text" style={{ marginTop: '1rem' }}>
              Chúng tôi cam kết bảo vệ quyền lợi khách hàng, tuy nhiên do đặc thù sản phẩm số (Digital Goods):
              <ul style={{ marginTop: '0.5rem' }}>
                <li><strong>Không hoàn tiền</strong> đối với các Token đã được sử dụng để thực hiện các yêu cầu tư vấn chiêm tinh thành công.</li>
                <li><strong>Hoàn tiền 100%</strong> nếu xảy ra lỗi kỹ thuật từ hệ thống khiến Token bị trừ nhưng không nhận được câu trả lời từ AI (sau khi bộ phận kỹ thuật kiểm tra và xác nhận).</li>
                <li>Yêu cầu hoàn trả phải được gửi trong vòng 24h kể từ khi phát sinh giao dịch lỗi.</li>
              </ul>
            </div>
          </div>

          <div className="terms-section">
            <h3>🔵 4. Chính sách bảo mật dữ liệu</h3>
            <div className="terms-text">
              Chúng tôi coi trọng quyền riêng tư của bạn:
              <ul style={{ marginTop: '0.5rem' }}>
                <li><strong>Thông tin cá nhân:</strong> Email và thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối, không chia sẻ cho bên thứ ba.</li>
                <li><strong>Dữ liệu chiêm tinh:</strong> Các thông tin về ngày sinh, giờ sinh bạn cung cấp chỉ phục vụ mục đích tính toán bản đồ sao và tư vấn AI.</li>
                <li><strong>Cookies:</strong> Chúng tôi sử dụng cookies để duy trì phiên đăng nhập và cá nhân hóa trải nghiệm người dùng.</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem', fontSize: '0.8rem', color: '#a0aec0' }}>
            Mọi thắc mắc xin liên hệ qua kênh hỗ trợ trực tuyến của Zodiac Whisper AI.
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

export default TermsPage;
