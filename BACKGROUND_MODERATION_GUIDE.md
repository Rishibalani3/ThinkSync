# Background AI Moderation Implementation

## Overview

This implementation provides **asynchronous background AI moderation** for posts and comments. Content is created immediately without blocking, and AI moderation runs 1 minute later to check for inappropriate content.

## Architecture

### Content Flow

```
User Creates Content
       ↓
Immediate Creation (status: "okay")
       ↓
Return to User (No Delay)
       ↓
[1 minute later]
       ↓
Background AI Analysis
       ↓
Flagged? → Yes → Update Status, Create Warning, Send Notifications
       ↓
High Severity? → Yes → Archive (status: "achieved")
```

## Database Schema

### Post & Comment Models

Both models now include a `status` field:

```prisma
model Post {
  id        String   @id @default(uuid())
  content   String
  type      String
  status    String   @default("okay") // "okay", "flagged", "achieved"
  // ... other fields
}

model Comment {
  id      String   @id @default(uuid())
  content String
  status  String   @default("okay") // "okay", "flagged", "achieved"
  // ... other fields
}
```

**Status Values:**
- `"okay"` - Default state, content is clean
- `"flagged"` - Content flagged by AI (medium severity, confidence ≥0.4)
- `"achieved"` - Content archived for logs (high severity, confidence ≥0.7)

### ModerationWarning Model

Tracks all moderation warnings:

```prisma
model ModerationWarning {
  id              String   @id @default(uuid())
  userId          String
  postId          String?
  commentId       String?
  contentType     String   // "post" or "comment"
  reason          String   // Why the content was flagged
  categories      String[] // Array of flagged categories
  confidence      Float    // AI confidence score (0.0-1.0)
  severity        String   // "low", "medium", "high"
  archivedContent String   // Copy of original content
  emailSent       Boolean  @default(false)
  notificationSent Boolean @default(false)
  createdAt       DateTime @default(now())
}
```

## Background Moderation Service

Location: `thinkSyncBE/services/backgroundModeration.service.js`

### Key Functions

#### `scheduleModerationCheck(contentId, contentType, delay)`

Schedules content for moderation after a specified delay.

**Parameters:**
- `contentId`: ID of the post or comment
- `contentType`: "post" or "comment"
- `delay`: Delay in milliseconds (default: 60000 = 1 minute)

**Example:**
```javascript
scheduleModerationCheck(post.id, "post", 60000);
```

#### Internal: `processModeration(contentId, contentType)`

Processes the actual moderation check:

1. Fetches content from database
2. Checks current status (skip if already moderated)
3. Calls AI moderation service
4. If flagged (confidence ≥0.4):
   - Updates status to "flagged"
   - Creates ModerationWarning record
   - Increments user warning count
   - Sends notification to user
   - Sends email to user (if enabled)
5. If high severity (confidence ≥0.7):
   - Updates status to "achieved" for archival

## Controller Integration

### Post Controller

```javascript
import { scheduleModerationCheck } from "../services/backgroundModeration.service.js";

const createPost = async (req, res) => {
  // ... create post with status: "okay"
  
  // Schedule AI moderation for 1 minute later
  scheduleModerationCheck(post.id, "post", 60000);
  
  // Return immediately to user
  return res.status(201).json(new ApiResponse(201, fullPost, "Post created"));
};
```

### Comment Controller

```javascript
import { scheduleModerationCheck } from "../services/backgroundModeration.service.js";

const createComment = async (req, res) => {
  // ... create comment with status: "okay"
  
  // Schedule AI moderation for 1 minute later
  scheduleModerationCheck(comment.id, "comment", 60000);
  
  // Return immediately to user
  return res.status(201).json(new ApiResponse(201, shaped, "Comment created"));
};
```

## User Notifications

### In-App Notification

Sent via Socket.IO when content is flagged:

```javascript
await sendNotification({
  receiverId: userId,
  content: `Your ${contentType} has been flagged for review: ${reasons}`,
  senderId: userId, // System notification
}, io, userSocketMap);
```

### Email Notification

Sent if user has email notifications enabled:

**Subject:** "Content Moderation Warning - ThinkSync"

**Content:**
- Username
- Content type (post/comment)
- Severity level
- Reason for flagging
- Categories detected
- Link to community guidelines

**Configuration:**
Requires environment variables:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@thinksync.com
```

## Warning System

### User Warning Count

Stored in `UserDetails.warningCount`:

```javascript
await prisma.userDetails.update({
  where: { userId },
  data: {
    warningCount: (userDetails.warningCount || 0) + 1,
  },
});
```

### Warning Records

All warnings are stored in `ModerationWarning` table with:
- Full content archive
- AI analysis details (confidence, categories, severity)
- Notification/email delivery status
- Timestamp

## AI Moderation Criteria

### Flagging Thresholds

- **Low Severity** (0.2 ≤ confidence < 0.4): Content allowed, no action
- **Medium Severity** (0.4 ≤ confidence < 0.7): Status → "flagged", warning created
- **High Severity** (confidence ≥ 0.7): Status → "achieved", content archived

### Categories Detected

1. **Profanity**: Offensive language
2. **Hate Speech**: Discriminatory content
3. **Violence**: Threats and violent language
4. **Spam**: Commercial spam and scams
5. **Excessive Caps**: Shouting indicators
6. **Repetitive Patterns**: Spam markers

## Migration & Setup

### 1. Run Database Migration

```bash
cd thinkSyncBE
npx prisma migrate dev --name add_moderation_status_and_warnings
npx prisma generate
```

### 2. Configure Email (Optional)

Add to `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@thinksync.com
```

### 3. Start Services

```bash
# Terminal 1: Start AI Service
cd thinkSyncAI
python3 app.py

