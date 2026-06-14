# TrackAI – AI-Powered Job Application Tracker

> A production-ready full-stack SaaS for tracking job applications with integrated AI features.
> Built with React, TypeScript, Node.js, PostgreSQL, Prisma, and Groq AI.

---

## 🗂️ Complete Folder Structure

```
trackai/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database models
│   │   └── seed.ts               # Demo data seeder
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── application.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── application.service.ts
│   │   │   ├── ai.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── logger.middleware.ts
│   │   │   ├── notFound.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── application.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   ├── resume.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── utils/
│   │   │   ├── errors.ts
│   │   │   ├── logger.ts
│   │   │   ├── prisma.ts
│   │   │   └── validators.ts
│   │   └── index.ts              # Express server entry
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── applications/
    │   │   │   ├── ApplicationModal.tsx
    │   │   │   └── StatusBadge.tsx
    │   │   ├── layout/
    │   │   │   └── AppLayout.tsx
    │   │   └── ui/
    │   │       └── Skeleton.tsx
    │   ├── hooks/
    │   │   ├── useApi.ts         # React Query hooks
    │   │   └── useDebounce.ts
    │   ├── lib/
    │   │   └── api.ts            # Axios client + interceptors
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── SignupPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── ApplicationsPage.tsx
    │   │   ├── ApplicationDetailPage.tsx
    │   │   ├── AnalyticsPage.tsx
    │   │   ├── AIToolsPage.tsx
    │   │   └── ProfilePage.tsx
    │   ├── store/
    │   │   └── auth.store.ts     # Zustand auth store
    │   ├── types/
    │   │   └── index.ts          # TypeScript types
    │   ├── utils/
    │   │   └── cn.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── vercel.json
    └── .env.example
```

---

## 🗄️ Database Schema

```
Users
├── id (cuid)
├── email (unique)
├── password (bcrypt hashed)
├── name
├── avatar, bio
├── targetRoles String[]
├── skills String[]
├── linkedinUrl, githubUrl, portfolioUrl
├── plan (FREE | PRO | ENTERPRISE)
└── timestamps

Applications
├── id (cuid)
├── userId → User
├── companyName, role
├── status (APPLIED | OA | INTERVIEW | REJECTED | OFFER)
├── appliedDate, nextActionDate
├── location, jobLink
├── salary, notes
├── contactName, contactEmail
├── source, priority
└── timestamps

Resumes
├── id (cuid)
├── userId → User
├── fileName, fileUrl, fileSize
├── isDefault
├── parsedText, skills String[]
└── timestamps

AIReports
├── id (cuid)
├── userId → User
├── applicationId → Application (optional)
├── resumeId → Resume (optional)
├── type (RESUME_FEEDBACK | JOB_ANALYSIS | MATCH_SCORE | INTERVIEW_QUESTIONS | COVER_LETTER)
├── input Json
├── output Json
├── score Int (optional)
└── createdAt

RefreshTokens
├── id (cuid)
├── userId → User
├── token (unique)
└── expiresAt
```

---

## 🚀 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/v1/auth/signup | Register new user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/logout | Logout |
| GET  | /api/v1/auth/me | Get current user |

### Applications (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/v1/applications | Get all (with filters, pagination) |
| GET | /api/v1/applications/:id | Get single application |
| POST | /api/v1/applications | Create application |
| PUT/PATCH | /api/v1/applications/:id | Update application |
| DELETE | /api/v1/applications/:id | Delete application |
| DELETE | /api/v1/applications/bulk | Bulk delete |

### AI Tools (protected + rate limited)
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/v1/ai/resume/analyze | Analyze resume |
| POST | /api/v1/ai/job/analyze | Analyze job description |
| POST | /api/v1/ai/match-score | Resume ↔ JD match score |
| POST | /api/v1/ai/interview-questions | Generate interview questions |
| POST | /api/v1/ai/cover-letter | Generate cover letter |
| GET  | /api/v1/ai/reports | Get user's AI reports |

### Analytics (protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/v1/analytics/dashboard | Full stats summary |
| GET | /api/v1/analytics/timeline | Daily application timeline |
| GET | /api/v1/analytics/funnel | Conversion funnel |

### Users / Resumes
| Method | Route | Description |
|--------|-------|-------------|
| PATCH | /api/v1/users/profile | Update profile |
| DELETE | /api/v1/users/account | Delete account |
| GET | /api/v1/resumes | List resumes |
| POST | /api/v1/resumes/upload | Upload resume (multipart) |
| DELETE | /api/v1/resumes/:id | Delete resume |

---

## 🔐 Authentication Flow

```
1. User signs up → bcrypt hash password → store in DB
2. Generate JWT access token (15m) + refresh token (7d)
3. Store refresh token in RefreshTokens table
4. Frontend stores accessToken in memory (Zustand), refreshToken in localStorage
5. Every API request: attach Bearer token in Authorization header
6. On 401: axios interceptor auto-calls /auth/refresh
7. New token pair issued → old refresh token deleted (rotation)
8. Logout: delete refresh token from DB
```

---

## 🛠️ Step-by-Step Implementation Plan

