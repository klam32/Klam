from fastapi import APIRouter, Depends, HTTPException
from app.security.security import get_current_user
from chatbot.utils.llm import LLM
from chatbot.utils.token_counter import TokenCounter
from app.models.base_db import UserDB, ChatHistoryDB
from pydantic import BaseModel
import os
import json
from datetime import datetime
import re

router = APIRouter(prefix="/prediction", tags=["Prediction"])

class PredictionRequest(BaseModel):
    date: str  # YYYY-MM-DD
    field: str # Sự nghiệp, Tình cảm, Sức khỏe...
    birth_info: dict
    conversation_id: int = None

@router.post("/daily")
async def get_daily_prediction(request: PredictionRequest, current_user: dict = Depends(get_current_user)):
    user_db = UserDB()
    history_db = ChatHistoryDB()
    token_counter = TokenCounter()
    
    try:
        llm_name = os.environ.get("LLM_NAME", "vertex")
        llm = LLM().get_llm(llm_name)
        
        # 1. Thu thập bối cảnh
        birth = request.birth_info
        birth_context = f"""
        THÔNG TIN GỐC CỦA NGƯỜI DÙNG:
        - Họ tên: {birth.get('name')}
        - Ngày sinh: {birth.get('day')}/{birth.get('month')}/{birth.get('year')}
        - Giờ sinh: {birth.get('hour')}:{birth.get('minute')}
        - Nơi sinh: {birth.get('city')}
        """

        # 2. Xây dựng Prompt chuyên sâu
        prompt = f"""
        Bạn là một chuyên gia Chiêm tinh học. Hãy đưa ra dự đoán NGẮN GỌN, SÚC TÍCH cho ngày {request.date}.
        
        {birth_context}
        
        LĨNH VỰC DỰ ĐOÁN: "{request.field}"
        
        YÊU CẦU NỘI DUNG (CHỈ VIẾT Ý CHÍNH):
        1. Phân tích nhanh 2-3 tác động chính từ các hành tinh đến bản đồ sao gốc.
        2. Điểm tin nhanh về cơ hội và thách thức trong lĩnh vực "{request.field}".
        3. Đưa ra 2-3 lời khuyên hành động ngắn gọn.
        4. Thông điệp vũ trụ (1 câu duy nhất).
        5. Chấm điểm năng lượng (0-100).

        YÊU CẦU ĐỊNH DẠNG: Chỉ trả về JSON duy nhất. 
        Trường "content" PHẢI trình bày bằng định dạng Markdown hoàn chỉnh (sử dụng các tiêu đề ###, danh sách * và in đậm **), không được trả về mảng hay đối tượng.
        {{
          "score": 85,
          "content": "### Tác động chính...\n* **Sao Thổ:** ...\n\n### Cơ hội & Thách thức...\n...",
          "cosmic_message": "..."
        }}
        """
        
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        
        # Extract JSON
        result_data = {
            "score": 75,
            "content": content,
            "cosmic_message": "Hãy tin vào bản thân."
        }

        # --- HỆ THỐNG BÓC TÁCH DỮ LIỆU ĐA LỚP ---
        try:
            # Lớp 1: Thử parse JSON chuẩn
            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if json_match:
                raw_json = json_match.group(0)
                try:
                    parsed = json.loads(raw_json)
                    if "score" in parsed: result_data["score"] = parsed["score"]
                    if "cosmic_message" in parsed: result_data["cosmic_message"] = parsed["cosmic_message"]
                    if "content" in parsed: result_data["content"] = parsed["content"]
                except:
                    # Lớp 2: Parse thủ công bằng Regex nếu JSON lỗi (thường do xuống dòng)
                    score_match = re.search(r'"score":\s*(\d+)', raw_json)
                    if score_match: result_data["score"] = int(score_match.group(1))
                    
                    msg_match = re.search(r'"cosmic_message":\s*"(.*?)"', raw_json, re.DOTALL)
                    if msg_match: result_data["cosmic_message"] = msg_match.group(1)
                    
                    content_match = re.search(r'"content":\s*"(.*?)"', raw_json, re.DOTALL)
                    if content_match: 
                        result_data["content"] = content_match.group(1)
                    else:
                        result_data["content"] = raw_json
        except:
            pass

        # Lớp 3: Làm sạch và định dạng nội dung
        def final_cleanup(text):
            # Nếu là list (AI trả về mảng các ý), gộp lại thành văn bản Markdown
            if isinstance(text, list):
                formatted_parts = []
                for item in text:
                    if isinstance(item, dict):
                        title = item.get('title') or item.get('heading') or ""
                        points = item.get('points') or item.get('items') or []
                        if title:
                            formatted_parts.append(f"### {title}")
                        if isinstance(points, list):
                            for p in points:
                                formatted_parts.append(f"* {p}")
                        elif points:
                            formatted_parts.append(f"* {points}")
                        
                        # Trường hợp dict không có title/points nhưng có nội dung khác
                        if not title and not points:
                            formatted_parts.append(str(item))
                    else:
                        formatted_parts.append(str(item))
                text = "\n\n".join(formatted_parts)
                
            text = str(text or "").strip()
            if not text: return ""
            
            # Xóa các key JSON phổ biến nếu còn sót do lỗi bóc tách
            text = re.sub(r'"score":\s*\d+,?', "", text)
            text = re.sub(r'"cosmic_message":\s*".*?",?', "", text, flags=re.DOTALL)
            text = re.sub(r'"content":\s*"', "", text)
            
            # Chỉ xóa ngoặc nhọn nếu nó bao quanh toàn bộ nội dung (dấu hiệu JSON chưa sạch)
            if text.startswith('{') and text.endswith('}'):
                text = text[1:-1].strip()
            
            # Làm sạch các dấu ngoặc kép dư thừa ở đầu/cuối
            text = text.strip().strip('"').strip("'")
            # Xử lý các ký tự xuống dòng bị escape
            text = text.replace("\\n", "\n")
            
            return text.strip()

        result_data["content"] = final_cleanup(result_data.get("content"))

        # 3. LƯU LỊCH SỬ DỮ LIỆU CẤU TRÚC
        conv_title = f"[Vận Trình Ngày] - Ngày {request.date}"
        new_conv_id = history_db.create_conversation(current_user["id"], title=conv_title)
        
        msg_user = f"Xem vận trình ngày {request.date} - Lĩnh vực: {request.field}"
        msg_bot = f"### ⚡ DỰ ĐOÁN VẬN TRÌNH NGÀY {request.date}\n\n**Chỉ số năng lượng: {result_data['score']}/100**\n\n{result_data['content']}\n\n> ✨ **Thông điệp:** {result_data['cosmic_message']}"
        
        # Deduct tokens
        tokens = token_counter.count_tokens(prompt + content)
        cost = token_counter.calculate_cost(tokens)

        chart_data = {
            "prediction": result_data,
            "date": request.date,
            "field": request.field,
            "birth_info": request.birth_info
        }

        history_db.save_chat_log(
            user_id=current_user["id"],
            conversation_id=new_conv_id,
            question=msg_user,
            answer=msg_bot,
            tokens_charged=cost,
            chart="prediction",
            chart_summary=chart_data
        )
        
        email = current_user.get("email")
        if not current_user.get("is_admin"):
            new_balance = token_counter.deduct_tokens(
                email=email,
                tokens=cost,
                description=f"Dự đoán ngày mới: {request.field}"
            )
        else:
            db_user = user_db.get_by_email(email)
            new_balance = db_user.get("token_balance", 0) if db_user else 0

        return {
            "prediction": result_data,
            "user_token_balance": new_balance,
            "tokens_charged": cost
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        user_db.close()
        history_db.close()
        token_counter.close()
