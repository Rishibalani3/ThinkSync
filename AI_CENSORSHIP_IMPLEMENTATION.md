# AI Content Moderation (Censorship) Implementation

## Overview

This document describes the AI-powered content moderation system implemented for ThinkSync. The system automatically analyzes and filters inappropriate content across posts and comments.

## Features

The AI moderation system detects and blocks:

- **Profanity**: Offensive language and curse words
- **Hate Speech**: Discriminatory or hateful content
- **Spam**: Commercial spam and scam patterns
- **Violent Content**: Threats and violent language
- **Excessive Caps**: Shouting/spam indicators
- **Repetitive Patterns**: Spam character patterns

## Architecture

### Components

1. **AI Service (Python Flask)** - `thinkSyncAI/`
   - Content analysis engine
   - Pattern matching algorithms
   - Confidence scoring
   
2. **Backend Service (Node.js)** - `thinkSyncBE/services/aiRecommendation.service.js`
   - API integration layer
   - Graceful error handling
   
3. **Controllers** - `thinkSyncBE/controllers/`
   - Post controller: Validates posts before creation
   - Comment controller: Validates comments before creation

## How It Works

### 1. Content Submission Flow

```
User submits content
    ↓
Controller receives request
    ↓
AI moderation analysis
    ↓
Decision based on confidence
    ├── High confidence (≥0.7) → BLOCK
    ├── Medium confidence (≥0.4) → ALLOW + LOG for review
    └── Low/None (<0.4) → ALLOW
    ↓
Content created (if allowed)
```

### 2. Moderation Analysis

The AI service analyzes content using:

- **Keyword matching**: Checks against predefined lists of inappropriate terms
- **Pattern detection**: Identifies spam patterns and suspicious behaviors
- **Scoring system**: Calculates confidence based on multiple factors
- **Severity classification**: none, low, medium, high

### 3. Response Actions

- **block**: Content is rejected (high confidence ≥0.7)
- **review**: Content is allowed but flagged for manual review (medium confidence ≥0.4)
- **allow**: Content is accepted (low confidence <0.4)

## API Endpoints

### Moderation Endpoint

**POST** `/api/moderation/analyze`

**Request:**
```json
{
  "content": "Text to analyze",
  "contentType": "post" // or "comment"
}
```

**Response:**
```json
{
  "success": true,
  "contentType": "post",
  "moderation": {
    "flagged": true,
    "confidence": 0.8,
    "categories": ["profanity", "hate_speech"],
    "reasons": [
      "Contains 1 profane word(s)",
      "Contains 1 hate speech pattern(s)"
    ],
    "severity": "high",
    "action": "block"
  }
}
```

## Integration in Controllers

### Post Controller

```javascript
// Before creating a post, content is analyzed
const moderationResult = await analyzeContentModeration(content, "post");

if (moderationResult && moderationResult.action === "block") {
  // Reject the post with detailed error
  return res.status(400).json(
    new ApiError(400, "Content flagged as inappropriate: " + reasons)
  );
}

if (moderationResult && moderationResult.action === "review") {
  // Log for manual review but allow post
  console.warn("Post flagged for review:", {...});
}

// Continue with post creation
```

### Comment Controller

Same logic as post controller, but for comments.

## Testing

### Unit Tests

Run the moderation test script:

```bash
cd /home/runner/work/ThinkSync/ThinkSync/thinkSyncAI
python3 /tmp/test_moderation.py
```

**Test Results:**
- ✓ Clean content - Allowed
- ✓ Profanity - Blocked
- ✓ Hate speech - Blocked  
- ✓ Spam - Blocked
- ✓ Violence - Blocked
- ✓ Mild content - Allowed
- ✓ Empty content - Allowed

### API Testing

Test the moderation endpoint:

```bash
# Test clean content
curl -X POST http://localhost:5001/api/moderation/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a nice post!", "contentType": "post"}'

# Test inappropriate content
curl -X POST http://localhost:5001/api/moderation/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "This is some shit I hate", "contentType": "post"}'
```

## Configuration

### Environment Variables

**AI Service (`thinkSyncAI/.env`):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/thinksync
FLASK_PORT=5001
FLASK_DEBUG=True
```

**Backend (`thinkSyncBE/.env`):**
```env
AI_SERVICE_URL=http://localhost:5001
```

## Error Handling

### Fail-Open Strategy

If the AI service is unavailable:
- The system allows content through (fail-open)
- Error is logged but doesn't block user experience
- Returns `null` from `analyzeContentModeration()`
- Controllers check for `null` and allow content

This ensures the application remains functional even when the AI service is down.

## Moderation Categories

### Profanity
Words considered offensive or vulgar.

**Examples:** damn, shit, fuck, bitch, etc.

**Severity Weight:** 0.3 per word

### Hate Speech
Discriminatory or hateful language targeting groups or individuals.

**Examples:** hate, scum, terrorist, racist, bigot, etc.

**Severity Weight:** 0.5 per phrase

### Violence
Threats or descriptions of violent actions.

**Examples:** kill, murder, attack, weapon, etc.

**Severity Weight:** 0.4 per word (requires 3+ words to flag)

### Spam
Commercial spam, scams, and promotional content.

**Examples:** click here, buy now, get rich, etc.

**Severity Weight:** 0.3 per pattern (requires 2+ patterns)

### Additional Checks

- **Excessive Caps**: >50% uppercase letters → 0.2 weight
- **Repetitive Characters**: 5+ repeated characters → 0.2 weight

## Confidence Scoring

The confidence score ranges from 0.0 to 1.0:

- Each detected issue adds to the severity score
- Score is normalized to 0-1 range
- Final confidence determines action:
  - **≥0.7**: High severity → Block
  - **≥0.4**: Medium severity → Review
  - **≥0.2**: Low severity → Flag
  - **<0.2**: None → Allow

## Severity Levels

- **high** (≥0.7): Content is blocked immediately
- **medium** (≥0.4): Content allowed but flagged for review
- **low** (≥0.2): Content allowed with minor flag
- **none** (<0.2): Content fully allowed

## Future Enhancements

Potential improvements for the moderation system:

1. **Machine Learning Models**
   - Implement neural networks for better detection
   - Use pre-trained models (e.g., Perspective API)
   - Train on platform-specific data

2. **Context Understanding**
   - Analyze context to reduce false positives
   - Understand sarcasm and quotes
   - Consider user history

3. **Multi-language Support**
   - Expand to support multiple languages
   - Use translation APIs for consistent moderation

4. **User Appeals**
   - Allow users to appeal moderation decisions
   - Admin dashboard for review queue
   - Track moderation accuracy

5. **Custom Rules**
   - Allow admins to define custom moderation rules
   - Adjustable confidence thresholds
   - Whitelist/blacklist management

6. **Performance Optimization**
   - Cache moderation results for similar content
   - Batch processing for bulk moderation
   - Async processing for better performance

## Monitoring and Analytics

### Logging

The system logs:
- All blocked content with reasons
- Content flagged for review
- AI service errors and failures

### Metrics to Track

- Moderation rate (% of content flagged)
- False positive rate (user appeals)
- Category distribution
- Response times
- AI service availability

## Security Considerations

1. **Data Privacy**: Content sent to AI service is analyzed but not permanently stored
2. **Fail-Open**: System allows content if AI service fails (prevents denial of service)
3. **Rate Limiting**: Prevent abuse of moderation endpoints
4. **Audit Trail**: All moderation decisions are logged for review

## Conclusion

The AI content moderation system provides automated, real-time protection against inappropriate content while maintaining a good user experience through smart confidence scoring and fail-open design.
