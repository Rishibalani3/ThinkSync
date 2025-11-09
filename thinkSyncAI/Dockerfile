
FROM python:3.11-slim

WORKDIR /flask

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Expose port
EXPOSE 5001

# Run Flask app
CMD ["python", "app.py"]
