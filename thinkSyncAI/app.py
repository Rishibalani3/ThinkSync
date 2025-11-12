from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from recommendation_engine import RecommendationEngine
from config import FLASK_PORT, FLASK_DEBUG
from database import (
    fetch_user_topics,
    fetch_user_activity,
    fetch_all_topics,
    fetch_all_users,
    fetch_posts_with_metrics,
    fetch_all_topics_with_metrics,
    fetch_user_following,
    fetch_posts_by_topics,
)

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS"]
)
recommendation_engine = RecommendationEngine()


@app.before_request
def log_incoming_request():
    print(f"Incoming {request.method} {request.path} from {request.remote_addr}")

# ---------------------------
# Health Check
# ---------------------------
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'ThinkSync AI Recommendations'})

# ---------------------------
# Recommend Topics
# ---------------------------
@app.route('/api/recommend/topics', methods=['POST'])
def recommend_topics():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        limit = int(data.get('limit', 10))

        if not user_id:
            return jsonify({'error': 'userId is required'}), 400

        try:
            user_topics = fetch_user_topics(user_id) or []
        except Exception as e:
            print(f"Error fetching topics for user {user_id}: {e}")
            user_topics = []

        try:
            user_activity = fetch_user_activity(user_id, limit=200) or []
        except Exception as e:
            print(f"Error fetching activity for user {user_id}: {e}")
            user_activity = []

        try:
            all_topics = fetch_all_topics() or []
        except Exception as e:
            print(f"Error fetching all topics: {e}")
            all_topics = []

        recommendations = recommendation_engine.recommend_topics(
            user_id=user_id,
            user_topics=user_topics,
            user_activity=user_activity,
            all_topics=all_topics,
            limit=limit
        )

        return jsonify({'success': True, 'recommendations': recommendations})

    except Exception as e:
        print(f"Error in recommend_topics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/ai/recommend/users', methods=['POST'])
def recommend_users():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400

        try:
            user_topics = fetch_user_topics(user_id) or []
        except:
            user_topics = []

        try:
            user_following = fetch_user_following(user_id) or []
        except:
            user_following = []

        try:
            all_users = fetch_all_users() or []
        except:
            all_users = []

        recommendations = recommendation_engine.recommend_users(
            user_id=user_id,
            user_topics=user_topics,
            all_users=all_users,
            user_following=user_following,
            limit=int(data.get('limit', 10))
        )
        print(f"User recommendations for {user_id}: {recommendations}")
        return jsonify({'success': True, 'recommendations': recommendations})

    except Exception as e:
        print(f"Error in recommend_users: {e}")
        return jsonify({'error': str(e)}), 500

# ---------------------------
# Trending Topics
# ---------------------------
@app.route('/api/trending/topics', methods=['GET'])
def get_trending_topics():
    try:
        limit = int(request.args.get('limit', 5))
        time_window = int(request.args.get('timeWindow', 168))

        try:
            topics_with_metrics = fetch_all_topics_with_metrics() or []
        except:
            topics_with_metrics = []

        trending = recommendation_engine.calculate_trending_topics(
            topics_with_metrics=topics_with_metrics,
            time_window_hours=time_window
        )

        return jsonify({'success': True, 'trending_topics': trending[:limit]})

    except Exception as e:
        print(f"Error in get_trending_topics: {e}")
        return jsonify({'error': str(e)}), 500

# ---------------------------
# Trending Posts
# ---------------------------
@app.route('/api/trending/posts', methods=['GET'])
def get_trending_posts():
    try:
        limit = int(request.args.get('limit', 3))
        time_window = int(request.args.get('timeWindow', 72))

        try:
            posts_with_metrics = fetch_posts_with_metrics() or []
        except:
            posts_with_metrics = []

        trending = recommendation_engine.calculate_trending_posts(
            posts_with_metrics=posts_with_metrics,
            time_window_hours=time_window,
            min_engagement=1
        )

        # Fallback if not enough trending posts
        if len(trending) < limit:
            recent_threshold = datetime.now() - timedelta(hours=24)
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
                likes = int(post.get('likes_count', 0) or 0)
                comments = int(post.get('comments_count', 0) or 0)
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
            existing_ids = {t['post_id'] for t in trending}
            fallback_posts = [p for p in fallback_posts if p['post_id'] not in existing_ids]
            fallback_posts.sort(key=lambda x: x['score'], reverse=True)
            trending.extend(fallback_posts[:limit - len(trending)])

        return jsonify({'success': True, 'trending_posts': trending[:limit]})

    except Exception as e:
        print(f"Error in get_trending_posts: {e}")
        return jsonify({'error': str(e)}), 500

# ---------------------------
# Personalized Feed
# ---------------------------
@app.route('/api/feed/personalized', methods=['POST'])
def get_personalized_feed():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        limit = int(data.get('limit', 20))

        if not user_id:
            return jsonify({'error': 'userId is required'}), 400

        # Fetch user topics (interestTopics)
        try:
            user_topics = fetch_user_topics(user_id) or []
        except Exception as e:
            print(f"Error fetching topics for user {user_id}: {e}")
            user_topics = []

        # Fetch user activity for personalization
        try:
            user_activity = fetch_user_activity(user_id, limit=200) or []
        except Exception as e:
            print(f"Error fetching activity for user {user_id}: {e}")
            user_activity = []

        # Fetch posts relevant to user's topics
        posts = []
        if user_topics:
            topic_ids = [topic['id'] for topic in user_topics]
            try:
                posts = fetch_posts_by_topics(topic_ids, limit=limit * 3)  # Fetch more to score
            except Exception as e:
                print(f"Error fetching posts by topics: {e}")
                posts = []

        # If no topic-based posts, fallback to all posts
        if not posts:
            try:
                all_posts = fetch_posts_with_metrics() or []
                posts = all_posts[:limit * 3]  # Limit for performance
            except Exception as e:
                print(f"Error fetching all posts: {e}")
                posts = []

        # Generate personalized feed with AI scoring
        personalized = recommendation_engine.generate_personalized_feed(
            user_id=user_id,
            user_topics=user_topics,
            posts=posts,
            user_activity=user_activity,
            limit=limit
        )

        return jsonify({'success': True, 'feed': personalized})

    except Exception as e:
        print(f"Error in get_personalized_feed: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/ai/moderation/analyze', methods=['POST'])
def analyze_content():
    try:
        data = request.get_json()
        content = data.get('content', '')
        content_type = data.get('contentType', 'post')  # 'post' or 'comment'

        if not content:
            return jsonify({'error': 'content is required'}), 400

        # Analyze content for inappropriate material
        moderation_result = recommendation_engine.analyze_content_moderation(content)

        return jsonify({
            'success': True,
            'moderation': moderation_result,
            'contentType': content_type
        })

    except Exception as e:
        print(f"Error in analyze_content: {e}")
        return jsonify({'error': 'An error occurred during content analysis'}), 500
# ---------------------------
# Start Service
# ---------------------------
if __name__ == '__main__':
    print(f"Starting ThinkSync AI Recommendation Service on port {FLASK_PORT}")
    app.run(host='0.0.0.0', port=FLASK_PORT, debug=FLASK_DEBUG)
