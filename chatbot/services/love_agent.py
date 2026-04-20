import re
import random
from typing import Dict, Any, List
from kerykeion import AstrologicalSubject, ChartDataFactory, ChartDrawer
from chatbot.utils.text_cleaner import normalize_markdown
import os

def slugify(name: str):
    name = name.lower()
    name = re.sub(r"[àáạảãâầấậẩẫăằắặẳẵ]", "a", name)
    name = re.sub(r"[èéẹẻẽêềếệểễ]", "e", name)
    name = re.sub(r"[ìíịỉĩ]", "i", name)
    name = re.sub(r"[òóọỏõôồốộổỗơờớợởỡ]", "o", name)
    name = re.sub(r"[ùúụủũưừứựửữ]", "u", name)
    name = re.sub(r"[ỳýỵỷỹ]", "y", name)
    name = re.sub(r"đ", "d", name)
    name = re.sub(r"\s+", "_", name)
    name = re.sub(r"[^\w_]", "", name)
    return name

def save_chart(svg: str, name: str):
    if not svg: return None
    folder = "chatbot/output/chart"
    os.makedirs(folder, exist_ok=True)
    safe_name = slugify(name)
    filename = f"partner_{safe_name}.svg"
    path = os.path.join(folder, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    return path

def get_label(percent):
    if percent >= 80: return "Rất hợp 💖"
    elif percent >= 60: return "Khá hợp 💕"
    elif percent >= 40: return "Trung bình 🤝"
    else: return "Khó hòa hợp ⚠️"

def extract_chart(subject):
    return {
        "Sun": subject.sun.sign,
        "Moon": subject.moon.sign,
        "Mercury": subject.mercury.sign,
        "Venus": subject.venus.sign,
        "Mars": subject.mars.sign,
        "Jupiter": subject.jupiter.sign,
        "Saturn": subject.saturn.sign,
    }

class LoveAgent:
    def __init__(self, llm_model):
        self.llm = llm_model
        self.conversation_history: List[Dict[str, str]] = []
    
    def analyze(self, birth_info: Dict[str, Any], context: str = None) -> Dict[str, Any]:
        name = birth_info.get("name", "Người dùng")
        partner = birth_info.get("partner")

        try:
            p1 = AstrologicalSubject(
                name,
                int(birth_info["year"]),
                int(birth_info["month"]),
                int(birth_info["day"]),
                int(birth_info.get("hour", 0)),
                int(birth_info.get("minute", 0)),
                city=birth_info.get("city", "Hanoi"),
                nation=birth_info.get("country", "VN")
            )

            if not partner:
                chart1 = extract_chart(p1)
                prompt = f"Tư vấn tình yêu cá nhân cho {name}. Dữ liệu: {chart1}. Yêu cầu phân tích sâu nhu cầu tình cảm."
                response = self.llm.invoke(prompt)
                answer = response.content if hasattr(response, "content") else str(response)
                answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()
                # Đảm bảo gộp lại nếu AI trả về list
                if isinstance(answer, list):
                    answer = "\n".join([str(i) for i in answer])

                return {
                    "type": "love",
                    "answer": normalize_markdown(answer),
                    "interpretation": normalize_markdown(answer),
                    "compatibility": None,
                    "label": None,
                    "chart_svg": None,
                    "partner_chart_svg": None
                }

            p2 = AstrologicalSubject(
                partner.get("name", "Đối tác"),
                int(partner["year"]),
                int(partner["month"]),
                int(partner["day"]),
                int(partner.get("hour", 0)),
                int(partner.get("minute", 0)),
                city=partner.get("city", "Hanoi"),
                nation=partner.get("country", "VN")
            )

            try:
                data1 = ChartDataFactory.create_natal_chart_data(p1.model())
                svg1 = ChartDrawer(data1, theme="dark").generate_svg_string(remove_css_variables=True)
            except: svg1 = None

            try:
                data2 = ChartDataFactory.create_natal_chart_data(p2.model())
                svg2 = ChartDrawer(data2, theme="dark").generate_svg_string(remove_css_variables=True)
                save_chart(svg2, p2.name)
            except: svg2 = None

            chart1 = extract_chart(p1)
            chart2 = extract_chart(p2)

            prompt = f"""
            HỆ THỐNG PHÂN TÍCH TÌNH DUYÊN CẤP CAO.
            ĐỐI TƯỢNG 1: {p1.name} ({chart1})
            ĐỐI TƯỢNG 2: {p2.name} ({chart2})

            NHIỆM VỤ:
            1. PHÂN TÍCH CÁ NHÂN (##): Phân tích sâu sắc về tính cách và quan điểm tình yêu của TỪNG NGƯỜI dựa trên các hành tinh (Sun, Moon, Venus, Mars).
            2. PHÂN TÍCH TƯƠNG HỢP (##): Giải thích chi tiết sự tương tác giữa các hành tinh của cả hai (Góc chiếu, Nhà).
            3. KẾT LUẬN (##): Lời khuyên thực tế và cho điểm tương hợp (vd: 85%).

            YÊU CẦU ĐỊNH DẠNG:
            - Tiêu đề chính duy nhất ở đầu bài dùng # (Ví dụ: # LUẬN GIẢI TÌNH DUYÊN {p1.name} & {p2.name}).
            - Giải thích rõ các yếu tố chiêm tinh kỹ thuật để người dùng hiểu cơ sở của sự tương hợp.
            - Trình bày bằng định dạng Markdown chuyên nghiệp, sạch sẽ: Sử dụng tiêu đề (##) nếu cần và danh sách (-) để thông tin rõ ràng. KHÔNG lạm dụng in đậm.
            - Ngôn ngữ sâu sắc, tinh tế và chuyên nghiệp.
            """

            response = self.llm.invoke(prompt)
            answer = response.content if hasattr(response, "content") else str(response)
            answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()
            answer = normalize_markdown(answer).strip()

            match = re.search(r"(\d{1,3})%", answer)
            compatibility = int(match.group(1)) if match else random.randint(65, 85)
            label = get_label(compatibility)

            # Đảm bảo gộp lại nếu AI trả về list
            if isinstance(answer, list):
                answer = "\n".join([str(i) for i in answer])

            return {
                "type": "love",
                "answer": answer,
                "interpretation": answer,  # Thêm field này để khớp với chatbot.py
                "compatibility": compatibility,
                "label": label,
                "chart_svg": svg1,
                "partner_chart_svg": svg2
            }
        except Exception as e:
            print("LoveAgent Error:", e)
            return {"answer": "Lỗi phân tích chiêm tinh.", "type": "love"}

    def chat(self, question: str, chart1: dict, chart2: dict = None, name1: str = "User", name2: str = "Partner") -> str:
        history_text = ""
        for msg in self.conversation_history[-6:]:
            role = "User" if msg["role"] == "user" else "Expert"
            history_text += f"{role}: {msg['content']}\n"

        context_data = f"- {name1}: {chart1}\n"
        if chart2: context_data += f"- {name2}: {chart2}\n"

        prompt = f"""
        Chuyên gia Tư vấn Tình cảm. 
        Dữ liệu bản đồ sao: {context_data}
        Lịch sử: {history_text}
        Câu hỏi: "{question}"

        ⚠️ QUY TẮC BẮT BUỘC:
        - TRẢ LỜI ĐÚNG TRỌNG TÂM câu hỏi dưới góc độ tâm lý và tình cảm.
        - TUYỆT ĐỐI KHÔNG giải thích các yếu tố chiêm tinh kỹ thuật (hành tinh, nhà, góc chiếu).
        - Nếu hỏi cá nhân trả lời theo chart cá nhân, nếu hỏi cả hai trả lời kết hợp.
        - Trình bày bằng định dạng Markdown chuyên nghiệp, sạch sẽ: Sử dụng tiêu đề (##) nếu cần và danh sách (-) để thông tin rõ ràng. KHÔNG lạm dụng in đậm.
        """

        response = self.llm.invoke(prompt)
        answer = response.content if hasattr(response, "content") else str(response)
        answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()
        answer = normalize_markdown(answer).strip()

        self.conversation_history.append({"role": "user", "content": question})
        self.conversation_history.append({"role": "assistant", "content": answer})
        return answer

    def run(self, input_data):
        print(f"   💘 [LoveAgent] - Đang phân tích tình duyên...")
        question = input_data.get("question")
        birth_info = input_data.get("birth_info", {})
        memory = input_data.get("memory")
        if memory: birth_info = memory

        try:
            p1 = AstrologicalSubject(
                birth_info["name"], 
                int(birth_info["year"]), 
                int(birth_info["month"]), 
                int(birth_info["day"]), 
                int(birth_info.get("hour", 0)), 
                int(birth_info.get("minute", 0)), 
                city=birth_info.get("city", "Hanoi"),
                nation=birth_info.get("country", "VN") # 🔥 THÊM NATION
            )
            chart1 = extract_chart(p1)
            p2 = None
            chart2 = None
            partner = birth_info.get("partner")
            if partner:
                p2 = AstrologicalSubject(
                    partner["name"], 
                    int(partner["year"]), 
                    int(partner["month"]), 
                    int(partner["day"]), 
                    int(partner.get("hour", 0)), 
                    int(partner.get("minute", 0)), 
                    city=partner.get("city", "Hanoi"),
                    nation=partner.get("country", "VN") # 🔥 THÊM NATION
                )
                chart2 = extract_chart(p2)
        except Exception as e:
            print("LoveAgent Run Error:", e)
            return {
                "answer": f"Lỗi dữ liệu: {str(e)}", 
                "interpretation": f"Lỗi dữ liệu: {str(e)}", # 🔥 THÊM ĐỂ CHATBOT.PY KHÔNG LỖI
                "type": "love"
            }

        if question:
            return {
                "type": "love",
                "answer": self.chat(question, chart1, chart2, p1.name, p2.name if p2 else "Đối tác")
            }
        return self.analyze(birth_info)