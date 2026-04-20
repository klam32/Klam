import os
import subprocess

# Ép kiểu encoding UTF-8 cho console Windows
os.environ["PYTHONIOENCODING"] = "utf-8"

# Chạy ứng dụng FastAPI
if __name__ == "__main__":
    subprocess.run(["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "2643", "--reload"])

