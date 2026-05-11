# Survey4U - Troubleshooting Guide

## 🔴 Error: "violates foreign key constraint events_admin_id_fkey"

### Problem
This error occurs when trying to create an event, but the admin account doesn't exist in the database.

### Solution

**Option 1: Use the Migration Guide (Recommended)**

1. Open Supabase SQL Editor
2. Open the file `supabase/migration_guide.sql`
3. **IMPORTANT:** Edit line 32-33 to match your email and password from `.env`:
   ```sql
   'sudhaanshuu@gmail.com',  -- Change to your VITE_INITIAL_ADMIN_EMAIL
   '418667'                   -- Change to your VITE_INITIAL_ADMIN_PASSWORD
   ```
4. Copy the **entire file** and paste into Supabase SQL Editor
5. Click "Run"
6. Wait for success message

**Option 2: Manual Steps**

1. **First, create the admin:**
   ```sql
   INSERT INTO admins (id, name, email, password) 
   VALUES (
     '00000000-0000-0000-0000-000000000001',
     'Admin User',
     'sudhaanshuu@gmail.com',
     '418667'
   )
   ON CONFLICT (email) DO UPDATE SET
     password = EXCLUDED.password;
   ```

2. **Then, logout and login again:**
   - Go to `/admin/login`
   - Login with the email and password you just created
   - This will store the correct admin ID in localStorage

3. **Now try creating an event**

### Why This Happens

When you run the schema, it creates the tables but the admin account might not exist yet. The `events` table has a foreign key to `admins`, so you need an admin account first.

---

## 🔴 Error: "Admin account not found"

### Problem
The admin ID in localStorage doesn't match any admin in the database.

### Solution

1. **Clear your browser data:**
   - Open browser DevTools (F12)
   - Go to Application → Local Storage
   - Delete all items
   - Or just clear localStorage: `localStorage.clear()`

2. **Login again:**
   - Go to `/admin/login`
   - Enter your credentials
   - This will store the correct admin ID

---

## 🔴 Error: "Cannot delete default questions"

### Problem
Trying to delete "Your Name" or "Your Email" questions.

### Solution

This is intentional! Default questions cannot be deleted. They are required for every survey.

If you really need to remove them:
1. You can make them optional (toggle the required checkbox)
2. Or modify the database directly (not recommended)

---

## 🔴 Default Questions Not Appearing

### Problem
Created an event but Name and Email questions didn't appear automatically.

### Solution

1. **Check if trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_create_default_questions';
   ```

2. **If trigger doesn't exist, create it:**
   ```sql
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

3. **For existing events, add manually:**
   ```sql
   -- Replace 'your-event-id' with actual event ID
   INSERT INTO questions (event_id, question_text, question_type, order_number, is_required, is_default)
   VALUES 
     ('your-event-id', 'Your Name', 'text', 1, true, true),
     ('your-event-id', 'Your Email', 'text', 2, true, true);
   ```

---

## 🔴 Responses Not Grouping

### Problem
Responses showing individually instead of grouped by user.

### Solution

1. **Check if session_id column exists:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'responses' AND column_name = 'session_id';
   ```

2. **If missing, add it:**
   ```sql
   ALTER TABLE responses ADD COLUMN session_id UUID;
   CREATE INDEX idx_responses_session_id ON responses(session_id);
   ```

3. **For existing responses, generate session IDs:**
   ```sql
   UPDATE responses 
   SET session_id = gen_random_uuid() 
   WHERE session_id IS NULL;
   ```

---

## 🔴 Required Toggle Not Working

### Problem
Clicking the required checkbox doesn't update the question.

### Solution

1. **Check if is_required column exists:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'questions' AND column_name = 'is_required';
   ```

2. **If missing, add it:**
   ```sql
   ALTER TABLE questions ADD COLUMN is_required BOOLEAN DEFAULT true;
   ALTER TABLE questions ADD COLUMN is_default BOOLEAN DEFAULT false;
   ```

3. **Update existing questions:**
   ```sql
   UPDATE questions SET is_required = true WHERE is_required IS NULL;
   UPDATE questions SET is_default = false WHERE is_default IS NULL;
   ```

