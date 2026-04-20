import re
from typing import Dict, Any, List
from kerykeion import AstrologicalSubject
from kerykeion.utilities import get_house_number
from chatbot.utils.text_cleaner import normalize_markdown

class CareerAgent:
    """
    CareerAgent:
    - Phân tích sự nghiệp & tài chính dựa trên bản đồ sao
    - Focus: House 2, 6, 10 + Jupiter, Saturn, Mars
    """

    def __init__(self, llm_model):
        self.llm = llm_model
        self.conversation_history: List[Dict[str, str]] = []

    # =========================
    # MAIN ANALYZE
    # =========================
    def analyze(self, birth_info: Dict[str, Any], context: str) -> Dict[str, Any]:

        name = birth_info.get("name", "Người dùng")

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

            # =========================
            # HELPER
            # =========================
            def get_house(p):
                try:
                    return get_house_number(p.house) if p.house else 0
                except:
                    return 0

            # =========================
            # EXTRACT CAREER DATA
            # =========================
            career_data = {
                "Sun": f"{subject.sun.sign} (Nhà {get_house(subject.sun)})",
                "Moon": f"{subject.moon.sign} (Nhà {get_house(subject.moon)})",
                "Ascendant": subject.ascendant.sign,

                # 🔥 QUAN TRỌNG CHO CAREER
                "Mars": f"{subject.mars.sign} (Nhà {get_house(subject.mars)})",
                "Jupiter": f"{subject.jupiter.sign} (Nhà {get_house(subject.jupiter)})",
                "Saturn": f"{subject.saturn.sign} (Nhà {get_house(subject.saturn)})",

                # 🔥 NHÀ QUAN TRỌNG
                "House 2": subject.second_house.sign if subject.second_house else None,
                "House 6": subject.sixth_house.sign if subject.sixth_house else None,
                "House 10": subject.tenth_house.sign if subject.tenth_house else None,
            }

        except Exception as e:
            return {
                "interpretation": f"Không thể phân tích sự nghiệp: {str(e)}"
            }

        # =========================
        # PROMPT
        # =========================
        prompt = f"""
 Bạn là chuyên gia định hướng nghề nghiệp.

User:
{context}

Thông tin Chiêm tinh:
{career_data}

⚠️ QUY TẮC QUAN TRỌNG:
- TRẢ LỜI ĐÚNG TRỌNG TÂM câu hỏi của người dùng.
- TUYỆT ĐỐI KHÔNG giải thích về lý thuyết chiêm tinh (hành tinh, nhà, góc chiếu).
- Sử dụng ngôn ngữ chuyên gia, mentor, tập trung vào thực tế công việc.
- Đưa ra 2–3 hướng nghề phù hợp kèm điểm mạnh & điểm yếu.
- Trình bày bằng định dạng Markdown chuyên nghiệp, sạch sẽ: Sử dụng tiêu đề (##) nếu cần và danh sách (-) để thông tin rõ ràng. KHÔNG lạm dụng in đậm.

Trả lời:
"""

        response = self.llm.invoke(prompt)

        answer = response.content if hasattr(response, "content") else str(response)

        answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()
        answer = normalize_markdown(answer)
        answer = answer.strip()

        return {
            "type": "career",
            "agent": "career",
            "interpretation": answer
        }

    # =========================
    # FOLLOW-UP CHAT
    # =========================
    def chat(self, question: str) -> str:

        history_text = ""

        for msg in self.conversation_history[-6:]:
            role = "User" if msg["role"] == "user" else "Career Expert"
            history_text += f"{role}: {msg['content']}\n"

        prompt = f"""
 Bạn là chuyên gia định hướng nghề nghiệp.

Dưới đây là cuộc hội thoại trước đó:
{history_text}

Người dùng hỏi thêm:
{question}

Yêu cầu:
- TRẢ LỜI ĐÚNG TRỌNG TÂM câu hỏi, mang tính định hướng sự nghiệp thực tế.
- TUYỆT ĐỐI KHÔNG nhắc đến các thuật ngữ chiêm tinh kỹ thuật.
- Trình bày bằng định dạng Markdown chuyên nghiệp, sạch sẽ: Sử dụng tiêu đề (##) nếu cần và danh sách (-) để thông tin rõ ràng. KHÔNG lạm dụng in đậm.
- Tiếp nối mạch hội thoại tự nhiên.

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
        print(f"   💼 [CareerAgent] - Đang phân tích sự nghiệp...")
        birth_info = input_data.get("birth_info", {})
        memory = input_data.get("memory")

        if memory:
            birth_info = memory

        return {
            "type": "career",
            "answer": self.analyze(
                birth_info=birth_info,
                context=input_data.get("question")
            ).get("interpretation", "")
        }