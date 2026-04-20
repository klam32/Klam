import re
from typing import Dict, Any, List
from kerykeion import AstrologicalSubject
from kerykeion.utilities import get_house_number
from chatbot.utils.text_cleaner import normalize_markdown

class HealthAgent:
    """
    HealthAgent:
    - Phân tích sức khỏe, thói quen, năng lượng
    - Focus: House 6 + Moon + Mars
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

            def get_house(p):
                try:
                    return get_house_number(p.house) if p.house else 0
                except:
                    return 0

            health_data = {
                "Moon": f"{subject.moon.sign} (Nhà {get_house(subject.moon)})",
                "Mars": f"{subject.mars.sign} (Nhà {get_house(subject.mars)})",
                "House 6": subject.sixth_house.sign if subject.sixth_house else None
            }

        except Exception as e:
            return {
                "interpretation": f"Không thể phân tích sức khỏe: {str(e)}"
            }

        # =========================
        # PROMPT (QUAN TRỌNG)
        # =========================
        prompt = f"""
 Bạn là chuyên gia tư vấn sức khỏe và năng lượng.

User hỏi:
{context}

Dữ liệu Chiêm tinh:
{health_data}

Yêu cầu:
- TRẢ LỜI ĐÚNG TRỌNG TÂM về xu hướng sức khỏe và năng lượng cá nhân.
- TUYỆT ĐỐI KHÔNG giải thích về lý thuyết chiêm tinh (hành tinh, nhà, góc chiếu).
- Đưa ra lời khuyên cụ thể, thực tế và dễ thực hiện.
- Trình bày bằng định dạng Markdown chuyên nghiệp, sạch sẽ: Sử dụng tiêu đề (##) nếu cần và danh sách (-) để thông tin rõ ràng. KHÔNG lạm dụng in đậm.

Trả lời:
"""

        response = self.llm.invoke(prompt)

        answer = response.content if hasattr(response, "content") else str(response)
        answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()
        answer = normalize_markdown(answer).strip()


        return {
            "type": "health",
            "answer": answer
        }

    # =========================
    # RUN
    # =========================
    def run(self, input_data):
        print(f"   🌿 [HealthAgent] - Đang phân tích sức khỏe...")
        birth_info = input_data.get("birth_info", {})
        memory = input_data.get("memory")

        # 🔥 FIX QUAN TRỌNG
        if memory:
            birth_info = memory

        return self.analyze(
            birth_info=birth_info,
            context=input_data.get("question")
        )