# Terminal 2: Start Backend
cd thinkSyncBE
npm run dev
```

## Testing

### Create Test Content

```bash
# Create a post with inappropriate content
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is some shit content",
    "type": "idea"
  }'
```

### Check Status After 1 Minute

```javascript
// The post will be created immediately with status: "okay"
// After 1 minute, check the database:

const post = await prisma.post.findUnique({
  where: { id: postId },
  include: { moderationWarnings: true }
});

console.log(post.status); // Should be "flagged" or "achieved"
console.log(post.moderationWarnings); // Should have warning record
```

### Monitor Pending Jobs

```javascript
import { getPendingModerations } from "./services/backgroundModeration.service.js";

// Get list of pending moderation jobs
const pending = getPendingModerations();
console.log(pending); // Shows contentId, type, remaining time
```

## Monitoring & Logs

### Console Logs

The service outputs detailed logs:

```
Scheduled post abc123 for moderation in 60 seconds
Processing moderation for post abc123
Moderation result for post abc123: { flagged: true, confidence: 0.8, ... }
Post abc123 marked as achieved (high severity)
Notification sent to user xyz789 for post abc123
Email sent to user@example.com for post abc123
```

### Database Queries

**Get all flagged content:**
```javascript
const flagged = await prisma.post.findMany({
  where: { status: "flagged" },
  include: { author: true, moderationWarnings: true }
});
```

**Get user warning history:**
```javascript
const warnings = await prisma.moderationWarning.findMany({
  where: { userId: "user-id" },
  orderBy: { createdAt: "desc" }
});
```

**Get users with high warning counts:**
```javascript
const users = await prisma.userDetails.findMany({
  where: { warningCount: { gte: 3 } },
  include: { user: true }
});
```

## Advantages of Background Processing

1. **No User Delay**: Content creation is instant
2. **Better UX**: Users don't experience blocking
3. **Asynchronous**: Moderation runs independently
4. **Scalable**: Can handle high volume of content
5. **Transparent**: Users are notified after the fact
6. **Auditable**: All warnings logged with timestamps
7. **Configurable**: Delay can be adjusted per environment

## Limitations & Future Enhancements

### Current Limitations

1. In-memory queue (lost on server restart)
2. Single-server only (no distributed processing)
3. No retry mechanism for failed moderations
4. Fixed 1-minute delay

### Planned Enhancements

1. **Persistent Queue**: Use Redis or database-backed queue
2. **Job Scheduler**: Integrate with Bull, Agenda, or similar
3. **Distributed Processing**: Support multiple server instances
4. **Configurable Delays**: Per-user or per-content-type delays
5. **Retry Logic**: Automatic retry on AI service failures
6. **Admin Dashboard**: View flagged content and warnings
7. **Appeal System**: Allow users to appeal warnings
8. **Escalation**: Automatic account suspension after X warnings

## API Endpoints (Future)

Potential endpoints for admin/user management:

```
GET  /api/v1/moderation/warnings          - List all warnings (admin)
GET  /api/v1/moderation/warnings/:userId  - User's warning history
GET  /api/v1/moderation/flagged-content   - List flagged content (admin)
POST /api/v1/moderation/appeal/:warningId - Appeal a warning
DELETE /api/v1/moderation/warning/:id     - Dismiss warning (admin)
```

## Security Considerations

1. **Content Archive**: Flagged content stored for audit trail
2. **User Privacy**: Email only sent if user opted in
3. **Rate Limiting**: Prevent spam of moderation system
4. **Authorization**: Only admins can view all warnings
5. **Data Retention**: Consider GDPR compliance for stored content

## Troubleshooting

### Content Not Being Moderated

**Check:**
1. Is AI service running? `curl http://localhost:5001/health`
2. Are there errors in backend logs?
3. Is the delay too long for testing? Reduce to 10 seconds

### Notifications Not Sending

**Check:**
1. Socket.IO connection active
2. User's notification settings
3. Email configuration in .env
4. Console logs for errors

### Warning Count Not Incrementing

**Check:**
1. UserDetails record exists for user
2. Database transaction completed
3. Prisma schema migrated correctly

## Example Warning Email

```html
Content Moderation Warning

Hello johndoe,

Your post has been flagged by our AI moderation system for review.

Severity: high
Reason: Contains 2 profane word(s), Contains 1 hate speech pattern(s)
Categories: profanity, hate_speech

Please review our community guidelines to ensure your future 
content complies with our policies.

This is an automated message. Please do not reply to this email.
```

## Conclusion

This background moderation system provides a robust, scalable solution for content moderation that prioritizes user experience while maintaining platform safety. Content is created immediately, and moderation happens asynchronously with full transparency through notifications, emails, and warning records.
