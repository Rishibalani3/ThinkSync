# Background Moderation Implementation - Summary

## What Changed

This update transforms the AI moderation from **synchronous blocking** to **asynchronous background processing**.

## Before (Blocking Approach)

```javascript
User creates post
    ↓
AI checks content (BLOCKS for 100ms+)
    ↓
If inappropriate → REJECTED (400 error)
    ↓
If clean → Created
    ↓
Returned to user
```

**Problems:**
- User experiences delay
- Content could be rejected
- Poor UX

## After (Background Approach)

```javascript
User creates post
    ↓
Created immediately (status: "okay")
    ↓
Returned to user (INSTANT)
    ↓
[1 minute later]
    ↓
AI checks content in background
    ↓
If flagged → Warning sent, status updated
```

**Benefits:**
- No user delay
- Content always created
- Better UX
- Transparent moderation

## Files Changed

### 1. Database Schema (`prisma/schema.prisma`)

**Added to Post model:**
```prisma
status String @default("okay") // "okay", "flagged", "achieved"
moderationWarnings ModerationWarning[]
```

**Added to Comment model:**
```prisma
status String @default("okay") // "okay", "flagged", "achieved"
moderationWarnings ModerationWarning[]
```

**New ModerationWarning model:**
```prisma
model ModerationWarning {
  id              String   @id @default(uuid())
  userId          String
  postId          String?
  commentId       String?
  contentType     String
  reason          String
  categories      String[]
  confidence      Float
  severity        String
  archivedContent String
  emailSent       Boolean  @default(false)
  notificationSent Boolean @default(false)
  createdAt       DateTime @default(now())
}
```

### 2. Background Service (NEW)

**File:** `services/backgroundModeration.service.js`

**Key Functions:**
- `scheduleModerationCheck()` - Schedules content for moderation
- `processModeration()` - Runs AI analysis and takes action
- `sendModerationEmail()` - Sends email warnings

**Features:**
- In-memory job queue
- 1-minute delay (configurable)
- Creates warning records
- Sends notifications
- Sends emails
- Updates content status
- Archives high-severity content

### 3. Post Controller

**Changes:**
- Removed blocking AI check
- Added `status: "okay"` on creation
- Added `scheduleModerationCheck(post.id, "post", 60000)`
- Content created immediately

### 4. Comment Controller

**Changes:**
- Removed blocking AI check
- Added `status: "okay"` on creation
- Added `scheduleModerationCheck(comment.id, "comment", 60000)`
- Content created immediately

## How It Works

### 1. Content Creation

```javascript
// User creates post
POST /api/v1/posts
{
  "content": "Some content here",
  "type": "idea"
}

// Response (immediate)
{
  "status": 201,
  "data": {
    "id": "abc123",
    "content": "Some content here",
    "status": "okay",  // Default status
    ...
  }
}
```

### 2. Background Moderation (60 seconds later)

```javascript
// AI analyzes content
const result = await analyzeContentModeration(content, "post");

// If flagged (confidence >= 0.4)
if (result.flagged && result.confidence >= 0.4) {
  // 1. Update status
  await prisma.post.update({
    where: { id: "abc123" },
    data: { status: "flagged" }
  });
  
  // 2. Create warning
  await prisma.moderationWarning.create({
    data: {
      userId: authorId,
      postId: "abc123",
      contentType: "post",
      reason: "Contains profanity",
      categories: ["profanity"],
      confidence: 0.8,
      severity: "high",
      archivedContent: content
    }
  });
  
  // 3. Send notification
  await sendNotification({
    receiverId: authorId,
    content: "Your post has been flagged..."
  });
  
  // 4. Send email
  await sendModerationEmail(userEmail, {...});
  
  // 5. Increment warning count
  await prisma.userDetails.update({
    where: { userId: authorId },
    data: { warningCount: { increment: 1 } }
  });
}
```

### 3. High Severity Archival

```javascript
// If high confidence (>= 0.7)
if (result.confidence >= 0.7) {
  // Mark as achieved (archived)
  await prisma.post.update({
    where: { id: "abc123" },
    data: { status: "achieved" }
  });
}
```

## Status Values

| Status | Meaning | Visibility | Action Taken |
|--------|---------|------------|--------------|
| `okay` | Clean content | Visible | None |
| `flagged` | Moderate violation | Visible | Warning sent, logged |
| `achieved` | Severe violation | Visible | Warning sent, archived |

## Notification Example

**In-App:**
```
Your post has been flagged for review: Contains 1 profane word(s), 
Contains 1 hate speech pattern(s)
```

**Email:**
```
Subject: Content Moderation Warning - ThinkSync

Hello johndoe,

Your post has been flagged by our AI moderation system for review.

Severity: high
Reason: Contains 1 profane word(s), Contains 1 hate speech pattern(s)
Categories: profanity, hate_speech

Please review our community guidelines to ensure your future content 
complies with our policies.
```

## Migration Steps

### 1. Update Database

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
# Terminal 1: AI Service
cd thinkSyncAI
python3 app.py

# Terminal 2: Backend
cd thinkSyncBE
npm run dev
```

## Testing

### Test Clean Content

```bash
# Create post
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer TOKEN" \
  -d '{"content": "This is a nice post", "type": "idea"}'

# Wait 61 seconds
# Check status (should still be "okay")
```

### Test Inappropriate Content

```bash
# Create post with profanity
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer TOKEN" \
  -d '{"content": "This is some shit", "type": "idea"}'

# Wait 61 seconds
# Check status (should be "flagged" or "achieved")
# Check ModerationWarning table
# Check user notifications
```

## Monitoring

### Check Pending Jobs

```javascript
import { getPendingModerations } from "./services/backgroundModeration.service.js";

const pending = getPendingModerations();
console.log(pending);
// Output: [{ contentId: "abc123", contentType: "post", remainingTime: 45000 }]
```

### Query Flagged Content

```sql
-- Get all flagged posts
SELECT * FROM "Post" WHERE status = 'flagged';

-- Get all warnings
SELECT * FROM "ModerationWarning" ORDER BY "createdAt" DESC;

-- Get users with multiple warnings
SELECT u.username, ud."warningCount"
FROM "User" u
JOIN "UserDetails" ud ON u.id = ud."userId"
WHERE ud."warningCount" > 0
ORDER BY ud."warningCount" DESC;
```

## Advantages

✅ **Better UX**: No delay for users
✅ **Transparent**: Users notified after the fact
✅ **Auditable**: All violations logged
✅ **Scalable**: Background processing
✅ **Flexible**: Configurable delays
✅ **Complete**: Email + notification + warning count

## Limitations

⚠️ **In-memory queue**: Lost on server restart
⚠️ **Single server**: No distributed processing
⚠️ **Fixed delay**: 1 minute for all content
⚠️ **No retry**: Failed moderations not retried

## Future Enhancements

- [ ] Redis-backed job queue
- [ ] Distributed processing (Bull/Agenda)
- [ ] Configurable delays per user/content
- [ ] Retry mechanism
- [ ] Admin dashboard
- [ ] Appeal system
- [ ] Automatic suspension after X warnings

## Documentation

- 📖 `BACKGROUND_MODERATION_GUIDE.md` - Full implementation guide
- 📊 `AI_IMPLEMENTATION_SUMMARY.md` - Updated with new workflow
- 🧪 `AI_CENSORSHIP_TEST_SUMMARY.md` - Original test results (now outdated)

## Commits

- `ef9908a` - Implement background AI moderation with status field and warning system
- `cf31873` - Add comprehensive documentation for background moderation system

---

**Implementation complete! All requirements from user feedback addressed.** ✅
