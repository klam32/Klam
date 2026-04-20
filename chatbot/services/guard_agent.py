import json
import re


class GuardAgent:
    def __init__(self, llm):
        self.llm = llm

    def _build_prompt(self, question: str) -> str:
        return f"""
Bạn là hệ thống kiểm duyệt thông minh.

========================
NHIỆM VỤ
========================
Xác định câu hỏi có thể trả lời bằng CHIÊM TINH hay không.

========================
ĐƯỢC PHÉP (TRUE)
========================
Bao gồm:

1. Chiêm tinh trực tiếp:
- cung hoàng đạo
- bản đồ sao
- hành tinh

2. Câu hỏi cá nhân có thể luận giải bằng chiêm tinh:
- "Hôm nay tôi thế nào?"
- "Tình yêu của tôi ra sao?"
- "Sức khỏe tôi ổn không?"
- "Công việc tôi thế nào?"

========================
KHÔNG ĐƯỢC PHÉP (FALSE)
========================
- Code, lập trình
- IT, kỹ thuật
- Hỏi kiến thức chuyên ngành
- Hỏi ngoài đời không liên quan cá nhân
- Hỏi về luật các luật
- Hỏi về lịch sử 

========================
QUY TẮC
========================
- Nếu câu hỏi liên quan đến bản thân người hỏi → TRUE
- Nếu có thể dùng chiêm tinh để trả lời → TRUE
- Nếu là kỹ thuật / code → FALSE

========================
CÂU HỎI
========================
"{question}"

========================
OUTPUT JSON:
{{
  "is_astrology": true/false,
  "confidence": 0-1
}}
"""

    def _extract_json(self, text: str):
        if not text:
            return None

        # remove markdown
        text = re.sub(r"```json", "", text, flags=re.IGNORECASE)
        text = re.sub(r"```", "", text)

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            return None

        try:
            return json.loads(match.group())
        except:
            return None

    def _fallback_rule(self, question: str) -> bool:
        """
        Rule backup để chống LLM ngu
        """
        blacklist = [
            "python", "code", "lập trình", "java", "c++",
            "api", "html", "css", "javascript", "react"
        ]
        q = (question or "").lower()
        return not any(k in q for k in blacklist)
    
    def _allow_personal_question(self, question: str) -> bool:
        keywords = [
            "tôi", "mình", "tình yêu", "sức khỏe",
            "hôm nay", "công việc", "tính cách"
        ]
        q = (question or "").lower()

        return any(k in q for k in keywords)
    def run(self, question: str):

        if not question or not question.strip():
            return {"is_astrology": False, "confidence": 0}

        prompt = self._build_prompt(question)

        try:
            res = self.llm.invoke(prompt)
            content = res.content if hasattr(res, "content") else str(res)

            data = self._extract_json(content)

            if not data:
                return {"is_astrology": False, "confidence": 0}

            is_astro = bool(data.get("is_astrology", False))
            confidence = float(data.get("confidence", 0))

            # =========================
            # 🔥 FINAL DECISION (QUAN TRỌNG)
            # =========================
            if (
                not is_astro
                or confidence < 0.8
                or not self._fallback_rule(question)
            ):
                return {"is_astrology": False, "confidence": confidence}

            return {"is_astrology": True, "confidence": confidence}

        except Exception as e:
            print("GuardAgent error:", e)
            return {"is_astrology": False, "confidence": 0}