# ThinkSync AI Recommendation Service

This Python service provides AI-powered recommendations for the ThinkSync platform using machine learning algorithms.

## Features

1. **Topic Recommendations**: Suggests topics based on user interests and activity patterns
2. **User Recommendations**: Recommends users to follow using collaborative filtering
3. **Trending Topics**: Calculates trending topics using ML scoring algorithms
4. **Trending Posts**: Identifies trending posts using engagement metrics and time decay

## Setup

### Prerequisites

- Python 3.8 or higher
- PostgreSQL database (same as main backend)
- pip package manager

### Installation

1. Navigate to the `thinkSyncAI` directory:
```bash
cd thinkSyncAI
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your DATABASE_URL
DATABASE_URL=postgresql://user:password@localhost:5432/thinksync
FLASK_PORT=5001
FLASK_DEBUG=True
```

5. Run the service:
```bash
python app.py
```

The service will start on `http://localhost:5001`

## API Endpoints

### Health Check
- **GET** `/health` - Check if the service is running

### Topic Recommendations
- **POST** `/api/recommend/topics`
  - Body: `{ "userId": "user-id", "limit": 10 }`
  - Returns: Recommended topics with scores

### User Recommendations
- **POST** `/api/recommend/users`
  - Body: `{ "userId": "user-id", "limit": 10 }`
  - Returns: Recommended users to follow

### Trending Topics
- **GET** `/api/trending/topics?limit=20&timeWindow=168`
  - Returns: Trending topics with ML scores

### Trending Posts
- **GET** `/api/trending/posts?limit=20&timeWindow=72`
  - Returns: Trending posts with ML scores

## How It Works

### Topic Recommendations
- Analyzes user's current topic interests
- Examines user activity (views, likes, bookmarks, comments)
- Uses content-based filtering with similarity scoring
- Recommends topics with high relevance scores

### User Recommendations
- Uses collaborative filtering (Jaccard similarity)
- Compares user topic interests
- Finds users with similar interests
- Scores based on common topics

### Trending Topics
- Considers engagement metrics (likes, comments, views)
- Calculates velocity (growth rate)
- Uses logarithmic scaling to prevent domination
- Combines engagement (60%) and velocity (40%)

### Trending Posts
- Analyzes engagement metrics
- Applies time decay (newer posts get higher scores)
- Calculates velocity (engagement per hour)
- Boosts posts with high discussion ratio

## Integration with Backend

The Node.js backend connects to this service via HTTP. Make sure to set the `AI_SERVICE_URL` environment variable in your backend `.env` file:

```
AI_SERVICE_URL=http://localhost:5001
```

## Development

### Running in Development Mode
Set `FLASK_DEBUG=True` in your `.env` file for automatic reloading on code changes.

### Testing
You can test the endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:5001/health

# Get trending topics
curl http://localhost:5001/api/trending/topics?limit=10

# Get topic recommendations (requires userId)
curl -X POST http://localhost:5001/api/recommend/topics \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id", "limit": 10}'
```

## Performance Notes

- The service queries the database directly for efficiency
- Recommendations are calculated on-demand (can be cached for better performance)
- Trending calculations can be expensive for large datasets; consider running as scheduled jobs

## Future Enhancements

- Add caching layer (Redis) for better performance
- Implement batch processing for trending calculations
- Add more sophisticated ML models (neural networks)
- Support for real-time recommendation updates
- A/B testing framework for recommendation algorithms

