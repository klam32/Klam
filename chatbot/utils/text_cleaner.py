# import re

# def normalize_markdown(text: str) -> str:
#     if not text:
#         return ""

#     # ❌ REMOVE markdown
#     text = re.sub(r"#+\s*", "", text)      # remove ##
#     text = re.sub(r"-\s*", "", text)       # remove bullet
#     text = text.replace("•", "")

#     # ✅ tách đoạn rõ ràng
#     text = re.sub(
#         r"(?<=[.!?])\s+(?=[A-ZÀ-Ỹ])",
#         "\n\n",
#         text
#     )

#     # ✅ detect title kiểu "1 TÍNH CÁCH"
#     lines = text.split("\n")
#     formatted = []

#     for line in lines:
#         line = line.strip()

#         if not line:
#             formatted.append("")
#             continue

#         # TITLE
#         if re.match(r"^\d+\s+[A-ZÀ-Ỹ\s]+$", line):
#             formatted.append(f"\n{line}\n")
#         else:
#             formatted.append(f"    {line}")

#     text = "\n".join(formatted)

#     # spacing đẹp
#     text = re.sub(r"\n{3,}", "\n\n", text)

#     return text.strip()
import re

def normalize_markdown(text: str) -> str:
    if not text:
        return ""

    # ✅ Chỉnh sửa spacing: Đảm bảo giữa các đoạn có đúng 1 dòng trống
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    # ✅ Đảm bảo tiêu đề (#) có khoảng trống sau dấu #
    text = re.sub(r"^(#+)([^#\s])", r"\1 \2", text, flags=re.MULTILINE)
    
    # ✅ Đảm bảo bullet point (- hoặc *) có khoảng trống sau
    text = re.sub(r"^([\-\*])([^ \-\*])", r"\1 \2", text, flags=re.MULTILINE)

    return text.strip()