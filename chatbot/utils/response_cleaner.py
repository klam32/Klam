def clean_text(value):
    if not value:
        return ""

    # Nếu là dict, ưu tiên lấy các trường nội dung
    if isinstance(value, dict):
        value = (
            value.get("chart")
            or value.get("interpretation")
            or value.get("answer")
            or str(value)
        )

    # Nếu là list xịn, gộp lại
    if isinstance(value, list):
        return "\n".join(map(str, value))

    # Nếu là string nhưng trông giống list: "['a', 'b']"
    if isinstance(value, str) and value.strip().startswith("[") and value.strip().endswith("]"):
        try:
            import ast
            # Chuyển chuỗi "['...']" thành list thực thụ
            parsed_list = ast.literal_eval(value.strip())
            if isinstance(parsed_list, list):
                return "\n".join(map(str, parsed_list))
        except:
            pass

    return str(value).strip()