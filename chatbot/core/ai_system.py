import asyncio
import json
import re
import vertexai
from chatbot.utils.text_cleaner import normalize_markdown
from chatbot.services.guard_agent import GuardAgent
from chatbot.services.validator_agent import ValidatorAgent

# =========================
# INIT VERTEX
# =========================
vertexai.init(
    project="cccccc-490110",
    location="us-central1"
)

# =========================================================
# 🚀 MAIN SYSTEM (LLM-ONLY)
# =========================================================
class AISystem:

    def __init__(
        self,
        llm,
        db,
        astrology_agent,
        career_agent,
        love_agent,
        daily_agent,
        personality_agent,
        health_agent
    ):
        self.llm = llm
        self.db = db
        self.guard = GuardAgent(llm)
        self.validator = ValidatorAgent(llm)

        # 🔮 astrology
        self.astrology = astrology_agent

        # 🤖 registry
        self.registry = {
            "career": career_agent,
            "love": love_agent,
            "daily": daily_agent,
            "personality": personality_agent,
            "health": health_agent
        }


    # =====================================================
    # 🧠 ALL-IN-ONE ANALYZER 
    # =====================================================
    def analyze(self, question, user_id, birth_info):
        memory = self.db.get_user_memory(user_id) or {}

        # print("\n================ AI ANALYZER ================")
        # print("Question:", question)
        # print("Memory:", memory)
        has_partner = birth_info.get("partner") is not None
        prompt = f"""
Bạn là AI phân tích cực kỳ chính xác và logic.

NHIỆM VỤ:
Phân tích câu hỏi của user và trả về:
- intents (đúng bản chất câu hỏi)
- traits (nếu có)
- profile (cập nhật user)

========================
⚠️ NGUYÊN TẮC QUAN TRỌNG
========================
1. LUÔN ưu tiên câu hỏi hiện tại
2. KHÔNG bị bias bởi lịch sử nếu không liên quan
3. CHỈ chọn intent nếu thực sự liên quan
4. Không đoán bừa
5. Không suy diễn ngoài câu hỏi

========================
NGỮ CẢNH HỆ THỐNG
========================
- Có partner: {has_partner}

QUY TẮC:

- Nếu câu có: "chúng tôi", "tụi tôi", "2 đứa"
→ phải có intent "love"

- Nếu chỉ hỏi "tôi"
→ KHÔNG ép love

- Nếu không liên quan tình cảm
→ KHÔNG chọn love

========================
USER PROFILE (tham khảo, KHÔNG override câu hỏi)
========================
{memory}

========================
CÂU HỎI
========================
"{question}"

========================
INTENTS
========================
- career: công việc, sự nghiệp, định hướng, tiền
- love: tình yêu, mối quan hệ
- personality: tính cách, tâm lý, hành vi cá nhân
- daily: cuộc sống hàng ngày, dự đoán, thói quen
- health: sức khỏe, thể chất, năng lượng, stress

========================
HƯỚNG DẪN PHÂN LOẠI (RẤT QUAN TRỌNG)
========================

- career → công việc, tiền, định hướng
- love → tình yêu, mối quan hệ
- personality → cảm xúc, tâm lý, hành vi
- health → sức khỏe, stress, thể chất
- daily → dự đoán hàng ngày, sinh hoạt chung

========================
QUY TẮC CHỌN INTENT
========================

- Chọn TẤT CẢ các lĩnh vực xuất hiện trong câu hỏi
- KHÔNG giới hạn số lượng
- KHÔNG bỏ sót nếu có liên quan rõ ràng
- KHÔNG chọn nếu chỉ liên quan yếu

========================
VÍ DỤ
========================

"Tôi thất tình và ảnh hưởng công việc"
→ ["love", "career"]

"Tôi stress, mất ngủ, công việc sa sút"
→ ["health", "personality", "career"]

"Hôm nay tôi thế nào?"
→ ["daily"]

========================
TRAITS
========================
- Chỉ trích xuất nếu câu thể hiện đặc điểm cá nhân
- Ví dụ:
  "tôi dễ chán" → ["dễ chán"]
  "hay mất động lực" → ["mất động lực"]
- Nếu không có → []

========================
PROFILE UPDATE
========================
- traits: giữ tối đa 10 cái gần nhất
- focus: là danh sách intent user thường hỏi
- KHÔNG được mất dữ liệu cũ

========================
⚠️ OUTPUT BẮT BUỘC
========================
- CHỈ trả JSON
- KHÔNG giải thích
- KHÔNG text ngoài JSON

Format:

{{
  "intents": ["love", "health", "personality", "career","daily"],
  "traits": [],
  "profile": {{
    "traits": [],
    "focus": ["love", "health", "personality", "career","daily"]
  }}
}}
"""

        try:
            res = self.llm.invoke(prompt)
            content = res.content if hasattr(res, "content") else str(res)
            
            print(f"🔍 [ANALYZER] Raw Content: {content}")

            match = re.search(r"\{.*\}", content, re.DOTALL)

            if match:
                data = json.loads(match.group(0))
                print(f"✅ [ANALYZER] Parsed Data: {data}")

                intents = data.get("intents", [])
                q = (question or "").lower()
                has_partner = birth_info.get("partner") is not None

                # ❌ nếu LLM chọn love nhưng câu không liên quan → bỏ
                if "love" in intents:
                    if not re.search(r"(yêu|tình|vợ|chồng|cưới|hôn|gia đình|kết hôn|người yêu)", q):
                        intents = [i for i in intents if i != "love"]

                # 🔥 LOẠI BỎ TRÙNG + GIỮ THỨ TỰ
                seen = set()
                intents = [i for i in intents if not (i in seen or seen.add(i))]

                # 🔥 VALIDATE 1 LẦN DUY NHẤT
                intents = [i for i in intents if i in self.registry]

                if not intents:
                    intents = ["personality"]

                profile = data.get("profile", memory)

                # print("INTENTS:", intents)
                # print("=========================================\n")

                return intents, profile

        except Exception as e:
            print("ANALYZER ERROR:", e)

        return ["personality"], memory

    # =====================================================
    # 🚀 SPAWN
    # =====================================================
    def spawn(self, intents):

        agents = [
            self.registry[i]
            for i in intents
            if i in self.registry
        ]

        # print("SPAWN AGENTS:", [type(a).__name__ for a in agents])
        return agents

    # =====================================================
    # ⚡ RUN PARALLEL
    # =====================================================
    async def run_agents(self, agents, input_data):

        loop = asyncio.get_event_loop()

        async def run(agent):
            return await loop.run_in_executor(
                None,
                lambda: agent.run(input_data)
            )

        return await asyncio.gather(*[run(a) for a in agents])

    # =====================================================
    # 🧠 FUSION (LLM)
    # =====================================================
    
    def fuse(self, results, question):

        # =========================
        # 🔥 LẤY TOÀN BỘ OUTPUT
        # =========================
        answers = []

        for r in results:
            if isinstance(r, dict):
                ans = r.get("answer", "")
                if ans and not ans.strip().startswith("{"):
                    answers.append(ans)

        # print("\nFUSION INPUT:")
        # for a in answers:
        #     print("-", a[:80])
        # print("================================\n")

        if not answers:
            return "Không đủ dữ liệu để trả lời."

        # =========================
        # 🔥 LLM TỰ QUYẾT ĐỊNH
        # =========================
        prompt = f"""
Bạn là AI tổng hợp đa chuyên gia cực kỳ thông minh.

Câu hỏi:
{question}

Dữ liệu từ các chuyên gia:
{chr(10).join(answers)}

========================
NHIỆM VỤ
========================

- Gộp thành 1 câu trả lời DUY NHẤT
- KHÔNG chia section
- KHÔNG ghi tên agent

========================
QUY TẮC QUAN TRỌNG
========================

1. Nếu có [DAILY] hoặc có dòng 📅 → LUÔN đặt lên đầu
2. Ưu tiên nội dung trả lời đúng câu hỏi
3. Loại bỏ nội dung không liên quan
4. Không lặp ý
5. Viết mượt như chuyên gia thật
6. Nếu nhiều góc nhìn → gộp logic, không tách rời

========================
TRẢ LỜI:
"""

        res = self.llm.invoke(prompt)
        final = res.content if hasattr(res, "content") else str(res)

        return normalize_markdown(final)

    # =====================================================
    # 🚀 MAIN
    # =====================================================
    async def run(self, question, birth_info):
        # =========================
        # 🛑 GUARD LLM
        # =========================
        if question:
            guard = self.guard.run(question)

            # print("GUARD:", guard)

            if not guard.get("is_astrology") or guard.get("confidence", 0) < 0.6:
                print(f"[GUARD] Blocked! Confidence: {guard.get('confidence', 0)}")
                return {
                    "mode": "chat",
                    "chart": "",
                    "chart_svg": None,
                    "chart_summary": None,
                    "answer": "XIN LỖI TÔI CHỈ LÀ CHATBOT CHIÊM TINH"
                }

        user_id = birth_info.get("user_id", 1)
        # # 🚨 FILTER THÔNG MINH
        # if question and not self.is_astrology_question(question):
        #     return {
        #         "mode": "chat",
        #         "chart": "",
        #         "chart_svg": None,
        #         "chart_summary": None,
        #         "answer": "XIN LỖI TÔI CHỈ LÀ CHATBOT CHIÊM TINH"
        #     }
    
        # =================================================
        # 🔮 LUÔN CHẠY ASTROLOGY VÀ ANALYZE SONG SONG
        # =================================================
        async def get_astro():
            return await asyncio.to_thread(self.astrology.run, {
                "birth_info": birth_info,
                "field": birth_info.get("field", "general"),
                "question": question or ""
            })

        async def get_intents():
            return await asyncio.to_thread(self.analyze, question, user_id, birth_info)

        # Chạy song song 2 tác vụ nặng nhất
        astro_result, (intents, profile) = await asyncio.gather(get_astro(), get_intents())

        astro_result["answer"] = ""  
        chart = astro_result.get("chart")
        chart_svg = astro_result.get("chart_svg")
        chart_summary = astro_result.get("chart_summary")

        # =================================================
        # ❌ KHÔNG CÓ CÂU HỎI → CHỈ TRẢ CHART
        # =================================================
        if not question or question.strip() == "":
            return {
                "mode": "init",
                "chart": chart,
                "chart_svg": chart_svg,
                "chart_summary": chart_summary,
                "answer": ""
            }

        # save memory
        try:
            self.db.update_user_memory(user_id, profile)
        except Exception as e:
            print("MEMORY ERROR:", e)

        # =================================================
        # 🤖 MULTI-AGENT (PHỤ)
        # =================================================
        print("\n" + "🚀" * 30)
        print(f"   [AI SYSTEM] - XỬ LÝ CÂU HỎI")
        print(f"   💬 Question: {question}")
        print(f"   🎯 Intents:  {intents}")
        
        agents = self.spawn(intents)
        print(f"   🤖 Spawning: {[type(a).__name__ for a in agents]}")
        print("🚀" * 30 + "\n")

        answer = ""

        if agents:
            results = await self.run_agents(
                agents,
                {
                    "question": question,
                    "birth_info": birth_info,
                    #"chart_context": chart
                }
            )

            answer = self.fuse(results, question) or ""

        # =========================
        # 🧪 VALIDATION
        # =========================
        answer = self.validator.run(answer)
        chart = self.validator.run(chart)

        return {
            "mode": "chat",
            "chart": chart,
            "chart_svg": chart_svg,
            "chart_summary": chart_summary,
            "answer": answer
        }
