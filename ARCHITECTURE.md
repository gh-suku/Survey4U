# Survey4U - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SURVEY4U                              │
│                   Event Survey Platform                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────┐                           ┌───────────────┐
│  PUBLIC SIDE  │                           │  ADMIN SIDE   │
│  (No Auth)    │                           │  (Auth Req)   │
└───────────────┘                           └───────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌───────────────┐                           ┌───────────────┐
│   Landing     │                           │    Signup     │
│   /:slug      │                           │    Login      │
│   Survey      │                           │   Dashboard   │
│   Thank You   │                           │ Create Event  │
└───────────────┘                           │ Event Detail  │
                                            └───────────────┘
                                                    │
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │   Features    │
                                            ├───────────────┤
                                            │ • Questions   │
                                            │ • Responses   │
                                            │ • QR Codes    │
                                            │ • Excel       │
                                            │ • AI Analysis │
                                            │ • Markdown    │
                                            └───────────────┘
```

## 🗄️ Database Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      SUPABASE POSTGRESQL                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│    admins    │      │    events    │     │  questions   │
├──────────────┤      ├──────────────┤     ├──────────────┤
│ id (PK)      │◄─────│ admin_id(FK) │◄────│ event_id(FK) │
│ name         │      │ title        │     │ question_text│
│ email        │      │ description  │     │ question_type│
│ password     │      │ slug (UNIQUE)│     │ options      │
│ created_at   │      │ status       │     │ order_number │
└──────────────┘      │ qr_code_url  │     └──────────────┘
                      └──────────────┘             │
                              │                    │
                              │                    │
                              └────────┬───────────┘
                                       │
                                       ▼
                              ┌──────────────┐
                              │  responses   │
                              ├──────────────┤
                              │ id (PK)      │
                              │ event_id(FK) │
                              │ question_id  │
                              │ answer_text  │
                              │ answer_audio │
                              │ responder_*  │
                              └──────────────┘
```

## 🔄 Data Flow Diagrams

### Admin Flow: Create & Publish Event

```
┌─────────┐
│  Admin  │
└────┬────┘
     │
     │ 1. Signup/Login
     ▼
┌─────────────────┐
│  Authentication │
│  (localStorage) │
└────┬────────────┘
     │
     │ 2. Create Event
     ▼
┌─────────────────┐
│  events table   │
│  status: draft  │
└────┬────────────┘
     │
     │ 3. Add Questions
     ▼
┌─────────────────┐
│ questions table │
│  (text/voice/   │
│  multi-choice)  │
└────┬────────────┘
     │
     │ 4. Publish
     ▼
┌─────────────────┐
│  events table   │
│ status:published│
└────┬────────────┘
     │
     │ 5. Generate QR
     ▼
┌─────────────────┐
│   QR Code API   │
│  (qrcode.react) │
└─────────────────┘
```

### Public Flow: Take Survey

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Scan QR / Visit URL
     ▼
┌─────────────────┐
│  /:slug route   │
└────┬────────────┘
     │
     │ 2. Fetch Event
     ▼
┌─────────────────┐
│  Supabase RPC   │
│ get_event_by_   │
│     slug()      │
└────┬────────────┘
     │
     │ 3. Display Questions
     ▼
┌─────────────────┐
│  Survey Form    │
│  (Progressive)  │
└────┬────────────┘
     │
     │ 4. Submit Answers
     ▼
┌─────────────────┐
│ responses table │
│  (one per Q)    │
└────┬────────────┘
     │
     │ 5. Confirmation
     ▼
┌─────────────────┐
│  Thank You Page │
└─────────────────┘
```

### Export Flow: Excel & Markdown

```
┌─────────┐
│  Admin  │
└────┬────┘
     │
     │ 1. View Responses
     ▼
┌─────────────────┐
│  Event Detail   │
│     Page        │
└────┬────────────┘
     │
     ├─────────────────┬─────────────────┐
     │                 │                 │
     │ 2a. Excel       │ 2b. Analyze     │
     ▼                 ▼                 │
┌──────────┐    ┌──────────────┐        │
│   xlsx   │    │  Gemini API  │        │
│ library  │    │  /api/ai/    │        │
│          │    │  analyze-    │        │
│          │    │  event       │        │
└────┬─────┘    └──────┬───────┘        │
     │                 │                │
     │ 3a. Download    │ 3b. Generate   │
     ▼                 ▼                │
┌──────────┐    ┌──────────────┐        │
│ .xlsx    │    │  Analysis    │        │
│  file    │    │   Result     │        │
└──────────┘    └──────┬───────┘        │
                       │                │
                       │ 4. Export      │
                       ▼                │
                ┌──────────────┐        │
                │  Markdown    │        │
                │  Generator   │        │
                └──────┬───────┘        │
                       │                │
                       │ 5. Download    │
                       ▼                │
                ┌──────────────┐        │
                │   .md file   │        │
                └──────────────┘        │
                                        │
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                        │
└─────────────────────────────────────────────────────────┘

SIGNUP:
┌──────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Form │───▶│ Validate │───▶│ Supabase │───▶│localStorage│
└──────┘    └──────────┘    │  INSERT  │    │  adminId  │
                             └──────────┘    └──────────┘

