import numpy as np
from datetime import datetime, timedelta
import math

class RecommendationEngine:
    def __init__(self):
        pass

    # ---------------------------
    # Topic Recommendations
    # ---------------------------
    def recommend_topics(self, user_id, user_topics, user_activity, all_topics, limit=10):
        recommendations = {}
        user_topic_ids = {topic['id'] for topic in user_topics or []}

        # Activity-based scoring
        topic_activity_weights = {}
        for activity in user_activity or []:
            topic_id = activity.get('topicId')
            if topic_id:
                topic_activity_weights[topic_id] = topic_activity_weights.get(topic_id, 0) + {
                    'view_post': 0.5,
                    'like': 1.0,
                    'bookmark': 1.5,
                    'comment': 1.2,
                    'follow': 2.0
                }.get(activity.get('type'), 0.5)

        # Score topics not yet followed
        for topic in all_topics or []:
            if topic['id'] not in user_topic_ids:
                score = topic_activity_weights.get(topic['id'], 0)
                # Text similarity boost
                for user_topic in user_topics or []:
                    if self._text_similarity(user_topic.get('name'), topic.get('name')) > 0.3:
                        score += 0.4
                if score > 0:
                    recommendations[topic['id']] = {
                        'topic_id': topic['id'],
                        'name': topic.get('name'),
                        'score': score,
                        'reason': 'Based on your activity and interests'
                    }

        # Fallback for new/inactive users
        if not recommendations:
            for topic in all_topics or []:
                recommendations[topic['id']] = {
                    'topic_id': topic['id'],
                    'name': topic.get('name'),
                    'score': 0.1,
                    'reason': 'Popular topic for new users'
                }

        return sorted(recommendations.values(), key=lambda x: x['score'], reverse=True)[:limit]

    # ---------------------------
    # User Recommendations
    # ---------------------------
    def recommend_users(self, user_id, user_topics, all_users, user_following, limit=10):
        following_set = set(user_following or [])
        user_scores = []
        
        # If user has topics, use collaborative filtering
        if user_topics and len(user_topics) > 0:
            user_topic_ids = {topic['id'] for topic in user_topics}

            for other_user in all_users or []:
                if other_user['id'] == user_id or other_user['id'] in following_set:
                    continue
                other_topics = {t['id'] for t in other_user.get('topics') or []}
                if not other_topics:
                    continue

                # Jaccard similarity
                intersection = len(user_topic_ids & other_topics)
                union = len(user_topic_ids | other_topics)
                if union == 0:
                    continue
                similarity = intersection / union
                score = similarity * (1 + len(intersection) * 0.1)
                if score > 0:
                    user_scores.append({
                        'user_id': other_user['id'],
                        'username': other_user.get('username'),
                        'displayName': other_user.get('displayName'),
                        'score': score,
                        'common_topics_count': intersection,
                        'reason': f'{intersection} common interests'
                    })
        else:
            # Fallback: Recommend active users with most topics (popular users)
            for other_user in all_users or []:
                if other_user['id'] == user_id or other_user['id'] in following_set:
                    continue
                other_topics = other_user.get('topics') or []
                if not other_topics:
                    continue
                
                # Score based on number of topics (popular/active users)
                topic_count = len(other_topics)
                score = min(topic_count * 0.1, 1.0)  # Normalize to max 1.0
                
                user_scores.append({
                    'user_id': other_user['id'],
                    'username': other_user.get('username'),
                    'displayName': other_user.get('displayName'),
                    'score': score,
                    'common_topics_count': 0,
                    'reason': 'Popular user with diverse interests'
                })

        return sorted(user_scores, key=lambda x: x['score'], reverse=True)[:limit]

    # ---------------------------
    # Trending Topics
    # ---------------------------
    def calculate_trending_topics(self, topics_with_metrics, time_window_hours=168):
        trending_scores = []
        now = datetime.now()

        for topic in topics_with_metrics or []:
            try:
                user_count = int(topic.get('user_count', 0) or 0)
                post_count = int(topic.get('post_count', 0) or 0)
                total_likes = int(topic.get('total_likes', 0) or 0)
                total_comments = int(topic.get('total_comments', 0) or 0)
                total_views = int(topic.get('total_views', 0) or 0)

                engagement = total_likes + (total_comments * 1.5) + (total_views * 0.1)
                velocity = (post_count * 2) + (user_count * 0.5)

                engagement_score = math.log1p(engagement)
                velocity_score = math.log1p(velocity)

                trending_score = (engagement_score * 0.6) + (velocity_score * 0.4)

                if user_count > 0:
                    user_growth_factor = min(user_count / 100, 1.0)
                    trending_score *= (1 + user_growth_factor * 0.2)

                trending_scores.append({
                    'topic_id': topic['id'],
                    'name': topic.get('name'),
                    'score': trending_score,
                    'metrics': {
                        'users': user_count,
                        'posts': post_count,
                        'likes': total_likes,
                        'comments': total_comments,
                        'views': total_views,
                        'engagement': engagement
                    }
                })
            except Exception as e:
                print(f"Error calculating trending topic {topic.get('id')}: {e}")

        return sorted(trending_scores, key=lambda x: x['score'], reverse=True)

    # ---------------------------
    # Trending Posts
    # ---------------------------
    def calculate_trending_posts(self, posts_with_metrics, time_window_hours=72, min_engagement=1):
        trending_scores = []
        now = datetime.now()

        for post in posts_with_metrics or []:
            try:
                created_at = post.get('createdAt')
                if not created_at:
                    continue
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                age_hours = (now - created_at.replace(tzinfo=None)).total_seconds() / 3600
                if age_hours > time_window_hours:
                    continue

                likes = int(post.get('likes_count', 0) or 0)
                comments = int(post.get('comments_count', 0) or 0)
                bookmarks = int(post.get('bookmarks_count', 0) or 0)
                views = int(post.get('views_count', 0) or 0)

                engagement = likes + comments + bookmarks + views
                if engagement < min_engagement:
                    continue

                decay_factor = np.exp(-age_hours / 24)
                velocity = engagement / age_hours if age_hours > 0 else engagement
                trending_score = engagement * decay_factor * (1 + np.log1p(velocity) * 0.3)

                if likes > 0:
                    discussion_factor = min(comments / likes, 3.0)
                    trending_score *= (1 + discussion_factor * 0.1)

                trending_scores.append({
                    'post_id': post['id'],
                    'score': trending_score,
                    'metrics': {
                        'likes': likes,
                        'comments': comments,
                        'bookmarks': bookmarks,
                        'views': views,
                        'age_hours': age_hours,
                        'engagement': engagement
                    }
                })
            except Exception as e:
                print(f"Error calculating trending post {post.get('id')}: {e}")

        return sorted(trending_scores, key=lambda x: x['score'], reverse=True)

    # ---------------------------
    # Personalized Feed
    # ---------------------------
    def generate_personalized_feed(self, user_id, user_topics, posts, user_activity=None, limit=50):
        """
        Generate personalized feed based on user's interest topics and activity.
        Scores posts based on:
        1. Topic relevance (how many of user's topics match post topics)
        2. Engagement signals (likes, comments, views)
        3. Recency (newer posts get boost)
        4. User activity patterns (what types of posts user interacts with)
        """
        if not posts:
            return []
        
        if not user_topics or len(user_topics) == 0:
            # Fallback: Return recent posts sorted by engagement
            scored_posts = []
            now = datetime.now()
            for post in posts:
                created_at = post.get('createdAt')
                if not created_at:
                    continue
                if isinstance(created_at, str):
                    try:
                        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    except:
                        continue
                
                age_hours = (now - created_at.replace(tzinfo=None)).total_seconds() / 3600
                likes = int(post.get('likes_count', 0) or 0)
                comments = int(post.get('comments_count', 0) or 0)
                engagement = likes + comments * 1.5
                
                # Simple score: engagement with recency decay
                score = engagement * np.exp(-age_hours / 168)  # Decay over 1 week
                
                scored_posts.append({
                    'post_id': post['id'],
                    'score': score,
                    'reason': 'Recent popular post'
                })
            
            return sorted(scored_posts, key=lambda x: x['score'], reverse=True)[:limit]
        
        # Build user topic set for fast lookup
        user_topic_ids = {topic['id'] for topic in user_topics}
        user_topic_names = {topic.get('name', '').lower() for topic in user_topics}
        
        # Analyze user activity patterns if available
        activity_weights = {}
        if user_activity:
            for activity in user_activity:
                activity_type = activity.get('type')
                if activity_type:
                    activity_weights[activity_type] = activity_weights.get(activity_type, 0) + 1
        
        # Score each post
        scored_posts = []
        now = datetime.now()
        
        for post in posts:
            try:
                # Extract post topics
                post_topics = post.get('topics', [])
                post_topic_ids = {t['id'] for t in post_topics if isinstance(t, dict) and 'id' in t}
                post_topic_names = {t.get('name', '').lower() for t in post_topics if isinstance(t, dict)}
                
                # Topic relevance score
                topic_match_count = len(user_topic_ids & post_topic_ids)
                if topic_match_count == 0:
                    # Try name-based matching for fuzzy matching
                    name_matches = len(user_topic_names & post_topic_names)
                    if name_matches == 0:
                        # Skip posts with no topic overlap (optional: can include with lower score)
                        continue
                    topic_score = name_matches * 0.5
                else:
                    topic_score = topic_match_count * 2.0
                
                # Engagement score
                likes = int(post.get('likes_count', 0) or 0)
                comments = int(post.get('comments_count', 0) or 0)
                bookmarks = int(post.get('bookmarks_count', 0) or 0)
                views = int(post.get('views_count', 0) or 0)
                engagement = likes + (comments * 1.5) + (bookmarks * 1.2) + (views * 0.1)
                
                # Recency score (boost for recent posts)
                created_at = post.get('createdAt')
                if not created_at:
                    continue
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                age_hours = (now - created_at.replace(tzinfo=None)).total_seconds() / 3600
                recency_factor = np.exp(-age_hours / 168)  # Decay over 1 week
                
                # Activity pattern boost (if user interacts with similar content types)
                activity_boost = 1.0
                post_type = post.get('type', 'idea')
                if activity_weights.get('like', 0) > 5:
                    activity_boost += 0.1
                if activity_weights.get('comment', 0) > 3:
                    activity_boost += 0.15
                
                # Combined score
                base_score = topic_score * (1 + np.log1p(engagement) * 0.5)
                final_score = base_score * recency_factor * activity_boost
                
                # Reason for recommendation
                reasons = []
                if topic_match_count > 0:
                    reasons.append(f"{topic_match_count} matching interests")
                if engagement > 10:
                    reasons.append("high engagement")
                if age_hours < 24:
                    reasons.append("recent")
                
                reason = ", ".join(reasons) if reasons else "based on your interests"
                
                scored_posts.append({
                    'post_id': post['id'],
                    'score': final_score,
                    'metrics': {
                        'topic_matches': topic_match_count,
                        'engagement': engagement,
                        'age_hours': age_hours,
                        'likes': likes,
                        'comments': comments
                    },
                    'reason': reason
                })
                
            except Exception as e:
                print(f"Error scoring post {post.get('id')}: {e}")
                continue
        
        # Sort by score and return top N
        return sorted(scored_posts, key=lambda x: x['score'], reverse=True)[:limit]

    # ---------------------------
    # Text similarity
    # ---------------------------
    def _text_similarity(self, str1, str2):
        if not str1 or not str2:
            return 0.0
        str1_lower, str2_lower = str1.lower(), str2.lower()
        if str1_lower in str2_lower or str2_lower in str1_lower:
            return 0.8
        words1, words2 = set(str1_lower.split()), set(str2_lower.split())
        return len(words1 & words2) / len(words1 | words2) if words1 and words2 else 0.0
