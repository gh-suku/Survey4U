# 🔧 Quick Fix for Foreign Key Error

## Your Error:
```
insert or update on table "events" violates foreign key constraint "events_admin_id_fkey"
```

## ⚡ Quick Fix (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Copy and Run This Script

**IMPORTANT:** Change the email and password on lines 7-8 to match your `.env` file!

```sql
-- Clean up and recreate everything
DROP TRIGGER IF EXISTS trigger_create_default_questions ON events;
DROP FUNCTION IF EXISTS create_default_questions();
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Create admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ⚠️ CHANGE THESE VALUES TO MATCH YOUR .env FILE ⚠️
INSERT INTO admins (id, name, email, password) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin User',
  'sudhaanshuu@gmail.com',  -- ← Change this to your VITE_INITIAL_ADMIN_EMAIL
  '418667'                   -- ← Change this to your VITE_INITIAL_ADMIN_PASSWORD
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name;

-- Create events table
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

-- Create questions table
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

-- Create responses table
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

-- Create indexes
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_admin_id ON events(admin_id);
CREATE INDEX idx_questions_event_id ON questions(event_id);
CREATE INDEX idx_responses_event_id ON responses(event_id);
CREATE INDEX idx_responses_question_id ON responses(question_id);
CREATE INDEX idx_responses_session_id ON responses(session_id);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view their own data" ON admins FOR SELECT USING (true);
CREATE POLICY "Admins can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can create events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update their events" ON events FOR UPDATE USING (true);
CREATE POLICY "Admins can delete their events" ON events FOR DELETE USING (true);
CREATE POLICY "Anyone can view questions for published events" ON questions FOR SELECT USING (EXISTS (SELECT 1 FROM events WHERE events.id = questions.event_id AND events.status = 'published'));
CREATE POLICY "Admins can manage questions" ON questions FOR ALL USING (true);
CREATE POLICY "Anyone can submit responses" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all responses" ON responses FOR SELECT USING (true);

-- Helper functions
CREATE OR REPLACE FUNCTION get_event_by_slug(event_slug TEXT)
RETURNS TABLE (id UUID, title VARCHAR, description TEXT, slug VARCHAR, status VARCHAR) AS $$
BEGIN
  RETURN QUERY SELECT e.id, e.title, e.description, e.slug, e.status FROM events e WHERE e.slug = event_slug AND e.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_event_questions(event_id UUID)
RETURNS TABLE (id UUID, question_text TEXT, question_type VARCHAR, options JSONB, order_number INT) AS $$
BEGIN
  RETURN QUERY SELECT q.id, q.question_text, q.question_type, q.options, q.order_number FROM questions q WHERE q.event_id = get_event_questions.event_id ORDER BY q.order_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default questions trigger
CREATE OR REPLACE FUNCTION create_default_questions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO questions (event_id, question_text, question_type, order_number, is_required, is_default)
  VALUES (NEW.id, 'Your Name', 'text', 1, true, true);
  INSERT INTO questions (event_id, question_text, question_type, order_number, is_required, is_default)
  VALUES (NEW.id, 'Your Email', 'text', 2, true, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_questions
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION create_default_questions();
```

### Step 3: Click "Run" Button

Wait for the success message. You should see:
```
Success. No rows returned
```

### Step 4: Clear Browser Data

1. Open your browser DevTools (F12)
2. Go to "Application" tab
3. Click "Local Storage" → your localhost
4. Click "Clear All"
5. Or run in console: `localStorage.clear()`

### Step 5: Login Again

1. Go to http://localhost:3000/admin/login
2. Login with the email and password you set in Step 2
3. This will store the correct admin ID

### Step 6: Try Creating an Event

1. Click "Create Event"
2. Fill in the form
3. Click "Create Event"
4. ✅ Should work now!

## ✅ Verification

After completing the steps, verify:

1. **Admin exists:**
   ```sql
   SELECT * FROM admins;
   ```
   Should show your admin account.

2. **Can create event:**
   - Go to dashboard
   - Click "Create Event"
   - Should work without errors

3. **Default questions appear:**
   - After creating event
   - Should see "Your Name" and "Your Email" questions

## 🔴 Still Not Working?

### Check Your .env File

Make sure it has:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_INITIAL_ADMIN_EMAIL=sudhaanshuu@gmail.com
VITE_INITIAL_ADMIN_PASSWORD=418667
```

### Restart the Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for any red errors
4. Share the error message if you need help

## 📞 Need More Help?

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions to common issues.

---

**That's it!** Your database is now set up correctly and you can create events. 🎉
