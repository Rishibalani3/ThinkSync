import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime, timedelta
import json

class RecommendationEngine:
    def __init__(self):
        self.scaler = MinMaxScaler()
    
    def calculate_topic_similarity(self, user_topics, all_topics):
        """Calculate similarity between user's topics and all topics using cosine similarity"""
        if not user_topics or not all_topics:
            return {}
        
        # Create topic vectors
        user_topic_ids = {topic['id']: 1 for topic in user_topics}
        
        similarities = {}
        for topic in all_topics:
            if topic['id'] not in user_topic_ids:
                # Calculate similarity based on co-occurrence and user interests
                similarity = 0.1  # Base similarity
                similarities[topic['id']] = {
                    'topic_id': topic['id'],
                    'name': topic['name'],
                    'score': similarity
                }
        
        return similarities
    
    def recommend_topics(self, user_id, user_topics, user_activity, all_topics, limit=10):
        """Recommend topics based on user interests and activity"""
        recommendations = {}
        
        # 1. Based on user's current topics (content-based filtering)
        user_topic_ids = {topic['id'] for topic in user_topics}
        
        # 2. Analyze activity patterns
        topic_activity_weights = {}
        if user_activity:
            for activity in user_activity:
                activity_type = activity['type']
                topic_id = activity.get('topicId')
                
                if topic_id:
                    if topic_id not in topic_activity_weights:
                        topic_activity_weights[topic_id] = 0
                    
                    # Weight different activities
                    weights = {
                        'view_post': 0.5,
                        'like': 1.0,
                        'bookmark': 1.5,
                        'comment': 1.2,
                        'follow': 2.0
                    }
                    topic_activity_weights[topic_id] += weights.get(activity_type, 0.5)
        
        # 3. Recommend topics user doesn't follow yet
        for topic in all_topics:
            if topic['id'] not in user_topic_ids:
                score = 0.0
                
                # Base score from activity
                if topic['id'] in topic_activity_weights:
                    score += topic_activity_weights[topic['id']] * 0.6
                
                # Boost score for topics related to user's current interests
                # (Simplified: topics with similar names or co-occurring in posts)
                for user_topic in user_topics:
                    # Simple text similarity (can be enhanced with NLP)
                    if self._text_similarity(user_topic['name'], topic['name']) > 0.3:
                        score += 0.4
                
                if score > 0:
                    recommendations[topic['id']] = {
                        'topic_id': topic['id'],
                        'name': topic['name'],
                        'score': score,
                        'reason': 'Based on your activity and interests'
                    }
        
        # Sort by score and return top N
        sorted_recommendations = sorted(
            recommendations.values(),
            key=lambda x: x['score'],
            reverse=True
        )
        
        return sorted_recommendations[:limit]
    
    def recommend_users(self, user_id, user_topics, all_users, user_following, limit=10):
        """Recommend users to follow based on similar interests (collaborative filtering)"""
        if not user_topics:
            return []
        
        user_topic_ids = {topic['id'] for topic in user_topics}
        following_set = set(user_following or [])
        
        user_scores = []
        
        for other_user in all_users:
            if other_user['id'] == user_id or other_user['id'] in following_set:
                continue
            
            other_user_topics = {topic['id'] for topic in (other_user.get('topics') or [])}
            
            if not other_user_topics:
                continue
            
            # Calculate Jaccard similarity (intersection over union)
            intersection = len(user_topic_ids & other_user_topics)
            union = len(user_topic_ids | other_user_topics)
            
            if union > 0:
                similarity = intersection / union
                
                # Boost score based on number of common topics
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
        
        # Sort by score and return top N
        sorted_users = sorted(user_scores, key=lambda x: x['score'], reverse=True)
        return sorted_users[:limit]
    
    def calculate_trending_topics(self, topics_with_metrics, time_window_hours=168):
        """Calculate trending topics using ML scoring"""
        if not topics_with_metrics:
            return []
        
        now = datetime.now()
        time_threshold = now - timedelta(hours=time_window_hours)
        
        trending_scores = []
        
        for topic in topics_with_metrics:
            # Extract metrics
            user_count = topic.get('user_count', 0) or 0
            post_count = topic.get('post_count', 0) or 0
            total_likes = topic.get('total_likes', 0) or 0
            total_comments = topic.get('total_comments', 0) or 0
            total_views = topic.get('total_views', 0) or 0
            
            # Calculate engagement rate
            engagement = total_likes + (total_comments * 1.5) + (total_views * 0.1)
            
            # Calculate velocity (growth rate)
            # Simplified: using current metrics as velocity indicator
            velocity = (post_count * 2) + (user_count * 0.5)
            
            # Normalized scores (to handle different scales)
            # Using logarithmic scaling to prevent very large topics from dominating
            import math
            engagement_score = math.log1p(engagement)  # log(1 + x)
            velocity_score = math.log1p(velocity)
            
            # Weighted combination
            # Trending = 60% engagement + 40% velocity
            trending_score = (engagement_score * 0.6) + (velocity_score * 0.4)
            
            # Boost for topics with growing user base
            if user_count > 0:
                user_growth_factor = min(user_count / 100, 1.0)  # Cap at 1.0
                trending_score *= (1 + user_growth_factor * 0.2)
            
            trending_scores.append({
                'topic_id': topic['id'],
                'name': topic['name'],
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
        
        # Sort by trending score
        sorted_topics = sorted(trending_scores, key=lambda x: x['score'], reverse=True)
        return sorted_topics
    
    def calculate_trending_posts(self, posts_with_metrics, time_window_hours=72):
        """Calculate trending posts using ML scoring"""
        if not posts_with_metrics:
            return []
        
        now = datetime.now()
        trending_scores = []
        
        for post in posts_with_metrics:
            created_at = post.get('createdAt')
            if not created_at:
                continue
            
            # Convert to datetime if it's a string
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except:
                    continue
            
            # Calculate age in hours
            age_hours = (now - created_at.replace(tzinfo=None)).total_seconds() / 3600
            
            # Skip posts older than time window
            if age_hours > time_window_hours:
                continue
            
            # Extract metrics
            likes_count = post.get('likes_count', 0) or 0
            comments_count = post.get('comments_count', 0) or 0
            bookmarks_count = post.get('bookmarks_count', 0) or 0
            views_count = post.get('views_count', 0) or 0
            
            # Calculate engagement score
            engagement = (
                likes_count * 1.0 +
                comments_count * 1.5 +
                bookmarks_count * 2.0 +
                views_count * 0.1
            )
            
            # Time decay factor (newer posts get higher scores)
            # Using exponential decay
            decay_factor = np.exp(-age_hours / 24)  # Half-life of 24 hours
            
            # Velocity factor (engagement per hour)
            if age_hours > 0:
                velocity = engagement / age_hours
            else:
                velocity = engagement
            
            # Trending score = engagement * decay * velocity_factor
            trending_score = engagement * decay_factor * (1 + np.log1p(velocity) * 0.3)
            
            # Boost for posts with high comment-to-like ratio (high discussion)
            if likes_count > 0:
                discussion_factor = min(comments_count / likes_count, 3.0)
                trending_score *= (1 + discussion_factor * 0.1)
            
            trending_scores.append({
                'post_id': post['id'],
                'score': trending_score,
                'metrics': {
                    'likes': likes_count,
                    'comments': comments_count,
                    'bookmarks': bookmarks_count,
                    'views': views_count,
                    'age_hours': age_hours,
                    'engagement': engagement
                }
            })
        
        # Sort by trending score
        sorted_posts = sorted(trending_scores, key=lambda x: x['score'], reverse=True)
        return sorted_posts
    
    def _text_similarity(self, str1, str2):
        """Simple text similarity using word overlap"""
        if not str1 or not str2:
            return 0.0
        
        words1 = set(str1.lower().split())
        words2 = set(str2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        
        return intersection / union if union > 0 else 0.0

