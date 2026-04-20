from chatbot.utils.response_cleaner import clean_text
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.security.security import get_current_user
from chatbot.utils.llm import LLM
from chatbot.utils.token_counter import TokenCounter
from app.models.base_db import UserDB
from app.models.base_db import BaseDB
from chatbot.core.ai_system import AISystem
from chatbot.services.astrology_agent import AstrologyChatAgent
from chatbot.services.career_agent import CareerAgent
from chatbot.services.love_agent import LoveAgent
from chatbot.services.daily_agent import DailyAgent
from chatbot.services.health_agent import HealthAgent
from chatbot.services.personality_agent import PersonalityAgent
import os
import re
import json

router = APIRouter(tags=["Chatbot"])


def generate_conversation_title(name, field):

    try:

        if field:
            return f"{field} - {name}"

        return f"Luận giải {name}"

    except:
        return "Luận giải mới"


# =========================
# GLOBAL LLM
# =========================

llm_name = os.environ.get("LLM_NAME", "gemini")
llm = LLM().get_llm(llm_name)
db= BaseDB()
# 🔥 MULTI AGENT
ai_system = AISystem(
    llm=llm,
    db=db,
    astrology_agent=AstrologyChatAgent(llm),
    career_agent=CareerAgent(llm),
    love_agent=LoveAgent(llm),
    daily_agent=DailyAgent(llm),
    personality_agent=PersonalityAgent(llm),
    health_agent=HealthAgent(llm)
)

# =========================
# AI AUTO TITLE
# =========================

def generate_ai_title(text):

    try:
        if not text:
            return "Luận giải mới"

        text = text.strip()

        # bỏ thông tin rác
        text = re.sub(r"Họ tên:.*?\|", "", text)
        text = re.sub(r"Ngày sinh:.*?\|", "", text)
        text = re.sub(r"Nơi sinh:.*?\|", "", text)

        text = text.replace("|", "").strip()

        # lấy câu đầu
        text = text.split(".")[0]

        words = text.split()

        if len(words) > 8:
            text = " ".join(words[:8]) + "..."

        return text

    except:
        return "Luận giải mới"

# =========================
# REQUEST MODELS
# =========================

class AstrologyRequest(BaseModel):
    conversation_id: int | None = None
    name: str
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str
    country: str = "VN"
    field: str
    context: str
    partner: dict | None = None 


class FollowupRequest(BaseModel):
    conversation_id: int
    field: str
    question: str | None = None


class TitleUpdateRequest(BaseModel):
    title: str


class PinUpdateRequest(BaseModel):
    is_pinned: bool


class ChatResponse(BaseModel):
    answer: str
    tokens_charged: float
    user_token_balance: float
    chart_summary: dict | None = None
    chart_svg: str | None = None
    conversation_id: int
    compatibility: int | None = None
    label: str | None = None
    partner_chart_svg: str | None = None
    chart: str | None = None


# ============================================
# CREATE NEW CHAT
# ============================================

@router.post("/conversations")
async def create_conversation(current_user: dict = Depends(get_current_user)):

    db = UserDB()

    conv_id = db.create_conversation(current_user["id"])

    db.close()

    return {"conversation_id": conv_id}


# ============================================
# GET USER CONVERSATIONS
# ============================================

@router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):

    db = UserDB()

    rows = db.get_user_conversations(current_user["id"])

    db.close()

    for r in rows:
        if not r.get("title") or r["title"].lower() == "mới":
            r["title"] = "Đoạn chat mới"

    return {"conversations": rows}

# ============================================
# DELETE CONVERSATION
# ============================================

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: dict = Depends(get_current_user)
):

    db = UserDB()

    try:

        db.delete_conversation(
            current_user["id"],
            conversation_id
        )

        return {"message": "Conversation deleted"}

    finally:

        db.close()


# ============================================
# UPDATE CONVERSATION TITLE
# ============================================

