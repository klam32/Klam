import re
from typing import Dict, Any, List
from kerykeion import AstrologicalSubject
from kerykeion.utilities import get_house_number
from chatbot.utils.text_cleaner import normalize_markdown

class PersonalityAgent:
    """
    PersonalityAgent:
    - Phân tích tính cách dựa trên bản đồ sao
    - Dùng Sun, Moon, Ascendant + hành tinh
    """

    def __init__(self, llm_model):
        self.llm = llm_model
        self.conversation_history: List[Dict[str, str]] = []

    # =========================
    # ANALYZE PERSONALITY
    # =========================
    def analyze(self, birth_info: Dict[str, Any]) -> Dict[str, Any]:

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
            # EXTRACT DATA
            # =========================
            def get_house(p):
                try:
                    return get_house_number(p.house) if p.house else 0
                except:
                    return 0

            chart_data = {
                "Sun": f"{subject.sun.sign} (Nhà {get_house(subject.sun)})",
                "Moon": f"{subject.moon.sign} (Nhà {get_house(subject.moon)})",
                "Ascendant": subject.ascendant.sign,
                "Mercury": subject.mercury.sign,
                "Venus": subject.venus.sign,
                "Mars": subject.mars.sign
            }

        except Exception as e:
            return {
                "interpretation": f"Không thể phân tích tính cách: {str(e)}"
            }

        # =========================
        # PROMPT
        # =========================
        prompt = f"""
Bạn là chuyên gia phân tích tâm lý.

Dữ liệu Chiêm tinh:
{chart_data}

Yêu cầu:
- TRẢ LỜI ĐÚNG TRỌNG TÂM câu hỏi hoặc bối cảnh: {birth_info.get("context")}
- TUYỆT ĐỐI KHÔNG giải thích về lý thuyết chiêm tinh kỹ thuật (hành tinh, nhà, góc chiếu).
- Phân tích tâm lý thực tế, nêu rõ các điểm mạnh và điểm yếu nổi bật.
- Trình bày bằng định dạng Markdown chuyên nghiệp, sạch sẽ: Sử dụng tiêu đề (##) nếu cần và danh sách (-) để thông tin rõ ràng. KHÔNG lạm dụng in đậm.

Trả lời:
"""

        response = self.llm.invoke(prompt)

        answer = response.content if hasattr(response, "content") else str(response)
        answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()
        answer = normalize_markdown(answer)
        answer = answer.strip()

        return {
            "type":"personality",
            "agent": "personality",
            "interpretation": answer
        }

    # =========================
    # FOLLOW-UP CHAT
    # =========================
    def chat(self, question: str) -> str:

        history_text = ""

        for msg in self.conversation_history[-6:]:
            role = "User" if msg["role"] == "user" else "Psychologist"
            history_text += f"{role}: {msg['content']}\n"

        prompt = f"""
Bạn là chuyên gia phân tích tâm lý.

Dưới đây là cuộc hội thoại trước đó:
{history_text}

Người dùng hỏi thêm:
{question}

Yêu cầu:
- TRẢ LỜI ĐÚNG TRỌNG TÂM câu hỏi dưới góc độ tâm lý học thực tế.
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
        print(f"   🧠 [PersonalityAgent] - Đang phân tích tâm lý...")
        birth_info = input_data.get("birth_info", {})
        memory = input_data.get("memory")

        # 🔥 FIX QUAN TRỌNG
        if memory:
            birth_info = memory

        return {
            "type": "personality",
            "answer": self.analyze(
                birth_info={
                    **birth_info,
                    "context": input_data.get("question")
                }
            ).get("interpretation", "")
        }