---

## 🔴 Survey Validation Not Working

### Problem
Can submit survey without answering required questions.

### Solution

This is a frontend issue. Make sure you're using the latest `Survey.tsx` file.

Check the validation code:
```typescript
const requiredQuestions = event.questions.filter(q => q.is_required);
const missingAnswers = requiredQuestions.filter(q => !answers[q.id] || answers[q.id].trim() === '');

if (missingAnswers.length > 0) {
  alert(`Please answer all required questions`);
  return;
}
```

---

## 🔴 Excel Export Not Working

### Problem
Excel export button doesn't download file.

### Solution

1. **Check if xlsx library is installed:**
   ```bash
   npm list xlsx
   ```

2. **If not installed:**
   ```bash
   npm install xlsx
   ```

3. **Check browser console for errors**

4. **Try with a simple test:**
   - Create event
   - Add one question
   - Submit one response
   - Try export

---

## 🔴 AI Analysis Failing

### Problem
"Analyze" button doesn't work or shows error.

### Solution

1. **Check Gemini API key in `.env`:**
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

2. **Verify server is running:**
   - Check terminal for errors
   - Server should be on port 3000

3. **Check API endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```

4. **Check Gemini API quota:**
   - Go to https://makersuite.google.com
   - Check if you've exceeded quota

---

## 🔴 Port 3000 Already in Use

### Problem
Can't start server because port is in use.

### Solution

**Windows:**
```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

**Alternative:**
```bash
# Change port in server.ts
const PORT = 3001; # Use different port
```

---

## 🔴 Supabase Connection Failed

### Problem
"Failed to load event" or database connection errors.

### Solution

1. **Check `.env` file:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```

2. **Verify credentials:**
   - Go to Supabase Dashboard
   - Project Settings → API
   - Copy URL and anon key
   - Update `.env`

3. **Restart server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

## 🔴 TypeScript Errors

### Problem
TypeScript compilation errors.

### Solution

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Check TypeScript version:**
   ```bash
   npm list typescript
   ```

3. **Clear cache and rebuild:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

---

## 🔴 Questions Not Saving

### Problem
Added questions but they don't appear after refresh.

### Solution

1. **Check browser console for errors**

2. **Verify question data:**
   ```sql
   SELECT * FROM questions WHERE event_id = 'your-event-id';
   ```

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'questions';
   ```

4. **Try adding question manually:**
   ```sql
   INSERT INTO questions (event_id, question_text, question_type, order_number, is_required, is_default)
   VALUES ('your-event-id', 'Test Question', 'text', 3, true, false);
   ```

---

## 🔴 Public Survey Not Loading

### Problem
Public survey page shows "Survey Not Found".

### Solution

1. **Check if event is published:**
   ```sql
   SELECT id, title, slug, status FROM events WHERE slug = 'your-slug';
   ```

2. **If status is 'draft', publish it:**
   - Go to admin event detail page
   - Click "Publish" button

3. **Check URL format:**
   - Correct: `http://localhost:3000/your-slug`
   - Wrong: `http://localhost:3000/survey/your-slug`

4. **Check RLS policies allow public access:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'events';
   ```

---

## 📞 Still Having Issues?

### Debug Checklist

- [ ] Database schema is up to date
- [ ] Admin account exists in database
- [ ] Logged in with correct credentials
- [ ] `.env` file has correct values
- [ ] Server is running without errors
- [ ] Browser console shows no errors
- [ ] All npm packages installed
- [ ] Using latest code from files

### Get Help

1. **Check browser console** (F12 → Console)
2. **Check server logs** (terminal where `npm run dev` is running)
3. **Check Supabase logs** (Supabase Dashboard → Logs)
4. **Verify database state** (run SQL queries above)

### Common Fixes

```bash
# Nuclear option - fresh start
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

```sql
-- Nuclear option - reset database
-- WARNING: This deletes ALL data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then run migration_guide.sql
```

---

**Remember:** Most issues are solved by:
1. Running the correct schema
2. Having an admin account in the database
3. Logging in with the correct credentials
4. Clearing browser localStorage and logging in again
