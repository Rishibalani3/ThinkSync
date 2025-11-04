# AI Content Moderation - Quick Start Guide

## What is it?
AI-powered content moderation that automatically detects and blocks inappropriate content (profanity, hate speech, spam, violence) in posts and comments.

## Quick Test

### 1. Start the AI Service
```bash
cd thinkSyncAI
python3 app.py
```

### 2. Test the Moderation
```bash
# Test with clean content
curl -X POST http://localhost:5001/api/moderation/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a nice post!", "contentType": "post"}'

# Test with inappropriate content
curl -X POST http://localhost:5001/api/moderation/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "This is terrible shit I hate", "contentType": "post"}'
```

## How it Works

### Content is analyzed and scored:
- **Low severity** (0.2-0.4): Allowed but flagged
- **Medium severity** (0.4-0.7): Allowed but logged for review
- **High severity** (≥0.7): **BLOCKED**

### Categories Detected:
- 🚫 Profanity
- 🚫 Hate Speech
- 🚫 Spam
- 🚫 Violence
- 🚫 Excessive Caps
- 🚫 Repetitive Patterns

## Integration

The moderation is automatically integrated into:
- **Post Creation** (`POST /api/v1/posts`)
- **Comment Creation** (`POST /api/v1/comments`)

Content is analyzed in real-time before creation. Inappropriate content is rejected with a clear error message.

## Example Response

```json
{
  "success": true,
  "moderation": {
    "flagged": true,
    "confidence": 0.8,
    "categories": ["profanity", "hate_speech"],
    "severity": "high",
    "action": "block",
    "reasons": [
      "Contains 1 profane word(s)",
      "Contains 1 hate speech pattern(s)"
    ]
  }
}
```

## Documentation

For detailed information:
- 📖 [Full Implementation Guide](AI_CENSORSHIP_IMPLEMENTATION.md)
- 📊 [Test Results & Metrics](AI_CENSORSHIP_TEST_SUMMARY.md)
- 🔧 [AI System Overview](AI_IMPLEMENTATION_SUMMARY.md)

## Status

✅ Production Ready
✅ All Tests Passing
✅ Zero Security Vulnerabilities
✅ Comprehensive Documentation
