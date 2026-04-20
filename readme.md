# Tarot Talk - Trí Tuệ Tarot AI

Dự án chatbot luận giải Tarot cá nhân hóa sử dụng các mô hình ngôn ngữ lớn (LLM).

## Tính năng chính
- **Rút bài 3 lá:** Quy trình chọn bài tương tác cho người dùng.
- **Cá nhân hóa theo bối cảnh:** Người dùng chọn lĩnh vực (Tình cảm, Sự nghiệp, Tài chính, v.v.) và cung cấp bối cảnh thực tế.
- **Luận giải thông minh:** Sử dụng LLM để phân tích sự kết hợp giữa các lá bài và đưa ra lời khuyên sâu sắc.
- **Quản lý Tokens:** Hệ thống tính phí dựa trên lượng token sử dụng.

## Công nghệ sử dụng
- **Backend:** FastAPI, LangChain, SQLite.
- **Frontend:** React, Tailwind CSS, Lucide Icons.
- **LLM:** Hỗ trợ OpenAI, Gemini và Local LLM (qua Ollama).

## Hướng dẫn cài đặt
1. Cấu hình biến môi trường trong file `.env`.
2. Cài đặt dependency: `pip install -r requirements.txt`.
3. Chạy API: `python run_api.py`.
4. Chạy Frontend: `cd frontend && npm install && npm run dev`.
