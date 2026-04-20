import re
from typing import Dict, Any, List
from datetime import datetime
from kerykeion import AstrologicalSubject
from chatbot.utils.text_cleaner import normalize_markdown

class DailyAgent:
    """
    DailyAgent:
    - Dự đoán tử vi hàng ngày
    """

    def __init__(self, llm_model):
        self.llm = llm_model
        self.conversation_history: List[Dict[str, str]] = []

    # =========================
    # DAILY PREDICTION
    # =========================
    def predict(self, birth_info: Dict[str, Any]) -> Dict[str, Any]:

        name = birth_info.get("name", "Người dùng")
        today = datetime.now().strftime("%d/%m/%Y")

        try:
            subject = AstrologicalSubject(
                name,
                int(birth_info["year"]),
                int(birth_info["month"]),
                int(birth_info["day"]),
                int(birth_info.get("hour", 0)),
                int(birth_info.get("minute", 0)),
                city=birth_info.get("city", "Hanoi"),
                nation=birth_info.get("country", "VN")
            )

            sun_sign = subject.sun.sign
            moon_sign = subject.moon.sign
            asc = subject.ascendant.sign

        except Exception as e:
            return {
                "interpretation": f"Không thể dự đoán tử vi: {str(e)}"
            }

        # =========================
        # PROMPT
        # =========================
        prompt = f"""
Bạn là chuyên gia dự đoán tử vi hàng ngày.
📅 Ngày: {today}

Thông tin Chiêm tinh:
- Sun: {sun_sign}
- Moon: {moon_sign}
- Asc: {asc}

Câu hỏi người dùng: {birth_info.get("context", "")}

Yêu cầu:
- TRẢ LỜI ĐÚNG TRỌNG TÂM về năng lượng và xu hướng của ngày hôm nay ({today}).
- TUYỆT ĐỐI KHÔNG giải thích về lý thuyết chiêm tinh kỹ thuật (Sun, Moon, Asc...).
- Đưa ra ít nhất 2 nhận định và 1 lời khuyên thực tế.
- Trình bày bằng định dạng Markdown chuyên nghiệp, sạch sẽ: Sử dụng tiêu đề (##) nếu cần và danh sách (-) để thông tin rõ ràng. KHÔNG lạm dụng in đậm.

Trả lời:
"""

        response = self.llm.invoke(prompt)

        answer = response.content if hasattr(response, "content") else str(response)
        answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()
        answer = normalize_markdown(answer).strip()
        if not answer.startswith("📅"):
            answer = f"📅 Ngày: {today}\n\n" + answer

        return {
            "type":"daily",
            "agent": "daily",
            "interpretation": answer
        }

    # =========================
    # FOLLOW-UP CHAT
    # =========================
    def chat(self, question: str) -> str:

        history_text = ""

        for msg in self.conversation_history[-6:]:
            role = "User" if msg["role"] == "user" else "Astrologer"
            history_text += f"{role}: {msg['content']}\n"

        prompt = f"""
Bạn là chuyên gia tử vi hàng ngày.

Dưới đây là cuộc hội thoại trước đó:
{history_text}

Người dùng hỏi thêm:
{question}

Yêu cầu:
- TRẢ LỜI ĐÚNG TRỌNG TÂM câu hỏi, súc tích và dễ hiểu.
- TUYỆT ĐỐI KHÔNG nhắc đến các thuật ngữ chiêm tinh kỹ thuật.
- Trình bày bằng định dạng Markdown chuyên nghiệp, sạch sẽ: Sử dụng tiêu đề (##) nếu cần và danh sách (-) để thông tin rõ ràng. KHÔNG lạm dụng in đậm.

Trả lời:
"""

        response = self.llm.invoke(prompt)

        answer = response.content if hasattr(response, "content") else str(response)
        answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()
        answer = normalize_markdown(answer).strip()
        

        self.conversation_history.append({
            "role": "user",
            "content": question
        })

        self.conversation_history.append({
            "role": "assistant",
            "content": answer
        })

        return answer
    
    def run(self, input_data):
        print(f"   ☀️ [DailyAgent] - Đang phân tích vận trình ngày...")
        question = input_data.get("question", "").lower()

        # 🔥 FIX MEMORY
        birth_info = input_data.get("birth_info", {})
        memory = input_data.get("memory")

        if memory:
            birth_info = memory

        daily_keywords = [
            "hôm nay",
            "hôm nay tôi",
            "today",
            "ngày hôm nay",
            "hiện tại tôi",
            "dạo này tôi"
        ]

        future_keywords = [
            "sau",
            "tương lai",
            "bao giờ",
            "khi nào",
            "sau này",
            "30 tuổi",
            "sẽ không",
            "có không"
        ]

        if any(k in question for k in future_keywords):
            return {
                "type": "daily",
                "answer": ""
            }

        if not any(k in question for k in daily_keywords):
            return {
                "type": "daily",
                "answer": ""
            }

        return {
            "type": "daily",
            "answer": self.predict(
                birth_info={
                    **birth_info,  # 🔥 dùng memory
                    "context": input_data.get("question")
                }
            ).get("interpretation", "")
        }