# Survey4U - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Supabase

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose a name and password

2. **Run Database Schema**
   - In Supabase dashboard, go to "SQL Editor"
   - Click "New Query"
   - Copy and paste the entire contents of `supabase/schema.sql`
   - Click "Run"
   - Wait for success message

3. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy:
     - Project URL (looks like: `https://xxxxx.supabase.co`)
     - Anon/Public Key (starts with `eyJ...`)

### Step 3: Setup Gemini AI

1. **Get API Key**
   - Go to https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

### Step 4: Configure Environment

1. **Copy the example file**
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` file** with your credentials:
   ```env
   GEMINI_API_KEY=AIzaSy...your_key_here
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your_key_here
   VITE_INITIAL_ADMIN_EMAIL=admin@example.com
   VITE_INITIAL_ADMIN_PASSWORD=admin123
   ```

### Step 5: Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

## 📝 First Time Usage

### Create Your Admin Account

1. Go to http://localhost:3000/admin/signup
2. Fill in:
   - Name: Your Name
   - Email: admin@example.com
   - Password: admin123 (or your choice)
3. Click "Create Admin Account"
4. You'll be auto-logged in

### Create Your First Event

1. Click "Create Event" button
2. Fill in:
   - **Title**: "Customer Feedback Survey"
   - **Description**: "Help us improve our service"
   - **Slug**: Auto-generated (e.g., "customer-feedback-survey")
3. Click "Create Event"

### Add Questions

1. In the event detail page, use the "Add Question" form
2. Example questions:
   - **Text**: "What do you like most about our product?"
   - **Multiple Choice**: "How satisfied are you?" (Add options: Very Satisfied, Satisfied, Neutral, Dissatisfied)
   - **Voice**: "Tell us about your experience"
3. Click "Add Question" for each

### Publish Your Event

1. Click the "Publish" button
2. Your event is now live!
3. Click "QR Code" to see the QR code
4. Click "View Public" to test the survey

### Test the Public Survey

1. Open the public URL (e.g., http://localhost:3000/customer-feedback-survey)
2. Fill in your name and email (optional)
3. Answer the questions
4. Submit
5. See the thank you page

### View Responses

1. Go back to the event detail page
2. See responses appear in real-time
3. Click "Excel" to download responses
4. Click "Analyze" to get AI insights and download Markdown report

## 🗂️ Project Structure

```
Survey4U/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.tsx      # Auth guard
│   ├── lib/
│   │   ├── api.ts                  # All API functions
│   │   ├── exports.ts              # Excel & Markdown exports
│   │   └── supabase.ts             # Supabase client
│   ├── pages/
│   │   ├── Landing.tsx             # Home page
│   │   ├── Survey.tsx              # Public survey
│   │   ├── AdminSignup.tsx         # Admin registration
│   │   ├── AdminLogin.tsx          # Admin login
│   │   ├── AdminDashboard.tsx      # Admin dashboard
│   │   ├── CreateEvent.tsx         # Create event form
│   │   └── EventDetail.tsx         # Event management
│   ├── types.ts                    # TypeScript types
│   ├── App.tsx                     # Routes
│   └── main.tsx                    # Entry point
├── supabase/
│   └── schema.sql                  # Database schema
├── server.ts                       # Express server
└── .env                            # Environment variables
```

## 🔧 Common Issues & Solutions

### Issue: "Failed to load event"
**Solution**: 
- Check Supabase credentials in `.env`
- Verify database schema is created
- Check browser console for errors

### Issue: "AI Analysis failed"
**Solution**:
- Verify Gemini API key is correct
- Check you haven't exceeded API quota
- Ensure you have responses to analyze

### Issue: "Not authenticated"
**Solution**:
- Clear browser localStorage
- Login again
- Check admin exists in database

### Issue: QR Code not showing
**Solution**:
- Ensure event is published (not draft)
- Check `qrcode.react` is installed
- Refresh the page

## 📊 Database Verification

To verify your database is set up correctly:

1. Go to Supabase → Table Editor
2. You should see 4 tables:
   - `admins`
   - `events`
   - `questions`
   - `responses`

3. Check the `admins` table has at least one row (your admin account)

## 🎯 Testing Checklist

- [ ] Admin can signup
- [ ] Admin can login
- [ ] Admin can create event
- [ ] Admin can add questions (text, voice, multiple-choice)
- [ ] Admin can publish event
- [ ] QR code displays correctly
- [ ] Public can access survey via slug
- [ ] Public can submit responses
- [ ] Responses appear in admin panel
- [ ] Excel export works
- [ ] AI analysis works
- [ ] Markdown export works

## 🚢 Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `GEMINI_API_KEY`
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Update Public URLs**
   - After deployment, update any hardcoded URLs
   - Test the production deployment

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs (terminal where `npm run dev` is running)
3. Verify all environment variables are set correctly
4. Ensure database schema is created properly
5. Open a GitHub issue with error details

## 🎉 You're All Set!

Your Survey4U platform is now ready to use. Create events, collect responses, and analyze data with AI!
