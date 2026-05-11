# Testing Guide - Survey4U Fixes

## Quick Test Steps

### 1. Start the Application
```bash
npm run dev
```

### 2. Test Admin Login & Event Persistence

#### Step 1: Login as Admin
1. Navigate to `http://localhost:5000/admin/login`
2. Login with credentials:
   - Email: `sudhaanshuu@gmail.com`
   - Password: `418667`
3. You should be redirected to `/admin/dashboard`

#### Step 2: Create a Test Event
1. Click "Create Event" button
2. Fill in:
   - Title: "Test Event May 2026"
   - Description: "Testing event persistence"
3. Add a custom question (optional)
4. Publish the event
5. Note the event slug (e.g., `test-event-may-2026`)

#### Step 3: Test Persistence
1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Verify these keys exist:
   - `adminId`
   - `adminEmail`
   - `adminName`
4. Close the browser completely
5. Reopen and navigate to `http://localhost:5000/admin/login`
6. Login again with the same credentials
7. **VERIFY:** You should see "Test Event May 2026" in your dashboard

### 3. Test Survey Submission (UUID Fix)

#### Step 1: Access Public Survey
1. From admin dashboard, copy the event slug
2. Navigate to `http://localhost:5000/test-event-may-2026` (use your actual slug)
3. You should see the survey form

#### Step 2: Fill Out Survey
1. Fill in "Your Name": `John Doe`
2. Fill in "Your Email": `john@example.com`
3. Fill in any custom questions you added
4. Click "Submit Survey"

#### Step 3: Verify Submission
1. **VERIFY:** You should see "Thank You!" success message
2. **VERIFY:** No console errors about UUID
3. Go back to admin dashboard
4. Click on the event
5. Navigate to "Responses" tab
6. **VERIFY:** You should see John Doe's response

### 4. Check Browser Console

Open DevTools Console (F12) and verify:
- ✅ No errors about "invalid input syntax for type uuid"
- ✅ No authentication errors
- ✅ No 400 Bad Request errors on survey submission

## Expected Results

### ✅ Success Indicators:
- Admin can login and see dashboard
- Events persist after re-login
- Survey submissions work without UUID errors
- Responses appear in admin dashboard
- No console errors

### ❌ If Issues Persist:

#### Issue: "Still can't see events after re-login"
**Check:**
1. Open DevTools → Application → Local Storage
2. Verify `adminId` matches the ID in database
3. Check Network tab for `/events` API call
4. Verify the response contains your events

**Debug Query:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM events WHERE admin_id = '00000000-0000-0000-0000-000000000001';
```

#### Issue: "Survey submission still fails"
**Check:**
1. Open DevTools → Console
2. Look for the exact error message
3. Check Network tab for the failed request
4. Verify the `session_id` in the request payload is a valid UUID format

**Valid UUID format:** `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
**Invalid format:** `1778504153441-68e6tpj29`

## Database Verification

If you want to verify the fixes at database level:

```sql
-- Check if responses are being saved with proper UUIDs
SELECT 
  session_id,
  responder_name,
  responder_email,
  created_at
FROM responses
ORDER BY created_at DESC
LIMIT 10;

-- Check admin's events
SELECT 
  id,
  title,
  slug,
  status,
  admin_id
FROM events
WHERE admin_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC;
```

## Need Help?

If issues persist, provide:
1. Browser console errors (screenshot or copy)
2. Network tab showing failed requests
3. localStorage contents (DevTools → Application → Local Storage)
