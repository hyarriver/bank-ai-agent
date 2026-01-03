FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖（最小化）
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 复制 requirements.txt 并安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip cache purge

# 复制应用代码
COPY . .

# 清理不必要的文件
RUN find . -type f -name "*.pyc" -delete && \
    find . -type d -name "__pycache__" -delete

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import http.client; conn = http.client.HTTPConnection('localhost', 8080); conn.request('GET', '/'); r = conn.getresponse(); exit(0 if r.status == 200 else 1)" || exit 1

# 启动应用
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

