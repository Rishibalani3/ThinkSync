import psycopg2
from psycopg2.extras import RealDictCursor
from config import DATABASE_URL
import json

def get_db_connection():
    """Create and return a database connection"""
    try:
        print("Connecting to database with URL:", DATABASE_URL)
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print("Connecting to database with URL:", DATABASE_URL)
        print(f"Database connection error: {e}")
        raise

def fetch_user_topics(user_id):
    """Fetch topics that a user follows"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT t.id, t.name
                FROM "Topic" t
                INNER JOIN "UserTopic" ut ON t.id = ut."topicId"
                WHERE ut."userId" = %s
            """, (user_id,))
            return cur.fetchall()
    finally:
        conn.close()

def fetch_user_activity(user_id, limit=100):
    """Fetch user activity data"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, type, "postId", "topicId", "targetId", metadata, "createdAt"
                FROM "UserActivity"
                WHERE "userId" = %s
                ORDER BY "createdAt" DESC
                LIMIT %s
            """, (user_id, limit))
            activities = cur.fetchall()
            # Convert metadata JSON if it's a string
            for activity in activities:
                if activity.get('metadata') and isinstance(activity['metadata'], str):
                    try:
                        import json
                        activity['metadata'] = json.loads(activity['metadata'])
                    except:
                        activity['metadata'] = {}
            return activities
    finally:
        conn.close()

