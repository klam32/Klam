import React from 'react';
import './SubPage.css';

interface AstrologyDetailsPageProps {
  onBack: () => void;
}

const AstrologyDetailsPage: React.FC<AstrologyDetailsPageProps> = ({ onBack }) => {
  const sections = [
    {
      id: 1,
      title: 'Lịch sử & Khái niệm cơ bản',
      content: 'Chiêm tinh học có nguồn gốc cổ đại từ Babylon, Ai Cập, Ấn Độ đến Hy Lạp... Tin rằng thiên thể tác động đến cuộc sống và tính cách con người.',
      bullets: [
        'Hoàng đạo (Zodiac): Vòng 360° chia 12 cung, mỗi cung 30°.',
        'Sidereal vs. Tropical: Tính theo ngôi sao thật (Vedic) hoặc mặt trời nhiệt đới (Tây).',
        'Ephemeris: Bảng tra vị trí hành tinh theo thời gian để lập chart.'
      ]
    },
    {
      id: 2,
      title: 'Bảng Đồ Sao (Natal Chart)',
      content: 'Chart vẽ vị trí Hành Tinh, Mặt Trời, Mặt Trăng, Ascendant, Midheaven tại thời điểm sinh.',
      bullets: [
        'Ascendant (Nhà 1): Cách bạn thể hiện ra bên ngoài.',
        'Midheaven (Nhà 10): Sự nghiệp, danh vọng.',
        'Planets in Houses: Vị trí hành tinh ở nhà nào ảnh hưởng đến lĩnh vực đó.'
      ]
    },
    {
      id: 3,
      title: '12 Cung Hoàng Đạo',
      content: 'Bạch Dương (Aries): Dũng cảm, nhiệt huyết. Kim Ngưu (Taurus): Kiên định, yêu thích sự ổn định. Song Tử (Gemini): Thông minh, linh hoạt. Cự Giải (Cancer): Nhạy cảm, chăm sóc. Sư Tử (Leo): Lãnh đạo, tự tin. Xử Nữ (Virgo): Tỉ mỉ, phân tích. Thiên Bình (Libra): Cân bằng, công bằng. Bọ Cạp (Scorpio): Mãnh liệt, bí ẩn. Nhân Mã (Sagittarius): Phiêu lưu, lạc quan. Ma Kết (Capricorn): Tham vọng, kỷ luật. Bảo Bình (Aquarius): Sáng tạo, nhân đạo. Song Ngư (Pisces): Mơ mộng, đồng cảm.'
    },
    {
      id: 4,
      title: 'Các Góc (Aspects)',
      content: 'Mối tương tác giữa hai hành tinh, quyết định năng lượng thuận lợi hay thử thách.',
      bullets: [
        'Conjunction (0°): Tích hợp mạnh mẽ.',
        'Trine (120°): Hài hòa, thuận lợi.',
        'Square (90°): Thử thách, căng thẳng.',
        'Opposition (180°): Đối kháng, cân bằng.',
        'Sextile (60°): Cơ hội, kết nối.'
      ]
    },
    {
      id: 5,
      title: 'Transits & Progressions',
      content: 'Transits: Vị trí hành tinh hiện tại so với natal chart, dự báo sự kiện. Progressions: Tiến trình phát triển tâm hồn theo thời gian.'
    },
    {
      id: 6,
      title: 'Synastry',
      content: 'So sánh hai natal chart để đánh giá mức độ hòa hợp trong tình cảm, công việc, bạn bè...'
    },
    {
      id: 7,
      title: 'Solar & Lunar Returns',
      content: 'Solar Return: Biểu đồ ngày sinh nhật, dự báo cả năm. Lunar Return: Biểu đồ hằng tháng, tập trung vào cảm xúc.'
    },
    {
      id: 8,
      title: 'Astrocartography',
      content: 'Bản đồ địa lý cho biết vị trí nào trên thế giới mang lại may mắn, hỗ trợ chọn nơi sinh sống, du lịch, công việc.'
    },
    {
      id: 9,
      title: 'Arabic Parts',
      content: 'Phần Tài Lộc, Phần Linh Hồn... tính theo công thức: Asc + Moon - Sun, v.v.'
    },
    {
      id: 10,
      title: 'Horary Astrology',
      content: 'Giải đáp câu hỏi cụ thể bằng chart tại thời điểm hỏi, ví dụ "Tôi có nên đầu tư không?"'
    },
    {
      id: 11,
      title: 'Esoteric Astrology',
      content: 'Chiêm tinh huyền bí, tập trung vào linh hồn, Nodes, nhiệm vụ tâm linh...'
    },
    {
      id: 12,
      title: 'Medical Astrology',
      content: 'Mối liên hệ giữa hành tinh và bộ phận cơ thể: Mars - Máu, Jupiter - Gan, Saturn - Xương, v.v.'
    },
    {
      id: 13,
      title: 'Financial Astrology',
      content: 'Phân tích chu kỳ hành tinh (Jupiter-Saturn, Uranus-Pluto) trong chứng khoán, kinh tế.'
    },
    {
      id: 14,
      title: 'Mundane & Electional Astrology',
      content: 'Mundane: Dự báo sự kiện chính trị - kinh tế thế giới. Electional: Chọn giờ đẹp cho sự kiện (đám cưới, khởi công).'
    }
  ];

  return (
    <div className="subpage-container" style={{ backgroundColor: '#f8faff' }}>
      <header className="subpage-header">
        <div className="subpage-logo" onClick={onBack} style={{ cursor: 'pointer' }}>
          <span>✨</span> Zodiac Whisper
        </div>
        <button className="btn btn-primary" onClick={onBack}>Quay lại</button>
      </header>

      <main className="subpage-content" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 className="subpage-title" style={{ color: '#6e2cf2' }}>
            Chi Tiết Chiêm Tinh Toàn Diện
          </h1>
          <p className="subpage-subtitle" style={{ maxWidth: '700px', margin: '0 auto' }}>
            Khám phá hệ thống kiến thức chiêm tinh đồ sộ từ cơ bản đến chuyên sâu, giúp bạn thấu hiểu bản thân và vũ trụ một cách trọn vẹn nhất.
          </p>
        </div>

        <div className="details-list">
          {sections.map((section) => (
            <div key={section.id} className="details-card">
              <h3 className="details-title">
                {section.id}. {section.title}
              </h3>
              <p className="details-text">
                {section.content}
              </p>
              {section.bullets && (
                <ul className="details-bullets">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '5rem', paddingBottom: '5rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '1rem 4rem', borderRadius: '50px', background: 'linear-gradient(135deg, #6e2cf2 0%, #a259ff 100%)' }}
            onClick={onBack}
          >
            Quay lại trang chủ
          </button>
        </div>
      </main>
    </div>
  );
};

export default AstrologyDetailsPage;
