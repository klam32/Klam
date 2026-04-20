from fastapi import APIRouter, Depends, HTTPException
from app.security.security import get_current_user
from chatbot.utils.llm import LLM
from chatbot.utils.token_counter import TokenCounter
from app.models.base_db import UserDB, ChatHistoryDB
from pydantic import BaseModel
import os
import json
import calendar as py_calendar
from datetime import datetime
import re

router = APIRouter(prefix="/calendar", tags=["Calendar"])

class CalendarRequest(BaseModel):
    month: int
    year: int
    field: str
    birth_info: dict | None = None
    conversation_id: int | None = None

@router.post("/good-bad-days")
async def get_good_bad_days(request: CalendarRequest, current_user: dict = Depends(get_current_user)):
    user_db = UserDB()
    history_db = ChatHistoryDB()
    token_counter = TokenCounter()
    
    try:
        # Check if month/year is in the past
        now = datetime.now()
        if request.year < now.year or (request.year == now.year and request.month < now.month):
             raise HTTPException(status_code=400, detail="Vui lòng chọn tháng trong hiện tại hoặc tương lai.")

        llm_name = os.environ.get("LLM_NAME", "vertex")
        llm = LLM().get_llm(llm_name)
        
        # Determine number of days in month
        _, num_days = py_calendar.monthrange(request.year, request.month)
        
        birth_context = ""
        if request.birth_info:
            birth_context = f"""
            Thông tin người dùng:
            Họ tên: {request.birth_info.get('name')}
            Ngày sinh: {request.birth_info.get('day')}/{request.birth_info.get('month')}/{request.birth_info.get('year')}
            Nơi sinh: {request.birth_info.get('city')}
            """

        prompt = f"""
        Bạn là chuyên gia chiêm tinh học cao cấp. Hãy lập lịch Cát Tường tháng {request.month}/{request.year} CHUYÊN BIỆT cho lĩnh vực: "{request.field}".
        {birth_context}
        
        HƯỚNG DẪN CHUYÊN MÔN THEO LĨNH VỰC "{request.field}":
        - Tình cảm & Mối quan hệ: Tập trung vào Sao Kim (Venus), Mặt Trăng (Moon), Nhà 5 và Nhà 7.
        - Sự nghiệp & Công danh: Tập trung vào Mặt Trời (Sun), Sao Thổ (Saturn), Sao Mộc (Jupiter), Nhà 10.
        - Tài lộc & Kinh doanh: Tập trung vào Sao Mộc (Jupiter), Sao Kim (Venus), Sao Thủy (Mercury), Nhà 2 và Nhà 8.
        - Sức khỏe & Bình an: Tập trung vào Mặt Trăng (Moon), Sao Thổ (Saturn), Nhà 6.
        - Tổng quan: Phân tích tất cả các góc chiếu lớn của các hành tinh quá cảnh tới bản đồ sao gốc.

        NHIỆM VỤ BẮT BUỘC:
        1. Phân tích tác động của các hành tinh quá cảnh (Transits) đối với bản đồ sao cá nhân của người dùng, tập trung DUY NHẤT vào khía cạnh "{request.field}".
        2. Phân loại TẤT CẢ các ngày từ 1 đến {num_days} thành: "good" (Cát), "bad" (Hung), hoặc "neutral" (Bình). 
           - ⚠️ TRÁNH TỐI ĐA việc để tất cả là "neutral". Bạn PHẢI tìm ra ít nhất 3-5 ngày "good" và 3-5 ngày "bad" có tác động rõ rệt nhất tới lĩnh vực "{request.field}".
        3. Viết đoạn tóm tắt (summary) chuyên sâu (100-150 từ) giải thích tại sao tháng này lại có xu hướng như vậy cho lĩnh vực "{request.field}".

        YÊU CẦU ĐỊNH DẠNG: Chỉ trả về khối JSON duy nhất, không có văn bản thừa.
        {{
          "days": [
            {{"day": 1, "quality": "good", "reason": "Lý do..."}},
            ...
            {{"day": {num_days}, "quality": "neutral", "reason": "Lý do..."}}
          ],
          "summary": "Phân tích xu hướng tổng thể..."
        }}
        """
        
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        
        # --- HỆ THỐNG BÓC TÁCH DỮ LIỆU ĐA LỚP ---
        # --- HỆ THỐNG BÓC TÁCH DỮ LIỆU ĐA LỚP (SIÊU BỀN BỈ) ---
        def extract_json(text):
            code_block = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
            if code_block: return code_block.group(1)
            first = text.find('{'); last = text.rfind('}')
            return text[first:last+1] if first != -1 and last != -1 else text

        def surgical_repair(raw_json):
            # 1. Làm sạch ký tự ẩn và ký tự điều khiển (giữ lại khoảng trắng)
            raw_json = re.sub(r"[\u200b-\u200d\ufeff\u0000-\u0009\u000b-\u001f]", " ", raw_json)
            # 2. Sửa lỗi dấu phẩy thừa
            raw_json = re.sub(r",\s*([\]\}])", r"\1", raw_json)
            # 3. Thử sửa lỗi dấu ngoặc kép không escape trong "reason" và "summary"
            # Anchor: kết thúc bằng dấu đóng ngoặc kép theo sau là dấu phẩy hoặc dấu đóng ngoặc nhọn
            for field in ["reason", "summary"]:
                pattern = f'("{field}"\\s*:\\s*")(.*?)("(?=\\s*[,\\}}\\]]))'
                raw_json = re.sub(pattern, lambda m: m.group(1) + m.group(2).replace('"', '\\"') + m.group(3), raw_json, flags=re.DOTALL)
            return raw_json

        def regex_harvest(text):
            """Lưới an toàn cuối cùng: Quét trực tiếp text thô để nhặt dữ liệu"""
            days = []
            # 1. Nhặt từng ngày: Tìm cụm {"day": X, ... "reason": "..."}
            # Sử dụng regex tìm kiếm từng block { } chứa "day"
            blocks = re.findall(r'\{[^{}]*?"day"\s*:\s*\d+.*?\}', text, re.DOTALL)
            for block in blocks:
                try:
                    d_match = re.search(r'"day"\s*:\s*(\d+)', block)
                    q_match = re.search(r'"quality"\s*:\s*"(good|bad|neutral)"', block)
                    # Tìm reason: lấy từ dấu " sau reason: đến dấu " cuối cùng trước dấu }
                    r_match = re.search(r'"reason"\s*:\s*"(.*)"\s*\}', block, re.DOTALL)
                    
                    if d_match and q_match:
                        reason = r_match.group(1) if r_match else ""
                        if not reason:
                            # Fallback cho reason nếu regex trên quá chặt
                            r_match_loose = re.search(r'"reason"\s*:\s*"(.*)', block, re.DOTALL)
                            if r_match_loose:
                                reason = re.sub(r'["\}\s]+$', '', r_match_loose.group(1))
                        
                        days.append({
                            "day": int(d_match.group(1)),
                            "quality": q_match.group(1),
                            "reason": reason.replace('\\"', '"').strip()
                        })
                except:
                    continue
            
            # Sắp xếp theo ngày
            days = sorted({d['day']: d for d in days}.values(), key=lambda x: x['day'])

            # 2. Nhặt summary: Thuật toán "Bóc vỏ"
            summary = ""
            s_match = re.search(r'"summary"\s*:\s*"(.*)', text, re.DOTALL)
            if s_match:
                content = s_match.group(1)
                # Tìm dấu ngoặc nhọn đóng cuối cùng của root object
                last_brace = content.rfind('}')
                if last_brace != -1:
                    summary = content[:last_brace].strip()
                else:
                    summary = content.strip()
                
                # Loại bỏ dấu ngoặc kép kết thúc của giá trị summary (greedy)
                summary = re.sub(r'"\s*$', '', summary)
            else:
                # Fallback: lấy đoạn văn bản có ý nghĩa nhất
                texts = [t.strip() for t in re.split(r'["\{\}\[\]]', text) if len(t.strip()) > 50]
                summary = texts[-1] if texts else "Dữ liệu tóm tắt hiện không khả dụng."
            
            return days, summary

        days_data = []
        summary = ""

        try:
            raw_json = extract_json(content)
            repaired_json = surgical_repair(raw_json)
            try:
                data = json.loads(repaired_json)
                days_data = data.get("days", [])
                summary = data.get("summary", "")
            except Exception as e:
                print(f"JSON loads failed after repair: {e}. Falling back to Regex Harvest.")
                days_data, summary = regex_harvest(content)
        except Exception as e:
            print(f"Deep extraction error: {e}")
            days_data, summary = regex_harvest(content)

        # Kiểm tra cuối cùng
        if not days_data:
            days_data, summary = regex_harvest(content)

        # Làm sạch summary triệt để
        summary = str(summary).replace("\\n", "\n").replace('\\"', '"').strip()
        summary = re.sub(r'["\}\]]+$', "", summary).strip()
            
        # 3. TẠO ĐOẠN CHAT RIÊNG BIỆT CHO LỊCH CÁT TƯỜNG
        # Tự động tạo conversation mới với tiêu đề chuyên biệt
        conv_title = f"[Lịch Cát Tường] - Tháng {request.month}/{request.year}"
        new_conv_id = history_db.create_conversation(current_user["id"], title=conv_title)
        
        msg_user = f"Xem lịch cát tường tháng {request.month}/{request.year} - Lĩnh vực: {request.field}"
        
        # Đếm số ngày tốt/xấu
        good_days = [d['day'] for d in days_data if d['quality'] == 'good']
        bad_days = [d['day'] for d in days_data if d['quality'] == 'bad']
        
        msg_bot = f"### 🗓️ LỊCH CÁT TƯỜNG THÁNG {request.month}/{request.year}\n\n"
        msg_bot += f"**Lĩnh vực:** {request.field}\n\n"
        msg_bot += f"✅ **Ngày tốt:** {', '.join(map(str, good_days)) if good_days else 'Không có'}\n"
        msg_bot += f"❌ **Ngày xấu:** {', '.join(map(str, bad_days)) if bad_days else 'Không có'}\n\n"
        msg_bot += f"**Tóm lược:**\n{summary}"
        
        # history_db.add_message removed - we use save_chat_log below for structured data

        # Deduct tokens
        tokens = token_counter.count_tokens(prompt + content)
        cost = token_counter.calculate_cost(tokens)
        
        email = current_user.get("email")
        if not current_user.get("is_admin"):
            new_balance = token_counter.deduct_tokens(
                email=email,
                tokens=cost,
                description=f"Lịch Cát Tường: {request.field}"
            )
        else:
            db_user = user_db.get_by_email(email)
            new_balance = db_user.get("token_balance", 0) if db_user else 0

        # Lưu dữ liệu cấu trúc để phục vụ xem lại lịch sử
        chart_data = {
            "days": days_data,
            "summary": summary,
            "field": request.field,
            "month": request.month,
            "year": request.year,
            "birth_info": request.birth_info.dict() if hasattr(request.birth_info, "dict") else request.birth_info
        }
        
        history_db.save_chat_log(
            user_id=current_user["id"],
            conversation_id=new_conv_id,
            question=msg_user,
            answer=msg_bot,
            tokens_charged=cost,
            chart="calendar",
            chart_summary=chart_data
        )

        return {
            "days": days_data,
            "summary": summary,
            "user_token_balance": new_balance,
            "conversation_id": new_conv_id
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        user_db.close()
        history_db.close()
        token_counter.close()
