import re
import json
from typing import Dict, Any
from kerykeion import AstrologicalSubject, ChartDataFactory, ChartDrawer
from kerykeion.utilities import get_house_number
from chatbot.utils.text_cleaner import normalize_markdown
import logging
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
    if not svg:
        return None

    folder = "chatbot/output/chart"
    os.makedirs(folder, exist_ok=True)

    safe_name = slugify(name)
    filename = f"user_{safe_name}.svg"

    path = os.path.join(folder, filename)

    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)

    return path

logger = logging.getLogger(__name__)

class AstrologyChatAgent:

    def __init__(self, llm_model) -> None:
        self.llm = llm_model

    def generate_interpretation(self, birth_info: Dict[str, Any], field: str, context: str):

        def safe_int(val, default):
            try:
                return int(val)
            except:
                return default

        name = birth_info.get("name", "Người dùng")
        year = safe_int(birth_info.get("year"), 2000)
        month = safe_int(birth_info.get("month"), 1)
        day = safe_int(birth_info.get("day"), 1)
        hour = safe_int(birth_info.get("hour"), 0)
        minute = safe_int(birth_info.get("minute"), 0)
        city = birth_info.get("city", "Hanoi")
        country = birth_info.get("country", "VN")

        try:
            user_chart = AstrologicalSubject(
                name, year, month, day, hour, minute,
                city=city, nation=country
            )

            planets_keys = ["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"]
            planets_list = [getattr(user_chart, k) for k in planets_keys if getattr(user_chart, k)]

            houses_keys = ["first_house","second_house","third_house","fourth_house","fifth_house","sixth_house","seventh_house","eighth_house","ninth_house","tenth_house","eleventh_house","twelfth_house"]
            houses_list = [getattr(user_chart, k) for k in houses_keys if getattr(user_chart, k)]

            chart_data_str = self._format_chart_data(user_chart, planets_list, houses_list)

            natal_data = ChartDataFactory.create_natal_chart_data(user_chart.model())
            drawer = ChartDrawer(natal_data, theme="dark")
            svg_string = drawer.generate_svg_string(remove_css_variables=True)

            if not context:
                save_chart(svg_string, name)

        except Exception as e:
            raise Exception(f"Lỗi tính toán bản đồ sao: {str(e)}")

        # ========================
        # 🔥 PROMPT (GIỮ NGUYÊN)
        # ========================
        # ======================================================
        # 🔥 DYNAMIC PROMPT (INIT vs QUESTION)
        # ======================================================

        if not context or context.strip() == "":
            # 🟣 INIT MODE → FULL CHART
            prompt = f"""
Bạn là một bậc thầy Chiêm tinh (Astrologer) chuyên nghiệp, có kiến thức sâu rộng về các hành tinh, cung hoàng đạo và các góc hợp.

Hãy luận giải bản đồ sao cá nhân một cách sâu sắc, dễ hiểu và thực tế.

========================
THÔNG TIN NGƯỜI DÙNG
========================

Tên: {name}  
Bối cảnh/Câu hỏi: {context}  
Lĩnh vực quan tâm: {field}

========================
DỮ LIỆU BẢN ĐỒ SAO
========================
{chart_data_str}

========================
YÊU CẦU PHÂN TÍCH
========================

👉 Nếu field = "general":
- Phân tích tổng quan vận mệnh của {name}
- Bao gồm đầy đủ:
    Tính cách  
    Tình cảm  
    Sự nghiệp  
    Sức khỏe  

👉 Nếu field KHÁC:
- CHỈ phân tích DUY NHẤT lĩnh vực "{field}"
- KHÔNG lan sang lĩnh vực khác

========================
ĐỊNH HƯỚNG NỘI DUNG
========================

- personality → tập trung Sun, Moon, Ascendant  
- love → tập trung Venus, Nhà 7  
- career → tập trung Nhà 10, Saturn, Mars  
- health → tập trung Nhà 6, Moon, Mars  

========================
CẤU TRÚC TRẢ LỜI
========================

1. TỔNG QUAN (##)
    (Chỉ viết nếu field = general)

2. PHÂN TÍCH CHI TIẾT (##)
    Phân tích sâu vào lĩnh vực "{field}"  
    Liên kết hành tinh + cung + nhà để giải thích

3. LỜI KHUYÊN & ĐỊNH HƯỚNG (##)
    Đưa ra hướng phát triển hoặc cải thiện phù hợp với {name}

 ========================
QUY TẮC FORMAT
========================

- Tiêu đề chính duy nhất: # LUẬN GIẢI BẢN ĐỒ SAO - {name}
- Các đề mục lớn dùng ##.
- Sử dụng Markdown để trình bày đẹp mắt.
- Ngôn ngữ: Tiếng Việt.

========================
OUTPUT JSON DUY NHẤT:
========================
{{"chart": "NỘI DUNG MARKDOWN", "answer": ""}}
"""
        else:
            prompt = f"""

Bạn là chuyên gia chiêm tinh học cao cấp.

========================
QUY TẮC TUYỆT ĐỐI
========================

- CHỈ trả JSON hợp lệ
- KHÔNG markdown
- KHÔNG ```json
- KHÔNG text ngoài JSON
- KHÔNG giải thích lan man

========================
CÂU HỎI
========================
"{context}"

========================
DỮ LIỆU BẢN ĐỒ SAO
========================
{chart_data_str}

========================
BƯỚC 1: XÁC ĐỊNH INTENT (NỘI BỘ)
========================

- Nếu có từ: "công việc", "sự nghiệp" → career
- Nếu có từ: "sức khỏe", "mệt", "stress" → health
- Nếu có từ: "tính cách", "nóng", "cảm xúc" → personality
- Nếu có từ: "tình yêu" → love

⚠️ Có thể có NHIỀU intent cùng lúc

========================
BƯỚC 2: CHỌN YẾU TỐ CHIÊM TINH (BẮT BUỘC)
========================

- career → Nhà 10 + Saturn + Mars
- health → Nhà 6 + Moon + Mars
- personality → Sun + Moon + Asc
- love → Nhà 7 + Venus

⚠️ KHÔNG dùng yếu tố khác ngoài danh sách trên

========================
BƯỚC 3: PHÂN TÍCH (RẤT QUAN TRỌNG)
========================

Mỗi ý PHẢI theo cấu trúc:

- NGUYÊN NHÂN (từ hành tinh / nhà)
→ HÀNH VI (tâm lý / phản ứng)
→ HẬU QUẢ (ảnh hưởng thực tế)

Ví dụ:
- Bạn dễ phản ứng mạnh (Moon/Mars)
→ dẫn đến nóng giận nhanh
→ ảnh hưởng đến sức khỏe và công việc

 ========================
BƯỚC 4: VIẾT OUTPUT (DÙNG MARKDOWN)
=======================

- Sử dụng headings, bold, lists để trình bày đẹp.
- 120–250 từ.

========================
FORMAT JSON:
========================

{{
  "chart": "Nội dung phân tích chi tiết dùng Markdown",
  "answer": "Trả lời trực tiếp câu hỏi người dùng"
}}
"""

        try:
            response = self.llm.invoke(prompt)
            generation = response.content if hasattr(response, "content") else str(response)
        except Exception as e:
            generation = ""

        # 🔥 CLEAN THINK
        generation = re.sub(r"<think>.*?</think>", "", generation, flags=re.DOTALL).strip()
        # 🔥 FIX: loại bỏ text rác ngoài JSON
        generation = generation.strip()

        # ========================
        # 🔥 FIX PARSE JSON (QUAN TRỌNG)
        # ========================
        def extract_json(text: str):
            if not text:
                return {}

            text = text.strip()
            # Loại bỏ block code markdown nếu có
            text = re.sub(r"```json", "", text, flags=re.IGNORECASE)
            text = re.sub(r"```", "", text)

            # Tìm khối JSON lớn nhất
            match = re.search(r"\{.*\}", text, re.DOTALL)

            # ✅ nếu không có JSON → dùng text luôn
            if not match:
                return {
                    "chart": text.strip(),
                    "answer": ""
                }

            json_str = match.group()

            try:
                return json.loads(json_str)
            except:
                try:
                    # Thử sửa lỗi nháy kép chưa được escape trong các trường string
                    # Tìm nội dung giữa "chart": " và ", "answer"
                    c_match = re.search(r'"chart"\s*:\s*"(.*?)"\s*,\s*"answer"', json_str, re.DOTALL)
                    a_match = re.search(r'"answer"\s*:\s*"(.*?)"\s*\}', json_str, re.DOTALL)
                    
                    res = {}
                    if c_match:
                        res["chart"] = c_match.group(1)
                    if a_match:
                        res["answer"] = a_match.group(1)
                    
                    if res: return res
                    
                    # Cách 2: Fix thủ công bằng json.dumps
                    json_str = re.sub(
                        r'"chart"\s*:\s*"(.*?)"\s*,',
                        lambda m: '"chart": ' + json.dumps(m.group(1)) + ',',
                        json_str,
                        flags=re.DOTALL
                    )
                    return json.loads(json_str)
                except:
                    # 🔥 fallback cuối cùng
                    return {
                        "chart": text.strip(),
                        "answer": ""
                    }

        parsed = extract_json(generation)
        if isinstance(parsed.get("chart"), dict):
            parsed["chart"] = json.dumps(parsed["chart"], ensure_ascii=False)

        if not parsed or not parsed.get("chart"):
            parsed = {
                "chart": generation.strip(),
                "answer": ""
            }

        chart_text = parsed.get("chart")
        if isinstance(chart_text, str):
            chart_text = chart_text.replace("\\n", "\n")
            
        def format_output(text: str):
            if not text:
                return ""

            lines = text.split("\n")
            formatted = []

            for line in lines:
                line = line.strip()

                # detect title (all caps or starts with number)
                if re.match(r"^\d+\s+[A-ZÀ-Ỹ\s]+$", line):
                    formatted.append(line.upper())
                else:
                    formatted.append(line)

            return "\n".join(formatted)
        # chart_text = format_output(chart_text)
        # chart_text = normalize_markdown(chart_text)
        if isinstance(chart_text, str):
            chart_text = normalize_markdown(chart_text)
            chart_text = chart_text.strip()

        answer = parsed.get("answer")

        # 🔥 FIX TYPE CHART
        if isinstance(chart_text, dict):
            chart_text = json.dumps(chart_text, ensure_ascii=False)

        if chart_text is None:
            chart_text = ""
        if chart_text:
            chart_text = chart_text.replace("Với vai trò", "").strip()
            chart_text = re.sub(r"\n{3,}", "\n\n", chart_text)
        # 🔥 SAFE CHECK
        if not isinstance(chart_text, str):
            chart_text = str(chart_text)

        if not chart_text:
            chart_text = f"""
Bạn có:
- ☀️ Mặt Trời: {user_chart.sun.sign}
- 🌙 Mặt Trăng: {user_chart.moon.sign}
- ⬆️ Cung Mọc: {user_chart.ascendant.sign}

👉 Đây là bộ ba rất quan trọng tạo nên tính cách và vận mệnh của bạn.

Hãy đặt câu hỏi cụ thể để AI phân tích sâu hơn.
"""

        if isinstance(answer, dict):
            answer = json.dumps(answer, ensure_ascii=False)

        if answer in [None, "null", "None"]:
            answer = ""

        if not isinstance(answer, str):
            answer = str(answer)

        def get_h_num(p):
            try:
                return get_house_number(p.house) if p.house else 0
            except:
                return 0

        return {
            "type": "astrology",
            "chart": chart_text,
            "answer": answer or "",
            "chart_svg": svg_string,
            "chart_summary": {
                "sun": user_chart.sun.sign,
                "moon": user_chart.moon.sign,
                "ascendant": user_chart.ascendant.sign,
                "planets": [
                    {"name": p.name, "sign": p.sign, "house": get_h_num(p)}
                    for p in planets_list
                ]
            }
        }
        
    def run(self, input_data):
        print(f"   ✨ [AstrologyAgent] - Đang luận giải bản đồ sao tổng quát...")
        return self.generate_interpretation(
            birth_info=input_data.get("birth_info", {}),
            field=input_data.get("field", "general"),
            context=input_data.get("question")
        )

    def _format_chart_data(self, chart, planets_list, houses_list):
        planets = [f"- {p.name}: {p.sign}" for p in planets_list]
        houses = [f"- {h.name}: {h.sign}" for h in houses_list]

        return f"""
Ascendant: {chart.ascendant.sign}

Planets:
{chr(10).join(planets)}

Houses:
{chr(10).join(houses)}
"""