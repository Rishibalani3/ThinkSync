# Use lightweight base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy only requirements first (for caching)
COPY thinkSyncAI/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of the app
COPY thinkSyncAI/ .

# Railway provides the PORT environment variable
EXPOSE 8080

# Run the app
CMD ["python", "app.py"]