### Phase 1 – Backend Foundation (Days 1-2)
```bash
# 1. Initialize project
mkdir trackai-backend && cd trackai-backend
npm init -y
npm install express @prisma/client bcryptjs jsonwebtoken cors helmet ...
npm install -D typescript ts-node-dev prisma @types/...

# 2. Setup Prisma
npx prisma init
# Edit prisma/schema.prisma with all models
npx prisma migrate dev --name init
npx prisma generate

# 3. Create .env from .env.example
cp .env.example .env
# Fill in DATABASE_URL, JWT secrets, GROQ_API_KEY

# 4. Start dev server
npm run dev
```

### Phase 2 – Core API (Days 2-3)
- Implement auth routes (signup, login, refresh, logout)
- Implement application CRUD with full filtering
- Add analytics aggregation queries
- Add error handling middleware

### Phase 3 – AI Integration (Day 3-4)
- Set up Groq SDK
- Build each AI service method
- Add AI rate limiting
- Test with Groq playground first

### Phase 4 – Frontend (Days 4-6)
```bash
npm create vite@latest trackai-frontend -- --template react-ts
cd trackai-frontend
npm install react-router-dom @tanstack/react-query axios zustand
npm install framer-motion react-hook-form @hookform/resolvers zod
npm install recharts react-hot-toast date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Phase 5 – Polish + Deploy (Days 6-7)
- Dark mode
- Mobile responsiveness
- Loading states
- Error boundaries
- Deploy backend to Render
- Deploy frontend to Vercel

---

## 🚀 Production Deployment Guide

### Backend → Render.com

1. Push code to GitHub
2. Create Render account → New Web Service
3. Connect GitHub repo (select `/backend` folder)
4. Configure:
   ```
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npx prisma migrate deploy && node dist/index.js
   ```
5. Add environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<from Render PostgreSQL>
   JWT_SECRET=<generate 64-char random string>
   JWT_REFRESH_SECRET=<generate another 64-char string>
   GROQ_API_KEY=<from console.groq.com>
   CLIENT_URL=<your Vercel frontend URL>
   ```
6. Add Render PostgreSQL database → copy connection string

### Frontend → Vercel.com

1. Push code to GitHub
2. Create Vercel account → Import Project
3. Set root directory to `/frontend`
4. Framework: Vite
5. Add environment variables:
   ```
   VITE_API_URL=https://your-api.onrender.com/api/v1
   ```
6. Deploy → Vercel handles SSL, CDN, edge network

### Database (Render PostgreSQL or Supabase)
```bash
# Supabase (recommended - free tier)
# 1. Create project at supabase.com
# 2. Copy connection string (Transaction mode, port 6543)
# 3. Set as DATABASE_URL in Render

# Run migrations on production
npx prisma migrate deploy

# Optional: Seed demo data
npx ts-node prisma/seed.ts
```

---

## 📝 Resume Bullet Points

Use these on your resume/LinkedIn:

```
• Built TrackAI, a full-stack AI-powered job application SaaS using React,
  TypeScript, Node.js, PostgreSQL, and Prisma ORM with JWT authentication,
  role-based access, and automatic token refresh rotation

• Integrated Groq AI (Llama 3.3 70B) to provide resume scoring, ATS feedback,
  resume–job match scoring, cover letter generation, and dynamic interview
  question generation, each stored as structured AIReport records per user

• Designed RESTful API with Express.js featuring modular controllers, services,
  Zod input validation, Winston logging, and rate limiting; deployed backend
  on Render with PostgreSQL and frontend on Vercel (CDN-distributed)

• Implemented analytics dashboard using Recharts with monthly trend bar charts,
  conversion funnel visualization, and SQL aggregation via Prisma raw queries
  for interview/rejection/offer rate calculations

• Built real-time search and filter with debounced React Query hooks, Zustand
  global auth state with token persistence, Framer Motion page transitions,
  and full mobile-responsive design using Tailwind CSS
```

---

## ⚡ Quick Start (Local Development)

```bash
# Clone and setup
git clone https://github.com/yourusername/trackai
cd trackai

# Backend
cd backend
cp .env.example .env       # Fill in your values
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed            # Load demo data
npm run dev                # http://localhost:5000

# Frontend (new terminal)
cd ../frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173

# Demo login
# Email: demo@trackai.dev
# Password: Demo1234!
```

---

## 🔑 Get Your Groq API Key (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free tier: 30 requests/min)
3. Create API key
4. Add to backend `.env` as `GROQ_API_KEY`

The app uses `llama-3.3-70b-versatile` — Groq's free tier is more than enough for development.

---

## 🧪 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend Framework | React 18 + TypeScript | UI components |
| Routing | React Router v6 | Client-side routing |
| State Management | Zustand | Auth state |
| Server State | TanStack Query v5 | API caching + mutations |
| Forms | React Hook Form + Zod | Validation |
| Styling | Tailwind CSS | Utility-first CSS |
| Animations | Framer Motion | Smooth transitions |
| Charts | Recharts | Analytics visualizations |
| HTTP Client | Axios | API calls + interceptors |
| Backend | Node.js + Express + TypeScript | REST API |
| ORM | Prisma | Type-safe DB access |
| Database | PostgreSQL | Primary database |
| Auth | JWT + bcrypt + refresh tokens | Secure authentication |
| AI | Groq (Llama 3.3 70B) | AI features |
| File Upload | Multer | Resume uploads |
| Logging | Winston + Morgan | Server logging |
| Rate Limiting | express-rate-limit | API protection |
| Deployment | Vercel (FE) + Render (BE) | Production hosting |
