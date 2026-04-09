# REPRO PLAN v3.0

**Anonymous, Inclusive & Scalable SRHR Platform for Youth across Africa**

A comprehensive sexual and reproductive health and rights (SRHR) platform designed for youth. Focus on anonymity, accessibility, and offline functionality. Built with React PWA frontend and Node.js/Express backend.

## 🎯 Mission

Empowering youth with anonymous access to sexual and reproductive health information and services through technology that works offline and respects privacy.

## 🏗️ Architecture

```
┌───────────────────────────────────────────┐
│          React 18 PWA Frontend            │
│  TypeScript • Tailwind CSS • Workbox PWA  │
│                                           │
│ • Offline Storage    • Service Worker     │
│ • Multi-language     • Accessibility      │
│ • Role Dashboards    • QR Verification    │
└───────────────────────────────────────────┘
                     │
                     │ REST API + WebSocket
                     ▼
┌───────────────────────────────────────────┐
│       Node.js + Express Backend             │
│  TypeScript • PostgreSQL • JWT Auth        │
│                                           │
│ • AI Chat (Gemini)   • Email (Resend)     │
│ • Rate Limiting      • Helmet Security    │
│ • File Uploads       • QR Generation      │
└───────────────────────────────────────────┘
```

## 💻 Technology Stack

### Frontend (React PWA v3.0.0)
- **Framework**: React 18.2.0 + TypeScript 4.9
- **Routing**: React Router DOM 6.8
- **Styling**: Tailwind CSS 3.3 + PostCSS + Autoprefixer
- **State**: React Hooks + LocalForage (offline storage)
- **Icons**: Lucide React
- **Charts**: Recharts 3.2
- **PWA**: Workbox Webpack Plugin 7.0 + Workbox Window 6.5
- **Internationalization**: i18next 23 + react-i18next 13
- **Markdown**: React Markdown 9.0
- **Analytics**: Vercel Analytics 2.0
- **Utilities**: date-fns, uuid, idb

### Backend (Node.js API v1.0.0)
- **Runtime**: Node.js ≥20
- **Framework**: Express 4.21 + TypeScript 5.5
- **Database**: PostgreSQL (pg 8.13)
- **AI Providers**: 
  - Google Gemini (@google/genai ^1.0.0)
  - OpenAI (^4.73.0)
  - Anthropic (^0.32.1)
- **Authentication**: JWT (jsonwebtoken ^9.0.2) + bcryptjs ^3.0.3
- **Email**: Resend ^4.0.0
- **Security**: Helmet ^7.1.0 + express-rate-limit ^7.4.0 + CORS
- **Validation**: Zod ^3.23.8
- **Files**: Multer ^1.4.5-lts.1 + QRCode ^1.5.4
- **Logging**: Pino ^9.4.0 + pino-pretty ^11.3.0
- **Dev**: ts-node-dev ^2.0.0

### Infrastructure
- **Frontend Hosting**: Vercel (Global CDN, SSL, PWA)
- **Backend Hosting**: Railway (Docker deployment)
- **Database**: Railway PostgreSQL
- **Container**: Docker + Node 22 Alpine

## 📱 Core Pages & Features

### Public Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with feature overview, app download, tutorial access |
| Tutorial | `/tutorial` | Interactive onboarding walkthrough |
| Settings | `/settings` | App preferences, accessibility, security settings |
| Portal Login | `/portal-login` | Role-based stakeholder login |
| Secret Code Entry | `/secret-code-entry` | Anonymous user access via secret codes |
| Dashboard Access | `/dashboard-access` | Dashboard selection after authentication |

### User Dashboards (Role-Based)
| Dashboard | Route | Role | Features |
|-----------|-------|------|----------|
| Admin Dashboard | `/admin-dashboard` | ADMIN | User management, system settings, analytics, audit logs |
| Medical Dashboard | `/medical-dashboard` | MEDICAL | Patient records, appointments, health tracking |
| Police Dashboard | `/police-dashboard` | POLICE | Emergency response, case management |
| NGO Dashboard | `/ngo-dashboard` | NGO | Programs, events, impact tracking |
| Safe House Dashboard | `/safehouse-dashboard` | SAFEHOUSE | Resident management, resources |

### Feature Pages
| Page | Route | Features |
|------|-------|----------|
| QR Verification | `/qr-verification` | Generate/scan anonymous QR codes |
| Health Records | `/health-records` | View and manage health data |
| Resources Library | `/resources-library` | SRHR documents, videos, downloads |
| Support Groups | `/support-groups` | Find and join support communities |
| Secure Map | `/secure-map` | Locate safe spaces, clinics |
| Direct Messages | `/direct-messages` | Inter-stakeholder messaging |
| Notifications | `/notifications` | Alert center |
| Audit Logs | `/audit-logs` | Activity tracking (Admin only) |
| Workflow Manager | `/workflow-manager` | Automation workflows |
| Medication Order | `/medication-order` | Pharmacy ordering system |
| Biometric Page | `/biometric` | Health tracking integration |
| Live Tracking | `/live-tracking` | Real-time location sharing |

