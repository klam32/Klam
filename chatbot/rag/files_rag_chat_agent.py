# # from chatbot.utils.llm import LLM  # noqa: I001
# from ingestion.retriever import Retriever
# from chatbot.utils.document_grader import DocumentGrader
# from chatbot.utils.answer_generator import AnswerGeneratorDocs, ArrayGeneratorDocs
# from chatbot.utils.no_answer_handler import NoAnswerHandler

# from langgraph.graph import END, StateGraph, START
# from chatbot.utils.graph_state import GraphState
# from typing import Dict, Any

# # from app.config import settings
# import os
# import ast
# import re


# class FilesChatAgent:
#     """
#     FilesChatAgent: Tác nhân chatbot sử dụng RAG (Retrieval-Augmented Generation).

#     Nhiệm vụ:
#         - Nhận câu hỏi người dùng.
#         - Truy xuất các tài liệu liên quan từ vector store.
#         - Chấm điểm và lọc ra tài liệu có liên quan.
#         - Sinh câu trả lời dựa trên câu hỏi + tài liệu đã lọc.
#         - Xử lý trường hợp không tìm thấy câu trả lời.

#     Quy trình:
#         START → retrieve → grade_documents → (generate | handle_no_answer) → END
#     """

#     def __init__(self, llm_model, path_vector_store, allowed_files=["*"]) -> None:
#         """
#         Khởi tạo FilesChatAgent.

#         Args:
#             llm_model: Mô hình ngôn ngữ (LLM) đã khởi tạo sẵn.
#             path_vector_store (str): Đường dẫn đến vector store chứa embeddings.
#             allowed_files (list[str], optional): Danh sách file cho phép. Mặc định ["*"].
#         """
#         self.allowed_files = allowed_files
#         self.path_vector_store = path_vector_store

#         # Các thành phần xử lý chính
#         self.llm = llm_model
#         self.document_grader = DocumentGrader(self.llm)  # Đánh giá mức liên quan của tài liệu
#         self.answer_generator = AnswerGeneratorDocs(self.llm)  # Sinh câu trả lời
#         self.array_generator = ArrayGeneratorDocs(self.llm)  # Sinh dữ liệu mảng (nếu cần)
#         self.no_answer_handler = NoAnswerHandler(self.llm)  # Xử lý khi không có câu trả lời

#     def handle_no_answer(self, state: GraphState) -> Dict[str, Any]:
#         """
#         Xử lý khi không có tài liệu liên quan.

#         Args:
#             state (GraphState): Trạng thái hiện tại của workflow.

#         Returns:
#             Dict[str, Any]: Kết quả báo không tìm thấy câu trả lời.
#         """
#         return {"generation": "_null_"}

#     def generate(self, state: GraphState) -> Dict[str, Any]:
#         """
#         Sinh câu trả lời từ câu hỏi + các tài liệu đã lọc.

#         Args:
#             state (GraphState): Trạng thái chứa question, documents, prompt.

#         Returns:
#             Dict[str, Any]: Trả về câu trả lời (generation).
#         """
#         question = state["question"]
#         documents = state["documents"]
#         prompt = state["prompt"]

#         # Ghép nội dung các tài liệu thành context
#         context = "\n\n".join(doc.page_content for doc in documents)

#         # Sinh câu trả lời từ AnswerGenerator
#         generation = self.answer_generator.get_chain().invoke({"question": question, "context": context, "prompt": prompt})

#         # Xóa tag <think> nếu có
#         generation = re.sub(r"<think>.*?</think>", "", generation, flags=re.DOTALL).strip()

#         return {"generation": generation}

#     def retrieve(self, state: GraphState) -> Dict[str, Any]:
#         """
#         Truy xuất tài liệu từ vector store dựa trên câu hỏi.

#         Args:
#             state (GraphState): Trạng thái chứa câu hỏi.

#         Returns:
#             Dict[str, Any]: Bao gồm "documents" và "question".
#         """
#         question = state["question"]

#         # Khởi tạo retriever với embedding model
#         retriever = Retriever(embedding_model_name=os.environ["EMBEDDING_MODEL_NAME"]).set_retriever(
#             path_vector_store=self.path_vector_store
#         )

#         # Lấy danh sách documents liên quan
#         documents = retriever.get_documents(
#             query=question,
#             num_doc=int(os.environ["NUMDOCS"]),
#         )

#         return {"documents": documents, "question": question}

#     def decide_to_generate(self, state: GraphState) -> str:
#         """
#         Quyết định bước tiếp theo sau khi chấm điểm tài liệu:
#             - Nếu không có tài liệu → handle_no_answer
#             - Nếu có tài liệu → generate

#         Args:
#             state (GraphState): Trạng thái chứa danh sách documents.

#         Returns:
#             str: "no_document" hoặc "generate".
#         """
#         filtered_documents = state["documents"]

#         if not filtered_documents:
#             print("---QUYẾT ĐỊNH: KHÔNG CÓ VĂN BẢN LIÊN QUAN ĐẾN CÂU HỎI, BIẾN ĐỔI TRUY VẤN---")
#             return "no_document"
#         else:
#             print("---QUYẾT ĐỊNH: TẠO CÂU TRẢ LỜI---")
#             return "generate"

#     def grade_documents(self, state: GraphState) -> Dict[str, Any]:
#         """
#         Chấm điểm tài liệu để lọc ra tài liệu liên quan đến câu hỏi.

#         Args:
#             state (GraphState): Trạng thái chứa question + documents.

#         Returns:
#             Dict[str, Any]: Danh sách documents đã được lọc.
#         """
#         question = state["question"]
#         documents = state["documents"]

#         filtered_docs = []
#         for d in documents:
#             # Chấm điểm mức liên quan giữa question và document
#             response = self.document_grader.get_chain().invoke({"question": question, "document": d.page_content})

#             # Xóa tag <think>
#             response = re.sub(r"<think>.*?</think>", "", response.content, flags=re.DOTALL).strip()

#             print("response", response)

#             # Nếu câu trả lời chứa "yes" → coi như tài liệu liên quan
#             if "yes" in response.lower():
#                 print("---CHẤM ĐIỂM: TÀI LIỆU LIÊN QUAN---")
#                 filtered_docs.append(d)
#             else:
#                 print("---CHẤM ĐIỂM: TÀI LIỆU KHÔNG LIÊN QUAN---")

#         return {"documents": filtered_docs, "question": question}

#     def get_workflow(self):
#         """
#         Xây dựng workflow xử lý với StateGraph.

#         Luồng xử lý:
#             START → retrieve → grade_documents
#                 → (no_document → handle_no_answer | generate → END)

#         Returns:
#             StateGraph: Workflow đã được định nghĩa.
#         """
#         workflow = StateGraph(GraphState)

#         # Định nghĩa các node
#         workflow.add_node("retrieve", self.retrieve)
#         workflow.add_node("grade_documents", self.grade_documents)
#         workflow.add_node("generate", self.generate)
#         workflow.add_node("handle_no_answer", self.handle_no_answer)

#         # Xây dựng luồng
#         workflow.add_edge(START, "retrieve")
#         workflow.add_edge("retrieve", "grade_documents")

#         # Nhánh điều kiện sau khi chấm điểm tài liệu
#         workflow.add_conditional_edges(
#             "grade_documents",
#             self.decide_to_generate,
#             {
#                 "no_document": "handle_no_answer",
#                 "generate": "generate",
#             },
#         )

#         workflow.add_edge("generate", END)

#         return workflow
