# from langchain_openai import ChatOpenAI  # noqa: I001
# from langchain_google_genai import ChatGoogleGenerativeAI
# import os  # noqa: E401, F401


# class LLM:
#     """
#     Lớp tiện ích để khởi tạo các mô hình LLM khác nhau (OpenAI, Gemini, Local/Ollama).

#     Thuộc tính:
#         temperature (float): Nhiệt độ sinh văn bản (mức độ sáng tạo).
#         max_tokens (int): Giới hạn số token tối đa cho đầu ra.
#         n_ctx (int): Kích thước context (bộ nhớ ngữ cảnh).
#         model (str): Tên mô hình được sử dụng (có thể gán thêm nếu cần).
#     """

#     def __init__(self, temperature: float = 0.01, max_tokens: int = 4096, n_ctx: int = 4096) -> None:
#         self.temperature = temperature
#         self.n_ctx = n_ctx
#         self.max_tokens = max_tokens
#         self.model = ""

#     def open_ai(self):
#         """
#         Khởi tạo LLM từ OpenAI (qua API key).

#         Yêu cầu biến môi trường:
#             - KEY_API_OPENAI
#             - OPENAI_LLM_MODEL_NAME

#         Returns:
#             ChatOpenAI: đối tượng LLM của OpenAI.
#         """
#         llm = ChatOpenAI(
#             openai_api_key=os.environ["KEY_API_OPENAI"],
#             model=os.environ["OPENAI_LLM_MODEL_NAME"],
#             temperature=self.temperature,
#         )
#         return llm

#     def local_ai(self):
#         """
#         Khởi tạo LLM từ Ollama/local endpoint.

#         Yêu cầu biến môi trường:
#             - URL_OLLAMA
#             - MODEL_CHAT_OLLAMA
#             - API_KEY_OLLAMA

#         Returns:
#             ChatOpenAI: đối tượng LLM giả lập từ local server (Ollama).
#         """
#         llm = ChatOpenAI(
#             base_url=os.environ["URL_OLLAMA"],
#             model=os.environ["MODEL_CHAT_OLLAMA"],
#             api_key=os.environ["API_KEY_OLLAMA"],
#             temperature=self.temperature,
#         )
#         return llm

#     def gemini(self):
#         """
#         Khởi tạo LLM từ Google Gemini API.

#         Yêu cầu biến môi trường:
#             - KEY_API_GOOGLE
#             - GOOGLE_LLM_MODEL_NAME

#         Returns:
#             ChatGoogleGenerativeAI: đối tượng LLM Gemini.
#         """
#         llm = ChatGoogleGenerativeAI(
#             google_api_key=os.environ["KEY_API_GOOGLE"],
#             model=os.environ["GOOGLE_LLM_MODEL_NAME"],
#             temperature=self.temperature,
#         )
#         return llm

#     def get_llm(self, llm_name: str):
#         """
#         Lấy mô hình LLM dựa trên tên.

#         Args:
#             llm_name (str): Tên mô hình mong muốn.
#                             Các lựa chọn: "openai", "gemini", "local".

#         Returns:
#             Any: Đối tượng LLM tương ứng (OpenAI/Gemini/Local).
#         """
#         if llm_name == "openai":
#             return self.open_ai()
#         if llm_name == "gemini":
#             return self.gemini()
#         if llm_name == "local":
#             return self.local_ai()
# ---------------------------Test GEMINI----------------------------------------------------
# from langchain_google_genai import ChatGoogleGenerativeAI
# import os


# class LLM:
#     """
#     Lớp tiện ích khởi tạo LLM.
#     Hiện tại chỉ sử dụng Gemini.
#     """

#     def __init__(self, temperature: float = 0.2, max_tokens: int = 4096) -> None:
#         self.temperature = temperature
#         self.max_tokens = max_tokens

#     def gemini(self):
#         """
#         Khởi tạo Gemini LLM.

#         Yêu cầu biến môi trường:
#         GEMINI_API_KEY
#         """

#         api_key = os.getenv("GEMINI_API_KEY")

#         if not api_key:
#             raise Exception("Thiếu GEMINI_API_KEY trong file .env")

#         llm = ChatGoogleGenerativeAI(
#             google_api_key=api_key,
#             model="gemini-2.5-flash",
#             temperature=self.temperature,
#         )

#         return llm

#     def get_llm(self, llm_name: str = "gemini"):
#         """
#         Trả về LLM theo tên.
#         Hiện tại chỉ hỗ trợ Gemini.
#         """

#         return self.gemini()
# ------------------DÙNG VERTEX AI-------------------
from langchain_google_vertexai import ChatVertexAI
import vertexai
import os


class LLM:

    def __init__(self, temperature: float = 0.2, max_tokens = 8192):
        self.temperature = temperature
        self.max_tokens = max_tokens

    def vertex(self):

        project_id = os.getenv("PROJECT_ID")
        location = os.getenv("LOCATION")
        model_name = os.getenv("VERTEX_MODEL_NAME", "gemini-2.5-flash")

        if not project_id:
            raise Exception("Thiếu PROJECT_ID")

        vertexai.init(
            project=project_id,
            location=location
        )

        llm = ChatVertexAI(
            model=model_name,
            temperature=self.temperature,
            max_output_tokens=self.max_tokens,
        )

        return llm

    def get_llm(self, llm_name="vertex"):

        if llm_name == "vertex":
            return self.vertex()

        raise Exception("LLM không hỗ trợ")