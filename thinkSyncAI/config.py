import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
FLASK_PORT = int(os.getenv("FLASK_PORT", 5001))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"
FLASK_ENV = os.getenv("FLASK_ENV", "production").lower()

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables.")

def mask_url(url):
    if not url:
        return None
    parts = url.split("@")
    return f"***@{parts[1]}" if len(parts) == 2 else url

if FLASK_ENV == "development":
    print(f"Configuration Loaded: DATABASE_URL={mask_url(DATABASE_URL)}, FLASK_PORT={FLASK_PORT}, FLASK_DEBUG={FLASK_DEBUG}, FLASK_ENV={FLASK_ENV}")