LOGIN:
┌──────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Form │───▶│ Validate │───▶│ Supabase │───▶│localStorage│
└──────┘    └──────────┘    │  SELECT  │    │  session  │
                             └──────────┘    └──────────┘

PROTECTED ROUTE:
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Route   │───▶│  Check   │───▶│ Redirect │
│ Request  │    │localStorage│   │ or Allow │
└──────────┘    └──────────┘    └──────────┘
```

## 🎨 Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                           │
│                    (BrowserRouter)                       │
└─────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────┐                           ┌───────────────┐
│ PUBLIC ROUTES │                           │ ADMIN ROUTES  │
├───────────────┤                           ├───────────────┤
│ Landing       │                           │ AdminSignup   │
│ Survey        │                           │ AdminLogin    │
└───────────────┘                           │ AdminDashboard│
                                            │ CreateEvent   │
                                            │ EventDetail   │
                                            └───────────────┘
                                                    │
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │ProtectedRoute │
                                            │  (HOC Guard)  │
                                            └───────────────┘
```

## 📦 Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
├─────────────────────────────────────────────────────────┤
│ React 19                                                 │
│ React Router DOM                                         │
│ TypeScript                                               │
│ Tailwind CSS                                             │
│ Lucide React (icons)                                     │
│ Motion (animations)                                      │
│ QRCode.react                                             │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                             │
├─────────────────────────────────────────────────────────┤
│ Express.js                                               │
│ Vite (dev server)                                        │
│ TSX (TypeScript execution)                               │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                     │
├─────────────────────────────────────────────────────────┤
│ Supabase (PostgreSQL + Auth)                            │
│ Google Gemini API (AI Analysis)                          │
│ XLSX (Excel generation)                                  │
└─────────────────────────────────────────────────────────┘
```

## 🔄 State Management

```
┌─────────────────────────────────────────────────────────┐
│                    STATE LAYERS                          │
└─────────────────────────────────────────────────────────┘

GLOBAL STATE (localStorage):
┌──────────────────────────────────────┐
│ • adminId                             │
│ • adminEmail                          │
│ • adminName                           │
└──────────────────────────────────────┘

COMPONENT STATE (useState):
┌──────────────────────────────────────┐
│ • events[]                            │
│ • questions[]                         │
│ • responses[]                         │
│ • form data                           │
│ • loading states                      │
│ • error messages                      │
└──────────────────────────────────────┘

SERVER STATE (Supabase):
┌──────────────────────────────────────┐
│ • admins table                        │
│ • events table                        │
│ • questions table                     │
│ • responses table                     │
└──────────────────────────────────────┘
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      PRODUCTION                          │
└─────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────┐                           ┌───────────────┐
│    VERCEL     │                           │   SUPABASE    │
│  (Frontend +  │◄─────────────────────────▶│  (Database)   │
│   Backend)    │      API Calls            │               │
└───────┬───────┘                           └───────────────┘
        │
        │
        ▼
┌───────────────┐
│  GEMINI API   │
│  (Analysis)   │
└───────────────┘
```

## 📊 Request Flow

### Public Survey Request
```
User Browser
     │
     │ GET /:slug
     ▼
Vite Dev Server / Vercel
     │
     │ React Router
     ▼
Survey Component
     │
     │ getEventBySlug()
     ▼
Supabase Client
     │
     │ SQL Query
     ▼
PostgreSQL Database
     │
     │ Return event + questions
     ▼
Survey Component
     │
     │ Render form
     ▼
User Browser
```

### Admin Export Request
```
Admin Browser
     │
     │ Click "Analyze"
     ▼
EventDetail Component
     │
     │ POST /api/ai/analyze-event
     ▼
Express Server
     │
     │ Gemini API call
     ▼
Google Gemini
     │
     │ Return analysis JSON
     ▼
Express Server
     │
     │ Return to client
     ▼
EventDetail Component
     │
     │ exportToMarkdown()
     ▼
Browser Download
```

## 🔒 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
└─────────────────────────────────────────────────────────┘

LAYER 1: Frontend Auth Guard
┌──────────────────────────────────────┐
│ ProtectedRoute component             │
│ • Checks localStorage                │
│ • Redirects if not authenticated     │
└──────────────────────────────────────┘

LAYER 2: Supabase RLS
┌──────────────────────────────────────┐
│ Row Level Security Policies          │
│ • Admins can CRUD their events       │
│ • Public can READ published events   │
│ • Public can INSERT responses        │
└──────────────────────────────────────┘

LAYER 3: API Validation
┌──────────────────────────────────────┐
│ Server-side checks                   │
│ • Validate admin session             │
│ • Validate input data                │
│ • Rate limiting (TODO)               │
└──────────────────────────────────────┘
```

## 📈 Scalability Considerations

```
CURRENT ARCHITECTURE:
┌──────────────────────────────────────┐
│ Single Supabase instance             │
│ Serverless functions (Vercel)        │
│ Client-side rendering                │
└──────────────────────────────────────┘

SCALING OPTIONS:
┌──────────────────────────────────────┐
│ • Supabase connection pooling        │
│ • CDN for static assets              │
│ • Redis for session management       │
│ • Database read replicas             │
│ • Separate API server                │
└──────────────────────────────────────┘
```

---

This architecture provides a clear separation of concerns, scalable structure, and maintainable codebase for the Survey4U platform.
