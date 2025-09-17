-- Create function to handle follow notifications
CREATE OR REPLACE FUNCTION notify_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
  followed_user_id UUID;
BEGIN
  -- Get follower's display name
  SELECT display_name INTO follower_name
  FROM profiles
  WHERE user_id = NEW.follower_id;

  -- The followed user is the one being notified
  followed_user_id := NEW.followed_id;

  -- Insert notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    followed_user_id,
    'follow',
    'New Follower',
    COALESCE(follower_name, 'Someone') || ' started following you',
    jsonb_build_object(
      'followerId', NEW.follower_id,
      'followerUsername', (SELECT username FROM profiles WHERE user_id = NEW.follower_id),
      'followerName', follower_name
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle like notifications
CREATE OR REPLACE FUNCTION notify_like()
RETURNS TRIGGER AS $$
DECLARE
  liker_name TEXT;
  post_author_id UUID;
BEGIN
  -- Get liker's display name
  SELECT display_name INTO liker_name
  FROM profiles
  WHERE user_id = NEW.user_id;

  -- Get post author
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Don't notify if user likes their own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    post_author_id,
    'like',
    'New Like',
    COALESCE(liker_name, 'Someone') || ' liked your post',
    jsonb_build_object(
      'likerId', NEW.user_id,
      'likerUsername', (SELECT username FROM profiles WHERE user_id = NEW.user_id),
      'likerName', liker_name,
      'postId', NEW.post_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle comment notifications
CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER AS $$
DECLARE
  commenter_name TEXT;
  post_author_id UUID;
  parent_commenter_id UUID;
BEGIN
  -- Get commenter's display name
  SELECT display_name INTO commenter_name
  FROM profiles
  WHERE user_id = NEW.author_id;

  -- Get post author
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Insert notification for post author (if not the commenter)
  IF post_author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      post_author_id,
      'comment',
      'New Comment',
      COALESCE(commenter_name, 'Someone') || ' commented on your post',
      jsonb_build_object(
        'commenterId', NEW.author_id,
        'commenterUsername', (SELECT username FROM profiles WHERE user_id = NEW.author_id),
        'commenterName', commenter_name,
        'postId', NEW.post_id,
        'commentId', NEW.id
      )
    );
  END IF;

  -- If this is a reply, notify the parent commenter
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT author_id INTO parent_commenter_id
    FROM comments
    WHERE id = NEW.parent_comment_id;

    -- Don't notify if replying to own comment or if parent commenter is post author (already notified)
    IF parent_commenter_id != NEW.author_id AND parent_commenter_id != post_author_id THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        parent_commenter_id,
        'comment',
        'New Reply',
        COALESCE(commenter_name, 'Someone') || ' replied to your comment',
        jsonb_build_object(
          'commenterId', NEW.author_id,
          'commenterUsername', (SELECT username FROM profiles WHERE user_id = NEW.author_id),
          'commenterName', commenter_name,
          'postId', NEW.post_id,
          'commentId', NEW.id,
          'parentCommentId', NEW.parent_comment_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle like notifications
CREATE OR REPLACE FUNCTION notify_like()
RETURNS TRIGGER AS $$
DECLARE
  liker_name TEXT;
  post_author_id UUID;
BEGIN
  -- Get liker's display name
  SELECT display_name INTO liker_name
  FROM profiles
  WHERE user_id = NEW.user_id;

  -- Get post author
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Don't notify if user likes their own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    post_author_id,
    'like',
    'New Like',
    COALESCE(liker_name, 'Someone') || ' liked your post',
    jsonb_build_object(
      'likerId', NEW.user_id,
      'likerUsername', (SELECT username FROM profiles WHERE user_id = NEW.user_id),
      'likerName', liker_name,
      'postId', NEW.post_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle comment notifications
CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER AS $$
DECLARE
  commenter_name TEXT;
  post_author_id UUID;
  parent_commenter_id UUID;
BEGIN
  -- Get commenter's display name
  SELECT display_name INTO commenter_name
  FROM profiles
  WHERE user_id = NEW.author_id;

  -- Get post author
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Insert notification for post author (if not the commenter)
  IF post_author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      post_author_id,
      'comment',
      'New Comment',
      COALESCE(commenter_name, 'Someone') || ' commented on your post',
      jsonb_build_object(
        'commenterId', NEW.author_id,
        'commenterUsername', (SELECT username FROM profiles WHERE user_id = NEW.author_id),
        'commenterName', commenter_name,
        'postId', NEW.post_id,
        'commentId', NEW.id
      )
    );
  END IF;

  -- If this is a reply, notify the parent commenter
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT author_id INTO parent_commenter_id
    FROM comments
    WHERE id = NEW.parent_comment_id;

    -- Don't notify if replying to own comment or if parent commenter is post author (already notified)
    IF parent_commenter_id != NEW.author_id AND parent_commenter_id != post_author_id THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        parent_commenter_id,
        'comment',
        'New Reply',
        COALESCE(commenter_name, 'Someone') || ' replied to your comment',
        jsonb_build_object(
          'commenterId', NEW.author_id,
          'commenterUsername', (SELECT username FROM profiles WHERE user_id = NEW.author_id),
          'commenterName', commenter_name,
          'postId', NEW.post_id,
          'commentId', NEW.id,
          'parentCommentId', NEW.parent_comment_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_follow_notification ON follows;
CREATE TRIGGER trigger_follow_notification
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION notify_follow();

DROP TRIGGER IF EXISTS trigger_like_notification ON likes;
CREATE TRIGGER trigger_like_notification
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION notify_like();

DROP TRIGGER IF EXISTS trigger_comment_notification ON comments;
CREATE TRIGGER trigger_comment_notification
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_comment();
