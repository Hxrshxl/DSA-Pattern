-- Function to increment user XP and handle level ups
CREATE OR REPLACE FUNCTION increment_user_xp(user_id TEXT, xp_gain INTEGER)
RETURNS void AS $$
DECLARE
  current_xp INTEGER;
  current_level TEXT;
  new_level TEXT;
BEGIN
  -- Get current XP and level
  SELECT xp, level INTO current_xp, current_level
  FROM users WHERE id = user_id;
  
  -- Update XP
  UPDATE users 
  SET xp = xp + xp_gain,
      updated_at = NOW()
  WHERE id = user_id;
  
  -- Check for level up
  current_xp := current_xp + xp_gain;
  
  IF current_level = 'Bronze' AND current_xp >= 1000 THEN
    new_level := 'Silver';
  ELSIF current_level = 'Silver' AND current_xp >= 2500 THEN
    new_level := 'Gold';
  END IF;
  
  -- Update level if changed
  IF new_level IS NOT NULL AND new_level != current_level THEN
    UPDATE users 
    SET level = new_level,
        updated_at = NOW()
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(user_id TEXT)
RETURNS void AS $$
DECLARE
  last_solved_date DATE;
  current_streak INTEGER;
  longest_streak INTEGER;
BEGIN
  -- Get the most recent solved date
  SELECT DATE(solved_at) INTO last_solved_date
  FROM user_progress 
  WHERE user_id = update_user_streak.user_id 
    AND solved = true 
    AND solved_at IS NOT NULL
  ORDER BY solved_at DESC 
  LIMIT 1;
  
  -- Get current streaks
  SELECT current_streak, longest_streak INTO current_streak, longest_streak
  FROM users WHERE id = user_id;
  
  -- Update streak logic
  IF last_solved_date = CURRENT_DATE THEN
    -- Already solved today, no change needed
    RETURN;
  ELSIF last_solved_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Solved yesterday, increment streak
    current_streak := current_streak + 1;
  ELSIF last_solved_date < CURRENT_DATE - INTERVAL '1 day' OR last_solved_date IS NULL THEN
    -- Streak broken, reset to 1
    current_streak := 1;
  END IF;
  
  -- Update longest streak if current is higher
  IF current_streak > longest_streak THEN
    longest_streak := current_streak;
  END IF;
  
  -- Update user record
  UPDATE users 
  SET current_streak = current_streak,
      longest_streak = longest_streak,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get pattern mastery stats
CREATE OR REPLACE FUNCTION get_pattern_mastery(user_id TEXT)
RETURNS TABLE(
  pattern TEXT,
  total_problems BIGINT,
  solved_problems BIGINT,
  mastery_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.pattern,
    COUNT(*) as total_problems,
    COUNT(CASE WHEN up.solved = true THEN 1 END) as solved_problems,
    ROUND(
      (COUNT(CASE WHEN up.solved = true THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
      2
    ) as mastery_percentage
  FROM problems p
  LEFT JOIN user_progress up ON p.id = up.problem_id AND up.user_id = get_pattern_mastery.user_id
  WHERE p.pattern IS NOT NULL AND p.pattern != ''
  GROUP BY p.pattern
  ORDER BY mastery_percentage DESC, p.pattern;
END;
$$ LANGUAGE plpgsql;

-- Function to populate problems from CSV data
CREATE OR REPLACE FUNCTION populate_problems_from_csv()
RETURNS void AS $$
BEGIN
  -- This function would be called after importing CSV data
  -- Update pattern_mastery table for all users
  INSERT INTO pattern_mastery (user_id, pattern, total_problems, mastery_percentage)
  SELECT 
    u.id as user_id,
    pm.pattern,
    pm.total_problems,
    COALESCE(pm.mastery_percentage, 0)
  FROM users u
  CROSS JOIN (
    SELECT DISTINCT pattern, COUNT(*) as total_problems, 0 as mastery_percentage
    FROM problems 
    WHERE pattern IS NOT NULL AND pattern != ''
    GROUP BY pattern
  ) pm
  ON CONFLICT (user_id, pattern) DO UPDATE SET
    total_problems = EXCLUDED.total_problems,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