@router.put("/conversations/{conversation_id}/title")
async def update_conversation_title(
    conversation_id: int,
    request: TitleUpdateRequest,
    current_user: dict = Depends(get_current_user)
):

    db = UserDB()

    try:
        # Kiểm tra xem conversation có thuộc về user không
        conv = db.get_conversation(conversation_id)
        if not conv or conv["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

        db.update_conversation_title(conversation_id, request.title)

        return {"message": "Title updated"}

    finally:
        db.close()


# ============================================
# TOGGLE PIN CONVERSATION
# ============================================

@router.put("/conversations/{conversation_id}/pin")
async def toggle_pin_conversation(
    conversation_id: int,
    request: PinUpdateRequest,
    current_user: dict = Depends(get_current_user)
):

    db = UserDB()

    try:
        # Kiểm tra xem conversation có thuộc về user không
        conv = db.get_conversation(conversation_id)
        if not conv or conv["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

        db.update_conversation_pin(conversation_id, request.is_pinned)

        return {"message": "Pin status updated"}

    finally:
        db.close()

# ============================================
# CHAT
# ============================================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_astrology(
    request: AstrologyRequest,
    current_user: dict = Depends(get_current_user)
):

    token_counter = TokenCounter()
    user_db = UserDB()

    try:

        conversation_id = request.conversation_id

        if not conversation_id:
            conversation_id = user_db.create_conversation(
                current_user["id"],
                "Đoạn chat mới"
            )

        # 🔥 CHỈ DÙNG ASTROLOGY AGENT
        is_init = (
            not request.context or
            request.context.strip() == "" or
            request.context == "Tổng quan vận mệnh" or
            "So sánh tình cảm giữa" in request.context
        )
        is_love = request.partner is not None
    
        if is_init and is_love:
            # 💘 FORCE LOVE AGENT
            result = ai_system.registry["love"].run({
                "birth_info": {
                    "name": request.name,
                    "year": request.year,
                    "month": request.month,
                    "day": request.day,
                    "hour": request.hour,
                    "minute": request.minute,
                    "city": request.city,
                    "country": request.country,
                    "partner": request.partner
                },
                "question": None   # 🔥 QUAN TRỌNG
            })

            # LOVE INIT = dùng interpretation làm CHART
            chart_raw = result.get("interpretation", "")
            result["chart"] = ai_system.validator.run(chart_raw)
            result["answer"] = ""   # không cần right panel

        else:
            # 🔮 NORMAL FLOW
            result = await ai_system.run(
                question=None if is_init else request.context,
                birth_info={
                    "user_id": current_user["id"],
                    "name": request.name,
                    "year": request.year,
                    "month": request.month,
                    "day": request.day,
                    "hour": request.hour,
                    "minute": request.minute,
                    "city": request.city,
                    "country": request.country,
                    "partner": request.partner,
                    "field": request.field
                }
            )
        chart_summary = None
        chart_svg = None
        partner_chart_svg = None
        compatibility = None
        label = None

        if isinstance(result, dict):
            answer = result.get("answer", "")

            # PHẢI LẤY TRƯỚC
            chart_svg = result.get("chart_svg")
            chart_summary = result.get("chart_summary")
            partner_chart_svg = result.get("partner_chart_svg")
            compatibility = result.get("compatibility") or 0
            label = result.get("label")

            chart = result.get("chart") or ""

            # FIX INIT KHÔNG CÓ TEXT
            if not chart and chart_summary:
                chart = f"""
        🔮 Tổng quan bản đồ sao:

        - ☀️ Mặt trời: {chart_summary.get('sun')}
        - 🌙 Mặt trăng: {chart_summary.get('moon')}
        - ⬆️ Cung mọc: {chart_summary.get('ascendant')}

        👉 Hãy đặt câu hỏi để AI phân tích sâu hơn.
        """
            # print("CHART:", chart)
            # print("SUMMARY:", chart_summary)

            chart = clean_text(chart)

            # FIX: không xoá answer nếu không có context
            if not request.context:
                answer = answer or ""

            chart_svg = result.get("chart_svg")
            chart_summary = result.get("chart_summary")
            partner_chart_svg = result.get("partner_chart_svg")
            compatibility = result.get("compatibility") or 0
            label = result.get("label")

        else:
            answer = str(result)
            chart = ""

        # =========================
        # FIX CHART (QUAN TRỌNG)
        # =========================
        if not chart:
            if chart_summary:
                chart = json.dumps(chart_summary, ensure_ascii=False)
            else:
                chart = "Bản đồ sao đã được tạo. Hãy đặt câu hỏi để phân tích sâu hơn."

        # =========================
        # TOKEN
        # =========================
        input_text = f"{request.name} {request.field} {request.context}"
        tokens_in = token_counter.count_tokens(input_text)

        # FIX: ưu tiên chart
        generation = answer or chart or ""

        tokens_out = token_counter.count_tokens(generation)
        total_tokens = tokens_in + tokens_out
        cost = token_counter.calculate_cost(total_tokens)

        email = current_user.get("email")
        user = user_db.get_by_email(email)

        if current_user.get("is_admin"):
            new_balance = user.get("token_balance", 0.0)
            cost = 0
        else:
            new_balance = token_counter.deduct_tokens(
                email=email,
                tokens=cost,
                description=f"AI: {request.field}"
            )

        if new_balance is None:
            new_balance = user.get("token_balance", 0.0)

        full_question = f"""
        Họ tên: {request.name} |
        Ngày sinh: {request.day}/{request.month}/{request.year} {request.hour}:{request.minute} |
        Nơi sinh: {request.city} |
        Partner: {json.dumps(request.partner, ensure_ascii=False) if request.partner else "None"}
        """

        # =========================
        # FIX SAVE DB
        # =========================
        chart = clean_text(chart)

        chart_to_save = chart if isinstance(chart, str) else (
            json.dumps(chart_summary, ensure_ascii=False) if chart_summary else "No chart"
        )
        if isinstance(chart_to_save, str):
            chart_to_save = chart_to_save.strip('"')

        answer_to_save = answer or ""

        user_db.save_chat_log(
            user['id'],
            conversation_id,
            full_question,
            answer_to_save,
            cost,
            chart_to_save,
            chart_summary,
            chart_svg,
            partner_chart_svg,
            compatibility,
            label,
            request.partner
        )
        # =========================
        # AUTO UPDATE TITLE (FIX CHUẨN)
        # =========================
        try:
            conv = user_db.get_conversation(conversation_id)

            if conv:
                raw_text = (
                    request.context.strip()
                    if request.context and request.context.strip()
                    else f"Luận giải {request.name}"
                )

                new_title = generate_ai_title(raw_text)

                user_db.update_conversation_title(
                    conversation_id,
                    new_title
                )

        except Exception as e:
            print("Auto title error:", e)
        # =========================
        # RESPONSE
        # =========================
        return ChatResponse(
            answer="" if not request.context else answer_to_save,
            chart=chart_to_save,
            chart_summary=chart_summary,
            chart_svg=chart_svg,
            partner_chart_svg=partner_chart_svg,
            compatibility=compatibility,
            label=label,
            conversation_id=conversation_id,
            tokens_charged=float(cost),
            user_token_balance=float(new_balance),
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        token_counter.close()
        user_db.close()
    

# ============================================
# CHAT FOLLOWUP
# ============================================

@router.post("/chat-followup")
async def chat_followup(
    request: FollowupRequest,
    current_user: dict = Depends(get_current_user)
):

    token_counter = TokenCounter()
    user_db = UserDB()

    try:

        logs = user_db.get_user_chat_logs(request.conversation_id)

        if not logs:
            raise HTTPException(
                status_code=400,
                detail="Conversation không tồn tại"
            )

        first_question = logs[0]["question"]

        # ================= PARSE USER =================
        name_match = re.search(r"Họ tên:\s*(.*?)\s*\|", first_question)
        date_match = re.search(
            r"Ngày sinh:\s*(\d+)/(\d+)/(\d+)\s*(\d+):(\d+)",
            first_question
        )
        city_match = re.search(r"Nơi sinh:\s*(.*?)\s*\|", first_question)
        partner_match = re.search(r"Partner:\s*(\{.*\}|None)", first_question)

        partner_data = None
        if partner_match and partner_match.group(1) != "None":
            try:
                partner_data = json.loads(partner_match.group(1))
            except:
                partner_data = None

        birth_info = {
            "user_id": current_user["id"],
            "name": name_match.group(1) if name_match else "Người dùng",
            "day": int(date_match.group(1)) if date_match else 1,
            "month": int(date_match.group(2)) if date_match else 1,
            "year": int(date_match.group(3)) if date_match else 2000,
            "hour": int(date_match.group(4)) if date_match else 0,
            "minute": int(date_match.group(5)) if date_match else 0,
            "city": city_match.group(1) if city_match else "Hanoi",
            "country": "VN",
            "partner": partner_data
        }

        if not request.question:
            return {
                "answer": "",
                "analysis": "",
            }
        # =========================
        # 🛑 GUARD (FIX BUG QUAN TRỌNG)
        # =========================
        guard = ai_system.guard.run(request.question)

        # print("GUARD FOLLOWUP:", guard)

        if not guard.get("is_astrology") or guard.get("confidence", 0) < 0.8:
            # Vẫn trừ token cho câu hỏi này
            tokens_in = token_counter.count_tokens(request.question)
            tokens_out = token_counter.count_tokens("XIN LỖI TÔI CHỈ LÀ CHATBOT CHIÊM TINH")
            cost = token_counter.calculate_cost(tokens_in + tokens_out)
            
            email = current_user.get("email")
            if current_user.get("is_admin"):
                user = user_db.get_by_email(email)
                new_balance = user.get("token_balance", 0.0)
                cost = 0
            else:
                new_balance = token_counter.deduct_tokens(
                    email=email,
                    tokens=cost,
                    description="AI followup (Off-topic)"
                )
            
            if new_balance is None:
                user = user_db.get_by_email(email)
                new_balance = user.get("token_balance", 0.0)

            return {
                "answer": "XIN LỖI TÔI CHỈ LÀ CHATBOT CHIÊM TINH",
                "analysis": "",
                "chart": "",
                "chart_svg": None,
                "partner_chart_svg": None,
                "chart_summary": None,
                "tokens_charged": float(cost),
                "user_token_balance": float(new_balance),
                "conversation_id": request.conversation_id,
            }

        # ================= 🔥 DETECT LOVE =================
        is_love = any(log.get("partner_chart_svg") for log in logs)

        # ================= 🔥 LOAD PARTNER =================
        partner_data = None

        for log in logs:
            if log.get("partner_json"):
                try:
                    partner_data = json.loads(log["partner_json"])
                    break
                except:
                    pass

        birth_info["partner"] = partner_data

        last_raw_data = None

        for log in reversed(logs):
            if log.get("raw_data"):
                try:
                    last_raw_data = json.loads(log["raw_data"])
                    # print("INTENTS:", intents)
                    # print("=========================================\n")
                    break
                except:
                    pass

        # =========================================
        # 🔮 1. ASTROLOGY (LUÔN CHẠY)
        # =========================================
        astro_result = ai_system.astrology.run({
            "birth_info": birth_info,
            "question": request.question,
            "memory": last_raw_data
        })

        raw_chart = astro_result.get("chart")
        analysis = clean_text(raw_chart).strip()
        chart_svg = astro_result.get("chart_svg")
        partner_chart_svg = astro_result.get("partner_chart_svg")


        # =========================================
        # 🤖 2. MULTI-AGENT (SPAWN)
        # =========================================
        intents, _ = ai_system.analyze(request.question, current_user["id"], birth_info)

        agents = ai_system.spawn(intents)

        answer = ""

        if agents:
            results = await ai_system.run_agents(
                agents,
                {
                    "question": request.question,
                    "birth_info": birth_info,
                    "memory": last_raw_data
                }
            )

            answer = clean_text(ai_system.fuse(results, request.question))

        # ================= TOKEN =================
        input_text = request.question
        tokens_in = token_counter.count_tokens(input_text)

        generation = answer or analysis or ""

        tokens_out = token_counter.count_tokens(generation)
        total_tokens = tokens_in + tokens_out
        cost = token_counter.calculate_cost(total_tokens)

        email = current_user.get("email")
        user = user_db.get_by_email(email)

        if current_user.get("is_admin"):
            new_balance = user.get("token_balance", 0.0)
            cost = 0
        else:
            new_balance = token_counter.deduct_tokens(
                email=email,
                tokens=cost,
                description=f"AI followup"
            )

        # 🔥 LẤY CHART GẦN NHẤT
        last_chart = ""
        last_chart_svg = None
        last_partner_chart_svg = None

        for log in reversed(logs):
            if log.get("chart_svg"):
                last_chart = clean_text(log.get("chart"))
                last_chart_svg = log.get("chart_svg")
                last_partner_chart_svg = log.get("partner_chart_svg")
                break
        # ================= SAVE =================
        # user_db.save_chat_log(
        #     current_user["id"],
        #     request.conversation_id,
        #     request.question,
        #     answer,
        #     cost,
        #     analysis,
        #     None,
        #     None,
        #     None,
        #     None,
        #     None,
        #     partner_data
        # )
        # ================= VALIDATION =================
        answer = ai_system.validator.run(answer)
        analysis = ai_system.validator.run(analysis)

        user_db.save_chat_log(
            current_user["id"],
            request.conversation_id,
            request.question,
            answer,
            cost,
            analysis,
            None,
            chart_svg,
            partner_chart_svg,
            None,
            None,
            partner_data
        )

        return {
            "answer": answer,
            "analysis": analysis,
            # "chart": None,
            # "chart_svg": None,
            "chart": clean_text(last_chart),
            "chart_svg": last_chart_svg,
            "partner_chart_svg": last_partner_chart_svg,
            "chart_summary": None,
            "tokens_charged": float(cost),
            "user_token_balance": float(new_balance),
            "conversation_id": request.conversation_id,
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        token_counter.close()
        user_db.close()

# ============================================
# GET CHAT HISTORY
# ============================================
@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):

    user_db = UserDB()

    conversations = user_db.get_user_conversations(current_user["id"])

    history = []

    for conv in conversations:

        logs = user_db.get_user_chat_logs(conv["id"])

        for log in logs:

            history.append({
                "id": f"q-{log['id']}",
                "role": "user",
                "content": log["question"],
                "timestamp": log["created_at"],
                "conversation_id": conv["id"]
            })

            # 🔥 FIX CONTENT NULL
            history.append({
                "id": f"a-{log['id']}",
                "role": "assistant",
                "content": log["answer"] or "",
                "analysis": log["chart"] or "",
                "answer": log["answer"] or "",
                "timestamp": log["created_at"],
                "tokens_charged": log["tokens_charged"],
                "chart_summary": log.get("chart_summary"),
                "chart_svg": log.get("chart_svg"),
                "partner_chart_svg": log.get("partner_chart_svg"),
                "compatibility": log.get("compatibility"),
                "label": log.get("label"),
                "conversation_id": conv["id"]
            })

    user_db.close()

    return {"history": history}

# ============================================
# DELETE HISTORY
# ============================================

@router.delete("/history")
async def delete_chat_history(current_user: dict = Depends(get_current_user)):

    user_db = UserDB()

    user_db.delete_user_chat_logs(current_user["id"])

    user_db.close()

    return {"message": "Đã xóa lịch sử chat thành công"}


# ============================================
# SITE CONFIG
# ============================================

@router.get("/config")
async def get_site_config():

    db = UserDB()

    logo_url = db.get_setting("logo_url", "")
    site_title = db.get_setting("site_title", "Zodiac Whisper")
    background_url = db.get_setting("background_url", "")
    favicon_url = db.get_setting("favicon_url", "")
    

    db.close()

    return {
        "logo_url": logo_url,
        "site_title": site_title,
        "background_url": background_url,
        "favicon_url": favicon_url
    }