def fetch_all_topics():
    """Fetch all topics"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT id, name FROM "Topic"')
            return cur.fetchall()
    finally:
        conn.close()

def fetch_all_users():
    """Fetch all users with their topics"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT u.id, u.username, u."displayName"
                FROM "User" u
            """)
            users = cur.fetchall()
            
            # Fetch topics for each user
            for user in users:
                cur.execute("""
                    SELECT t.id, t.name
                    FROM "Topic" t
                    INNER JOIN "UserTopic" ut ON t.id = ut."topicId"
                    WHERE ut."userId" = %s
                """, (user['id'],))
                user['topics'] = cur.fetchall()
            
            return users
    finally:
        conn.close()

def fetch_posts_with_metrics():
    """Fetch all posts with engagement metrics and complete metadata"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    p.id,
                    p.content,
                    p.type,
                    p."authorId",
                    p."createdAt",
                    p."updatedAt",
                    u.id as author_id,
                    u.username as author_username,
                    u."displayName" as author_display_name,
                    COUNT(DISTINCT l.id) as likes_count,
                    COUNT(DISTINCT c.id) as comments_count,
                    COUNT(DISTINCT b.id) as bookmarks_count,
                    COUNT(DISTINCT ua.id) as views_count
                FROM "Post" p
                LEFT JOIN "User" u ON p."authorId" = u.id
                LEFT JOIN "Like" l ON p.id = l."postId"
                LEFT JOIN "Comment" c ON p.id = c."postId"
                LEFT JOIN "Bookmark" b ON p.id = b."postId"
                LEFT JOIN "UserActivity" ua ON p.id = ua."postId" AND ua.type = 'view_post'
                GROUP BY p.id, u.id, u.username, u."displayName"
                ORDER BY p."createdAt" DESC
            """)
            posts = cur.fetchall()
            
            # Fetch topics, mentions, media, and links for each post
            for post in posts:
                # Fetch topics
                cur.execute("""
                    SELECT t.id, t.name
                    FROM "Topic" t
                    INNER JOIN "PostTopic" pt ON t.id = pt."topicId"
                    WHERE pt."postId" = %s
                """, (post['id'],))
                post['topics'] = cur.fetchall()
                
                # Fetch mentions
                cur.execute("""
                    SELECT m."userId", u.id, u.username, u."displayName"
                    FROM "Mention" m
                    INNER JOIN "User" u ON m."userId" = u.id
                    WHERE m."postId" = %s
                """, (post['id'],))
                post['mentions'] = cur.fetchall()
                
                # Fetch media
                cur.execute("""
                    SELECT id, url, type
                    FROM "Media"
                    WHERE "postId" = %s
                """, (post['id'],))
                post['media'] = cur.fetchall()
                
                # Fetch links
                cur.execute("""
                    SELECT id, url, title, description
                    FROM "Link"
                    WHERE "postId" = %s
                """, (post['id'],))
                post['links'] = cur.fetchall()
            
            return posts
    finally:
        conn.close()

def fetch_all_topics_with_metrics():
    """Fetch all topics with engagement metrics - only topics with posts"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    t.id,
                    t.name,
                    COUNT(DISTINCT ut."userId") as user_count,
                    COUNT(DISTINCT pt."postId") as post_count,
                    COUNT(DISTINCT l.id) as total_likes,
                    COUNT(DISTINCT c.id) as total_comments,
                    COUNT(DISTINCT ua.id) as total_views,
                    MAX(p."createdAt") as last_post_date
                FROM "Topic" t
                LEFT JOIN "UserTopic" ut ON t.id = ut."topicId"
                LEFT JOIN "PostTopic" pt ON t.id = pt."topicId"
                LEFT JOIN "Post" p ON pt."postId" = p.id
                LEFT JOIN "Like" l ON p.id = l."postId"
                LEFT JOIN "Comment" c ON p.id = c."postId"
                LEFT JOIN "UserActivity" ua ON p.id = ua."postId" AND ua.type = 'view_post'
                GROUP BY t.id, t.name
                HAVING COUNT(DISTINCT pt."postId") > 0
                ORDER BY 
                    COUNT(DISTINCT pt."postId") DESC,
                    COUNT(DISTINCT l.id) DESC,
                    MAX(p."createdAt") DESC
            """)
            return cur.fetchall()
    finally:
        conn.close()

def fetch_user_following(user_id):
    """Fetch users that a user follows"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT "followingId"
                FROM "Follows"
                WHERE "followerId" = %s
            """, (user_id,))
            return [row['followingId'] for row in cur.fetchall()]
    finally:
        conn.close()

def fetch_posts_by_topics(topic_ids, limit=50):
    """Fetch posts that belong to specific topics, ordered by engagement"""
    if not topic_ids:
        return []
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Use tuple for IN clause (works with psycopg2)
            placeholders = ','.join(['%s'] * len(topic_ids))
            cur.execute(f"""
                SELECT DISTINCT
                    p.id,
                    p.content,
                    p.type,
                    p."authorId",
                    p."createdAt",
                    p."updatedAt",
                    u.id as author_id,
                    u.username as author_username,
                    u."displayName" as author_display_name,
                    COUNT(DISTINCT l.id) as likes_count,
                    COUNT(DISTINCT c.id) as comments_count,
                    COUNT(DISTINCT b.id) as bookmarks_count,
                    COUNT(DISTINCT ua.id) as views_count,
                    (
                        COUNT(DISTINCT l.id) * 1.0 + 
                        COUNT(DISTINCT c.id) * 1.5 + 
                        COUNT(DISTINCT b.id) * 0.8 +
                        COUNT(DISTINCT ua.id) * 0.1
                    ) as engagement_score
                FROM "Post" p
                INNER JOIN "PostTopic" pt ON p.id = pt."postId"
                LEFT JOIN "User" u ON p."authorId" = u.id
                LEFT JOIN "Like" l ON p.id = l."postId"
                LEFT JOIN "Comment" c ON p.id = c."postId"
                LEFT JOIN "Bookmark" b ON p.id = b."postId"
                LEFT JOIN "UserActivity" ua ON p.id = ua."postId" AND ua.type = 'view_post'
                WHERE pt."topicId" IN ({placeholders})
                GROUP BY p.id, u.id, u.username, u."displayName"
                ORDER BY engagement_score DESC, p."createdAt" DESC
                LIMIT %s
            """, tuple(topic_ids) + (limit,))
            posts = cur.fetchall()
            
            # Fetch topics, mentions, media, and links for each post
            for post in posts:
                # Fetch topics
                cur.execute("""
                    SELECT t.id, t.name
                    FROM "Topic" t
                    INNER JOIN "PostTopic" pt ON t.id = pt."topicId"
                    WHERE pt."postId" = %s
                """, (post['id'],))
                post['topics'] = cur.fetchall()
                
                # Fetch mentions
                cur.execute("""
                    SELECT m."userId", u.id, u.username, u."displayName"
                    FROM "Mention" m
                    INNER JOIN "User" u ON m."userId" = u.id
                    WHERE m."postId" = %s
                """, (post['id'],))
                post['mentions'] = cur.fetchall()
                
                # Fetch media
                cur.execute("""
                    SELECT id, url, type
                    FROM "Media"
                    WHERE "postId" = %s
                """, (post['id'],))
                post['media'] = cur.fetchall()
                
                # Fetch links
                cur.execute("""
                    SELECT id, url, title, description
                    FROM "Link"
                    WHERE "postId" = %s
                """, (post['id'],))
                post['links'] = cur.fetchall()
            
            return posts
    finally:
        conn.close()

