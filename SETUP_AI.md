# AI Recommendation System Setup Guide

This guide will help you set up the AI-powered recommendation system for ThinkSync.

## Overview

The AI recommendation system consists of:
1. **Python AI Service** (`thinkSyncAI/`) - Handles ML-based recommendations
2. **Node.js Integration** (`thinkSyncBE/services/`) - Connects backend to AI service
3. **API Endpoints** - New endpoints for AI recommendations

## Features Implemented

✅ **Topic Recommendations** - Personalized topic suggestions based on user interests and activity  
✅ **User Recommendations** - Suggests users to follow using collaborative filtering  
✅ **Trending Topics** - ML-powered trending topics calculation  
✅ **Trending Posts** - AI scoring for trending posts with time decay

## Step-by-Step Setup

### 1. Python AI Service Setup

```bash
# Navigate to AI service directory
cd thinkSyncAI

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Edit `thinkSyncAI/.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/thinksync
FLASK_PORT=5001
FLASK_DEBUG=True
```

**Important**: Use the same database connection string as your Node.js backend.

### 2. Start Python AI Service

```bash
python app.py
```

You should see:
```
Starting ThinkSync AI Recommendation Service on port 5001
```

### 3. Backend Configuration

Add to your `thinkSyncBE/.env`:
```
AI_SERVICE_URL=http://localhost:5001
```

### 4. Test the AI Service

```bash
# Health check
curl http://localhost:5001/health

# Should return: {"status": "ok", "service": "ThinkSync AI Recommendations"}
```

## API Endpoints

### New AI Recommendation Endpoints

#### Get Recommended Topics (for authenticated user)
```
GET /api/v1/ai/topics/recommended?limit=10
Authorization: Required
```

#### Get Recommended Users (to follow)
```
GET /api/v1/ai/users/recommended?limit=10
Authorization: Required
```

#### Get Trending Topics (AI-powered)
```
GET /api/v1/ai/topics/trending?limit=20&timeWindow=168
```

#### Get Trending Posts (AI-powered)
```
GET /api/v1/ai/posts/trending?limit=20&timeWindow=72
Authorization: Required
```

### Updated Existing Endpoints

The following endpoints now use AI recommendations when available:

- `GET /api/v1/topics/trending` - Now uses AI scoring
- `GET /api/v1/topics/trending-posts` - Now uses AI scoring

These endpoints have fallback logic, so they'll work even if the AI service is down.

## How It Works

### Topic Recommendations
1. Analyzes user's current topic interests
2. Examines user activity (views, likes, bookmarks, comments, follows)
3. Uses content-based filtering with activity weighting
4. Recommends topics with high relevance scores

**Activity Weights:**
- View: 0.5 points
- Like: 1.0 points
- Comment: 1.2 points
- Bookmark: 1.5 points
- Follow: 2.0 points

### User Recommendations
1. Uses collaborative filtering (Jaccard similarity)
2. Compares topic interests between users
3. Finds users with overlapping interests
4. Scores based on number of common topics

### Trending Topics
1. Analyzes engagement metrics (likes, comments, views)
2. Calculates velocity (post and user growth)
3. Uses logarithmic scaling for normalization
4. Combines: 60% engagement + 40% velocity

### Trending Posts
1. Analyzes engagement (likes, comments, bookmarks, views)
2. Applies exponential time decay (newer = higher score)
3. Calculates velocity (engagement per hour)
4. Boosts posts with high discussion (comment-to-like ratio)

## Troubleshooting

### Python Service Won't Start

**Error**: `ModuleNotFoundError`
- **Solution**: Make sure virtual environment is activated and dependencies are installed
```bash
pip install -r requirements.txt
```

**Error**: `Database connection error`
- **Solution**: Check your DATABASE_URL in `.env` file. It should match your backend database.

**Error**: `Port already in use`
- **Solution**: Change `FLASK_PORT` in `.env` or stop the process using port 5001

### Recommendations Not Working

**Backend returns empty recommendations**:
1. Check if Python service is running: `curl http://localhost:5001/health`
2. Check backend logs for AI service connection errors
3. Verify `AI_SERVICE_URL` is set in backend `.env`

**Fallback to simple queries**:
- This is normal if AI service is unavailable. The system gracefully falls back to basic queries.

### Database Connection Issues

**Error**: `psycopg2.OperationalError`
- **Solution**: 
  - Verify PostgreSQL is running
  - Check database credentials in `.env`
  - Ensure database exists: `thinksync`

## Data Flow

```
User Activity → UserActivity Table → Python AI Service → ML Processing → Recommendations → Node.js Backend → Frontend
```

The system tracks:
- Post views
- Likes
- Bookmarks
- Comments
- Follows
- Topic selections

All this data is used to train and improve recommendations over time.

## Performance Considerations

1. **Caching**: Consider adding Redis cache for recommendations (future enhancement)
2. **Batch Processing**: For large datasets, consider scheduled jobs for trending calculations
3. **Database Indexing**: Ensure indexes exist on `UserActivity(userId, createdAt)`

## Next Steps

1. ✅ Install Python dependencies
2. ✅ Start AI service
3. ✅ Test endpoints
4. ✅ Monitor recommendations quality
5. ⏳ (Future) Add caching layer
6. ⏳ (Future) Implement batch processing for trending
7. ⏳ (Future) Add more sophisticated ML models

## Support

If you encounter issues:
1. Check Python service logs
2. Check Node.js backend logs
3. Verify database connectivity
4. Ensure all environment variables are set correctly

