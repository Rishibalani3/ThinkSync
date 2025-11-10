FROM python:3.11-slim
WORKDIR /flask

COPY thinkSyncAI/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY thinkSyncAI .
EXPOSE 5001
CMD ["python", "app.py"]
