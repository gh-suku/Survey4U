# Survey4U - Quick Reference Card

## 🚀 Quick Commands

```bash
# Install
npm install

# Run Development
npm run dev

# Build for Production
npm run build

# Preview Production Build
npm run preview
```

## 🔗 URLs (Development)

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `http://localhost:3000/` | Landing page | No |
| `http://localhost:3000/:slug` | Public survey | No |
| `http://localhost:3000/admin/signup` | Admin registration | No |
| `http://localhost:3000/admin/login` | Admin login | No |
| `http://localhost:3000/admin/dashboard` | Admin dashboard | Yes |
| `http://localhost:3000/admin/create-event` | Create event | Yes |
| `http://localhost:3000/admin/events/:id` | Event detail | Yes |

## 📋 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `admins` | Admin accounts | id, name, email, password |
| `events` | Survey events | id, admin_id, title, slug, status |
| `questions` | Event questions | id, event_id, question_text, question_type |
| `responses` | Survey responses | id, event_id, question_id, answer_text |

## 🎯 Key Features

### Admin Features
- ✅ Signup/Login
- ✅ Create events
- ✅ Add questions (text/voice/multiple-choice)
- ✅ Publish events
- ✅ Generate QR codes
- ✅ View responses
- ✅ Export to Excel
- ✅ AI analysis
- ✅ Export to Markdown

### Public Features
- ✅ Access via slug
- ✅ Anonymous responses
- ✅ Optional name/email
- ✅ Progress tracking
- ✅ Thank you page

## 🔑 Environment Variables

```env
GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_INITIAL_ADMIN_EMAIL=admin@example.com
VITE_INITIAL_ADMIN_PASSWORD=password123
```

## 📊 Question Types

| Type | Description | Options |
|------|-------------|---------|
| `text` | Text input | None |
| `voice` | Voice recording | None |
| `multiple-choice` | Radio buttons | Array of strings |

## 🎨 Design Tokens

```css
/* Colors */
--color-editorial-bg: #F9F8F6
--color-editorial-text: #121212
--color-editorial-accent: #C2410C
--color-editorial-border: rgba(18, 18, 18, 0.1)

/* Fonts */
--font-serif: "Playfair Display"
--font-sans: "Inter"
--font-mono: "JetBrains Mono"
```

## 🔧 Common Tasks

### Create Admin
1. Go to `/admin/signup`
2. Fill form
3. Auto-login

### Create Event
1. Login to admin
2. Click "Create Event"
3. Fill title, description, slug
4. Click "Create Event"

### Add Questions
1. Open event detail
2. Use question builder
3. Select type
4. Add options (if multiple-choice)
5. Click "Add Question"

### Publish Event
1. Open event detail
2. Click "Publish" button
3. Event goes live

### Export Data
1. Open event detail
2. Click "Excel" for spreadsheet
3. Click "Analyze" for AI + Markdown

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill process: `Stop-Process -Id <PID>` |
| Database error | Check Supabase credentials |
| AI analysis fails | Verify Gemini API key |
| Not authenticated | Clear localStorage, login again |
| QR not showing | Ensure event is published |

## 📦 File Structure

```
Survey4U/
├── src/
│   ├── lib/
│   │   ├── api.ts          # All API functions
│   │   ├── exports.ts      # Excel & Markdown
│   │   └── supabase.ts     # DB client
│   ├── pages/
│   │   ├── AdminSignup.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── CreateEvent.tsx
│   │   ├── EventDetail.tsx
│   │   └── Survey.tsx
│   ├── components/
│   │   └── ProtectedRoute.tsx
│   ├── types.ts
│   └── App.tsx
├── supabase/
│   └── schema.sql
├── server.ts
└── .env
```

## 🔐 Security Notes

⚠️ **Current (Development)**
- Plain text passwords
- localStorage sessions
- Basic RLS

✅ **Production TODO**
- Bcrypt password hashing
- JWT tokens
- CSRF protection
- HTTPS
- Rate limiting

## 📞 Quick Links

- [Setup Guide](./SETUP_GUIDE.md)
- [Full Documentation](./README.md)
- [Transformation Summary](./TRANSFORMATION_SUMMARY.md)
- [Supabase Docs](https://supabase.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)

## 🎯 Testing Checklist

```
[ ] Admin signup
[ ] Admin login
[ ] Create event
[ ] Add text question
[ ] Add multiple-choice question
[ ] Publish event
[ ] View QR code
[ ] Access public survey
[ ] Submit response
[ ] View responses
[ ] Export Excel
[ ] AI analysis
[ ] Export Markdown
```

## 💡 Pro Tips

1. **Slug Format**: Use lowercase, hyphens only (e.g., `customer-feedback`)
2. **Question Order**: Questions are numbered automatically
3. **Multiple Choice**: Add options one by one, press Enter or click "Add"
4. **Responses**: Appear in real-time, no refresh needed
5. **Excel Export**: Includes all response metadata
6. **AI Analysis**: Works best with 5+ responses
7. **QR Codes**: Generated on-the-fly, no storage needed

## 🚀 Deployment Checklist

```
[ ] Push to GitHub
[ ] Create Vercel project
[ ] Add environment variables
[ ] Deploy
[ ] Test production URL
[ ] Update any hardcoded URLs
[ ] Test all features in production
```

---

**Need Help?** Check `SETUP_GUIDE.md` for detailed instructions!
