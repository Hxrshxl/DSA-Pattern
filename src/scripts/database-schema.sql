-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Clerk user data)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Gamification fields
  level TEXT DEFAULT 'Bronze',
  xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- in minutes
  
  -- Preferences
  daily_goal INTEGER DEFAULT 3,
  weekly_goal INTEGER DEFAULT 15,
  notifications_enabled BOOLEAN DEFAULT true
);

-- Create problems table
CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  acceptance_rate DECIMAL(5,4),
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  frequency DECIMAL(5,4),
  topics TEXT[], -- Array of topic strings
  pattern TEXT,
  question_no INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT REFERENCES problems(id) ON DELETE CASCADE,
  solved BOOLEAN DEFAULT false,
  solved_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- in minutes
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, problem_id)
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT REFERENCES problems(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('general', 'mistakes', 'insights')),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, problem_id, type)
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')),
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT REFERENCES problems(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- in minutes
  completed BOOLEAN DEFAULT false,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pattern_mastery table
CREATE TABLE IF NOT EXISTS pattern_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  level TEXT DEFAULT 'Bronze' CHECK (level IN ('Bronze', 'Silver', 'Gold')),
  problems_solved INTEGER DEFAULT 0,
  total_problems INTEGER DEFAULT 0,
  mastery_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, pattern)
);

-- Create revision_schedule table
CREATE TABLE IF NOT EXISTS revision_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT REFERENCES problems(id) ON DELETE CASCADE,
  next_review_date DATE NOT NULL,
  interval_days INTEGER DEFAULT 1,
  ease_factor DECIMAL(3,2) DEFAULT 2.50,
  repetitions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_schedule ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Create RLS policies for user_progress table
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR ALL USING (auth.uid()::text = user_id);

-- Create RLS policies for notes table
CREATE POLICY "Users can manage own notes" ON notes
  FOR ALL USING (auth.uid()::text = user_id);

-- Create RLS policies for goals table
CREATE POLICY "Users can manage own goals" ON goals
  FOR ALL USING (auth.uid()::text = user_id);

-- Create RLS policies for study_sessions table
CREATE POLICY "Users can manage own study sessions" ON study_sessions
  FOR ALL USING (auth.uid()::text = user_id);

-- Create RLS policies for pattern_mastery table
CREATE POLICY "Users can manage own pattern mastery" ON pattern_mastery
  FOR ALL USING (auth.uid()::text = user_id);

-- Create RLS policies for revision_schedule table
CREATE POLICY "Users can manage own revision schedule" ON revision_schedule
  FOR ALL USING (auth.uid()::text = user_id);

-- Problems table is public (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view problems" ON problems
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_problem_id ON user_progress(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_solved ON user_progress(solved);
CREATE INDEX IF NOT EXISTS idx_notes_user_problem ON notes(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_active ON goals(user_id, active);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_pattern_mastery_user ON pattern_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_revision_schedule_user_date ON revision_schedule(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_pattern ON problems(pattern);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pattern_mastery_updated_at BEFORE UPDATE ON pattern_mastery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revision_schedule_updated_at BEFORE UPDATE ON revision_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