### Accessibility Pages
| Page | Route | Features |
|------|-------|----------|
| Visual Accessibility | `/visual-accessibility` | High contrast, font size, screen reader |
| Hearing Accessibility | `/hearing-accessibility` | Sign language, captions |
| Cognitive Accessibility | `/cognitive-accessibility` | Simplified UI, reading aids |
| Motor Accessibility | `/motor-accessibility` | Large touch targets, voice control |
| Sign Language | `/sign-language` | GSL (Ghana Sign Language) guide |

### Games & Education
| Page/Component | Features |
|----------------|----------|
| Games Hub | `/games` |
| AIGamesPlatform | AI-powered educational games |
| AccessibleQuizGame | Inclusive quiz with screen reader support |
| ConsentScenarioGame | Consent education scenarios |
| KnowledgeRace | Competitive quiz game |
| SRHRMythBuster | Myth-busting quiz |
| DailyChallenge | Daily SRHR challenges |
| Storytelling | User stories sharing |

### Supporting Components
- **Emergency**: Emergency panel, panic button, safety check manager
- **Chatbot**: ReproBot AI chat interface (offline + online)
- **Clinics**: Clinic finder with map integration
- **Mentorship**: Mentorship system matching
- **Tracker**: Health tracker with ReproBot AI panel
- **Videos**: Video library with offline support

## 🔐 Authentication Flows

### Anonymous User Flow
1. **Home** → Click "Get Started"
2. **Tutorial** (optional) → Learn app features
3. **Secret Code Entry** → Enter anonymous code or generate new
4. **Dashboard Access** → Access appropriate role dashboard

### Stakeholder Login Flow
1. **Portal Login** → Select role (Admin/Police/Medical/NGO/SafeHouse)
2. **Credentials** → Enter username/password
3. **JWT Token** → Stored in localStorage
4. **Role Dashboard** → Redirect to appropriate dashboard

### QR Code Verification
1. **User** generates time-limited QR code at `/qr-verification`
2. **Stakeholder** scans using QR scanner in their dashboard
3. **Anonymous Verification** → Confirms access without revealing identity
4. **Audit Trail** → Logged for compliance

## 🎨 Design System

### Colors
- Primary: Indigo/Purple gradient (`#4F46E5` → `#7C3AED`)
- Success: Green (`#10B981`)
- Warning: Yellow (`#F59E0B`)
- Error: Red (`#EF4444`)
- Background: Gray 50 (`#F9FAFB`)

### Typography
- Font: System default (responsive)
- Sizes: Mobile-first (xs: 12px, sm: 14px, base: 16px, lg: 18px, xl: 20px)

### Accessibility
- WCAG 2.1 AA compliant
- Screen reader support
- Keyboard navigation
- High contrast mode
- Reduced motion support
- Font size adjustment (normal, large, extra-large, huge)

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

Required env vars in Vercel:
- `REACT_APP_API_URL` - Railway backend URL
- `REACT_APP_ENVIRONMENT=production`
- `REACT_APP_ENABLE_AI=true`
- `REACT_APP_ENABLE_PWA=true`

### Backend (Railway)
```bash
cd backend
# Railway auto-deploys on git push
```

Required env vars in Railway:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - 32+ char random string
- `SESSION_SECRET` - 32+ char random string
- `GEMINI_API_KEY` - Google Gemini API
- `RESEND_API_KEY` - Email service
- `FRONTEND_URL` - Vercel frontend URL
- `CORS_ORIGINS` - Allowed origins

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm start
```

## 📂 Project Structure

```
REPRO-Plan/
├── frontend/                 # React PWA
│   ├── public/              # Static assets, manifest
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Accessibility/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Emergency/
│   │   │   ├── Games/
│   │   │   ├── Layout/
│   │   │   ├── QRCode/
│   │   │   ├── Settings/
│   │   │   └── ...
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utilities
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── config/          # DB, env config
│   │   ├── middleware/      # Auth, rate limiting
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── ai/          # AI providers
│   │   │   └── email/
│   │   └── index.ts         # Entry point
│   ├── Dockerfile
│   ├── railway.json
│   └── package.json
│
├── README.md
├── .gitignore
└── TECH_STACK.md
```

## 📄 License

MIT License - REPRO PLAN Team

---

**REPRO PLAN v3.0** - Built for youth sexual and reproductive health across Africa.

