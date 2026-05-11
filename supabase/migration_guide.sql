-- ============================================
-- Survey4U Database Migration Guide
-- ============================================
-- This script will set up your database from scratch
-- Run this in Supabase SQL Editor

-- STEP 1: Clean up existing tables
-- ============================================
DROP TRIGGER IF EXISTS trigger_create_default_questions ON events;
DROP FUNCTION IF EXISTS create_default_questions();
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- STEP 2: Create admins table
-- ============================================
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 3: Insert your admin account
-- ============================================
-- IMPORTANT: Change the email and password to match your .env file
INSERT INTO admins (id, name, email, password) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin User',
  'sudhaanshuu@gmail.com',  -- Change this to your email
  '418667'                   -- Change this to your password
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name;

-- STEP 4: Create events table
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  qr_code_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 5: Create questions table
-- ============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'text',
  options JSONB,
  order_number INT,
  is_required BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- STEP 6: Create responses table
-- ============================================
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  session_id UUID NOT NULL,
  responder_name VARCHAR(255),
  responder_email VARCHAR(255),
  answer_text TEXT,
  answer_audio_url TEXT,
  response_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP DEFAULT NOW()
);

-- STEP 7: Create indexes
-- ============================================
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_admin_id ON events(admin_id);
CREATE INDEX idx_questions_event_id ON questions(event_id);
CREATE INDEX idx_responses_event_id ON responses(event_id);
CREATE INDEX idx_responses_question_id ON responses(question_id);
CREATE INDEX idx_responses_session_id ON responses(session_id);

-- STEP 8: Enable Row Level Security
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- STEP 9: Create RLS Policies
-- ============================================

-- Admins policies
CREATE POLICY "Admins can view their own data" ON admins
  FOR SELECT USING (true);

-- Events policies
CREATE POLICY "Admins can view all events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Admins can create events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update their events" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete their events" ON events
  FOR DELETE USING (true);

-- Questions policies
CREATE POLICY "Anyone can view questions for published events" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = questions.event_id 
      AND events.status = 'published'
    )
  );

CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (true);

-- Responses policies
CREATE POLICY "Anyone can submit responses" ON responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all responses" ON responses
  FOR SELECT USING (true);

-- STEP 10: Create helper functions
-- ============================================

-- Function to get public event by slug
CREATE OR REPLACE FUNCTION get_event_by_slug(event_slug TEXT)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  slug VARCHAR,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.title, e.description, e.slug, e.status
  FROM events e
  WHERE e.slug = event_slug AND e.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get questions for an event
CREATE OR REPLACE FUNCTION get_event_questions(event_id UUID)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  question_type VARCHAR,
  options JSONB,
  order_number INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.question_text, q.question_type, q.options, q.order_number
  FROM questions q
  WHERE q.event_id = get_event_questions.event_id
  ORDER BY q.order_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 11: Create trigger for default questions
-- ============================================

-- Function to create default questions
CREATE OR REPLACE FUNCTION create_default_questions()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default Name question
  INSERT INTO questions (event_id, question_text, question_type, order_number, is_required, is_default)
  VALUES (NEW.id, 'Your Name', 'text', 1, true, true);
  
  -- Insert default Email question
  INSERT INTO questions (event_id, question_text, question_type, order_number, is_required, is_default)
  VALUES (NEW.id, 'Your Email', 'text', 2, true, true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_create_default_questions
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION create_default_questions();

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- You can now:
-- 1. Login with the email/password you set above
-- 2. Create events (Name & Email questions will be auto-created)
-- 3. Add custom questions
-- 4. Publish and share surveys
-- ============================================
