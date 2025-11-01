from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
from database import (
    fetch_user_topics,
    fetch_user_activity,
    fetch_all_topics,
    fetch_all_users,
    fetch_posts_with_metrics,
    fetch_all_topics_with_metrics,
    fetch_user_following
)
from recommendation_engine import RecommendationEngine
from config import FLASK_PORT, FLASK_DEBUG

app = Flask(__name__)
CORS(app)

recommendation_engine = RecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'ThinkSync AI Recommendations'})

@app.route('/api/recommend/topics', methods=['POST'])
def recommend_topics():
    """Recommend topics for a user based on their interests and activity"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        # Fetch user data
        user_topics = fetch_user_topics(user_id)
        user_activity = fetch_user_activity(user_id, limit=200)
        all_topics = fetch_all_topics()
        
        # Get recommendations
        recommendations = recommendation_engine.recommend_topics(
            user_id=user_id,
            user_topics=user_topics,
            user_activity=user_activity,
            all_topics=all_topics,
            limit=int(data.get('limit', 10))
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    
    except Exception as e:
        print(f"Error in recommend_topics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommend/users', methods=['POST'])
def recommend_users():
    """Recommend users to follow based on similar interests"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        # Fetch user data
        user_topics = fetch_user_topics(user_id)
        user_following = fetch_user_following(user_id)
        all_users = fetch_all_users()
        
        # Get recommendations
        recommendations = recommendation_engine.recommend_users(
            user_id=user_id,
            user_topics=user_topics,
            all_users=all_users,
            user_following=user_following,
            limit=int(data.get('limit', 10))
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    
    except Exception as e:
        print(f"Error in recommend_users: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/trending/topics', methods=['GET'])
def get_trending_topics():
    """Get trending topics using ML scoring - only topics with posts, top 5"""
    try:
        limit = int(request.args.get('limit', 5))  # Default to 5
        time_window = int(request.args.get('timeWindow', 168))  # Default 7 days
        
        # Fetch topics with metrics (already filtered to only topics with posts)
        topics_with_metrics = fetch_all_topics_with_metrics()
        
        # Calculate trending scores (already limited to top 5)
        trending = recommendation_engine.calculate_trending_topics(
            topics_with_metrics=topics_with_metrics,
            time_window_hours=time_window
        )
        
        # Ensure we return at most the requested limit
        return jsonify({
            'success': True,
            'trending_topics': trending[:limit]
        })
    
    except Exception as e:
        print(f"Error in get_trending_topics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/trending/posts', methods=['GET'])
def get_trending_posts():
    """Get trending posts using ML scoring - top 3 with real engagement"""
    try:
        limit = int(request.args.get('limit', 3))  # Default to 3
        time_window = int(request.args.get('timeWindow', 72))  # Default 3 days
        
        # Fetch posts with metrics
        posts_with_metrics = fetch_posts_with_metrics()
        
        # Calculate trending scores (already limited to top 3)
        trending = recommendation_engine.calculate_trending_posts(
            posts_with_metrics=posts_with_metrics,
            time_window_hours=time_window,
            min_engagement=1  # Minimum engagement required
        )
        
        # If we don't have enough trending posts, add fallback: recent active posts
        if len(trending) < limit and posts_with_metrics:
            from datetime import timedelta
            recent_threshold = datetime.now() - timedelta(hours=24)
            
            # Get recent posts with some engagement
            fallback_posts = []
            for post in posts_with_metrics:
                created_at = post.get('createdAt')
                if not created_at:
                    continue
                
                if isinstance(created_at, str):
                    try:
                        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    except:
                        continue
                
                if created_at.replace(tzinfo=None) < recent_threshold:
                    continue
                
                likes = post.get('likes_count', 0) or 0
                comments = post.get('comments_count', 0) or 0
                
                # Include posts with at least some engagement
                if likes > 0 or comments > 0:
                    score = (likes * 1.0) + (comments * 1.5)
                    fallback_posts.append({
                        'post_id': post['id'],
                        'score': score,
                        'metrics': {
                            'likes': likes,
                            'comments': comments,
                            'bookmarks': 0,
                            'views': 0,
                            'engagement': score
                        }
                    })
            
            # Sort fallback by score and add to trending (avoid duplicates)
            existing_ids = {t['post_id'] for t in trending}
            fallback_posts = [p for p in fallback_posts if p['post_id'] not in existing_ids]
            fallback_posts.sort(key=lambda x: x['score'], reverse=True)
            
            trending.extend(fallback_posts[:limit - len(trending)])
        
        # Ensure we return at most the requested limit
        return jsonify({
            'success': True,
            'trending_posts': trending[:limit]
        })
    
    except Exception as e:
        print(f"Error in get_trending_posts: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Starting ThinkSync AI Recommendation Service on port {FLASK_PORT}")
    app.run(host='0.0.0.0', port=FLASK_PORT, debug=FLASK_DEBUG)

