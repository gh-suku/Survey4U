<div align="center">
<img width="1200" height="475" alt="Survey4U Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Survey4U

A lightweight event-based survey platform with AI-powered analysis. Create events, manage questions, collect responses, and export data to Excel or Markdown with Gemini AI insights.

## Features

### Admin Features
- ✅ **Admin Authentication** - Signup/Login with plain password storage
- ✅ **Event Management** - Create, edit, and publish survey events
- ✅ **Question Builder** - Add text, voice, or multiple-choice questions
- ✅ **Bulk Question Upload** - Import questions from Excel files (NEW!)
- ✅ **QR Code Generation** - Share surveys via QR codes
- ✅ **Response Analytics** - View all responses in real-time
- ✅ **Excel Export** - Download responses in row-based format (Name | Email | Q1 | Q2...) (IMPROVED!)
- ✅ **AI Analysis** - Gemini-powered insights and recommendations
- ✅ **Markdown Reports** - Export comprehensive analysis with all questions and responses (IMPROVED!)

### Public Features
- ✅ **Anonymous Access** - No login required for survey takers
- ✅ **Clean URL Structure** - Access via `survey4u.com/{event-slug}`
- ✅ **Multiple Question Types** - Text, voice recording, multiple choice
- ✅ **Progress Tracking** - Visual progress bar during survey
- ✅ **Thank You Page** - Confirmation after submission

## Recent Updates

### 🎉 New Features (Latest)
1. **Bulk Question Upload** - Upload Excel files with multiple questions at once
   - Works when creating new events or adding to existing events
   - Supports all question types (text, voice, multiple-choice)
   - See `EXCEL_UPLOAD_GUIDE.md` for format details

2. **Improved Excel Export** - Better data format for analysis
   - One row per respondent (instead of one row per answer)
   - Format: Name | Email | Q1 | Q2 | Q3... | Submitted At
   - Easier to analyze in spreadsheet applications

3. **Enhanced AI Analysis Reports** - More comprehensive markdown exports
   - Includes complete list of all survey questions
   - Shows all user responses with full details
   - Better organized sections for easier reading

📖 See `FEATURE_UPDATES.md` for detailed information about these updates.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Apple-inspired design)
- **Backend**: Express.js + Supabase PostgreSQL
- **AI**: Google Gemini API
- **Exports**: xlsx (Excel), custom Markdown generator
- **QR Codes**: qrcode.react

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Google Gemini API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Initial Admin (optional)
VITE_INITIAL_ADMIN_EMAIL=admin@example.com
VITE_INITIAL_ADMIN_PASSWORD=your_password
```

### 3. Setup Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema from `supabase/schema.sql`

This will create:
- `admins` table
- `events` table
- `questions` table
- `responses` table
- RLS policies
- Helper functions

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage Guide

### For Admins

1. **Signup/Login**
   - Visit `/admin/signup` to create an admin account
   - Or login at `/admin/login`

2. **Create an Event**
   - Click "Create Event" from dashboard
   - Enter title, description, and URL slug
   - Event is created in "draft" status

3. **Add Questions**
   - Open the event detail page
   - Use the question builder to add:
     - Text questions
     - Voice recording questions
     - Multiple choice questions
   - Questions can be reordered and deleted

4. **Publish Event**
   - Click "Publish" button
   - Event becomes accessible via public URL
   - QR code is generated automatically

5. **View Responses**
   - Responses appear in real-time
   - See responder info and answers
   - Filter and search responses

6. **Export Data**
   - **Excel**: Click "Excel" to download .xlsx file
   - **AI Analysis**: Click "Analyze" to generate insights
   - Markdown report downloads automatically

### For Survey Takers

1. Visit the public URL: `yourdomain.com/{event-slug}`
2. Optionally provide name and email
3. Answer questions one by one
4. Submit and see thank you page

## URL Structure

```
/                           → Landing page (enter survey code)
/{slug}                     → Public survey page
/admin/signup               → Admin registration
/admin/login                → Admin login
/admin/dashboard            → Admin dashboard
/admin/create-event         → Create new event
/admin/events/{id}          → Event detail & management
```

## Database Schema

### admins
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR) - Plain text (upgrade to bcrypt for production)
- `created_at`, `updated_at`

### events
- `id` (UUID, PK)
- `admin_id` (UUID, FK → admins)
- `title` (VARCHAR)
- `description` (TEXT)
- `slug` (VARCHAR, UNIQUE)
- `qr_code_url` (TEXT)
- `status` (VARCHAR: draft/published/closed)
- `created_at`, `updated_at`

### questions
- `id` (UUID, PK)
- `event_id` (UUID, FK → events)
- `question_text` (TEXT)
- `question_type` (VARCHAR: text/voice/multiple-choice)
- `options` (JSONB)
- `order_number` (INT)
- `created_at`

### responses
- `id` (UUID, PK)
- `event_id` (UUID, FK → events)
- `question_id` (UUID, FK → questions)
- `responder_name` (VARCHAR)
- `responder_email` (VARCHAR)
- `answer_text` (TEXT)
- `answer_audio_url` (TEXT)
- `response_type` (VARCHAR: text/voice)
- `created_at`

## API Endpoints

### AI Analysis
- `POST /api/ai/analyze-event` - Analyze event responses with Gemini

### Health Check
- `GET /api/health` - Server health status

## Export Formats

### Excel (.xlsx)
Columns:
- Question
- Response
- Response Type
- Responder Name
- Responder Email
- Timestamp

### Markdown (.md)
Sections:
- Executive Summary
- Key Themes
- Use Cases Identified
- Recommendations
- Methodology

## Security Notes

⚠️ **Important**: This implementation uses plain text password storage for simplicity. For production:

1. Use bcrypt or argon2 for password hashing
2. Implement proper session management (JWT tokens)
3. Add CSRF protection
4. Enable HTTPS
5. Configure Supabase RLS policies properly
6. Add rate limiting
7. Validate all inputs

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables in Vercel
- `GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and anon key
- Check RLS policies are enabled
- Ensure schema is properly created

### AI Analysis Not Working
- Verify Gemini API key is valid
- Check API quota limits
- Review server logs for errors

### QR Code Not Displaying
- Ensure event is published
- Check public URL is accessible
- Verify qrcode.react is installed

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
