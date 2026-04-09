# REPRO PLAN - Fortune 500 Grade Deployment Guide

## 🚀 Quick Deploy (Same Repo → Railway + Vercel)

This repository is configured for **dual-platform deployment** from a single monorepo:
- **Backend** → Railway (Node.js + PostgreSQL)
- **Frontend** → Vercel (React SPA)

---

## 📋 Prerequisites

1. **Railway Account**: https://railway.app
2. **Vercel Account**: https://vercel.com
3. **GitHub/GitLab**: Repo connected to both platforms
4. **Required API Keys**:
   - Google Gemini API Key (AI features)
   - Resend API Key (email notifications)

---

## 🛤️ Step 1: Deploy Backend to Railway

### Option A: Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project (one time only)
cd backend
railway init --name repro-plan-server

# Add PostgreSQL database
railway add --database postgres

# Deploy
railway up

# Get production URL
railway domain
```

### Option B: Railway Dashboard

1. Go to https://railway.app/new
2. Select **Deploy from GitHub repo**
3. Choose your repo
4. Set **Root Directory**: `backend`
5. Add **PostgreSQL** service
6. Deploy!

### Environment Variables (Railway)

Set these in Railway Dashboard → Variables:

```
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-app.vercel.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=(generate-random-64-char-string)
GEMINI_API_KEY=your-gemini-api-key
RESEND_API_KEY=your-resend-api-key
```

---

## ▲ Step 2: Deploy Frontend to Vercel

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from frontend directory)
cd frontend
vercel --prod
```

### Option B: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Set **Root Directory**: `frontend`
4. Framework: **Create React App**
5. Deploy!

### Environment Variables (Vercel)

Set in Vercel Dashboard → Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-railway-app.up.railway.app
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

---

## 🔒 Fortune 500 Security Features

### Backend Security (Railway)
- ✅ Helmet.js security headers
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ JWT authentication
- ✅ Input validation (Zod)
- ✅ SQL injection protection (parameterized queries)
- ✅ Request logging & audit trails

### Frontend Security (Vercel)
- ✅ CSP (Content Security Policy)
- ✅ X-Frame-Options: DENY
- ✅ HSTS (HTTPS Strict Transport)
- ✅ XSS Protection
- ✅ Referrer Policy
- ✅ Permissions Policy

---

## 🔗 Connect Frontend ↔ Backend

After both are deployed:

1. Copy Railway backend URL (e.g., `https://repro-plan-server.up.railway.app`)
2. Add to Vercel environment variables:
   ```
   REACT_APP_API_URL=https://your-railway-app.up.railway.app
   ```
3. Redeploy frontend: `vercel --prod`
4. Add CORS origin to Railway:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

---

## 📁 Project Structure

```
repro-plan/
├── backend/                 # Railway backend
│   ├── src/
│   ├── dist/               # Compiled output
│   ├── railway.json        # Railway config
│   ├── package.json
│   └── .env.example
├── frontend/               # Vercel frontend
│   ├── src/
│   ├── build/              # Production build
│   ├── vercel.json         # Vercel config
│   ├── package.json
│   └── .env.example
├── package.json            # Root monorepo scripts
└── DEPLOY.md              # This file
```

---

## 🧪 Local Development

```bash
# Install dependencies
npm run install:all

# Start both servers
npm run dev

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

---

## 🔄 Continuous Deployment

### Automatic Deploys
- **Railway**: Deploys on every push to `main` branch (backend changes)
- **Vercel**: Deploys on every push to `main` branch (frontend changes)

### Manual Deploys
```bash
# Deploy backend
npm run deploy:backend

# Deploy frontend
npm run deploy:frontend

# Deploy both
npm run deploy
```

---

## 📊 Health Checks & Monitoring

### Backend Health Check
```bash
curl https://your-railway-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-28T...",
  "database": "connected",
  "version": "1.0.0"
}
```

### Vercel Analytics
- Go to Vercel Dashboard → Analytics
- View real-time traffic, performance, errors

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check `DATABASE_URL` is set correctly
- Verify `PORT` is not already in use
- Check Railway logs: `railway logs`

### Frontend API Errors
- Verify `REACT_APP_API_URL` matches Railway URL
- Check CORS origins in backend match Vercel domain
- Check browser console for errors

### Database Connection Failed
- Ensure PostgreSQL service is provisioned in Railway
- Check `DATABASE_URL` format: `postgres://user:pass@host:port/db`
- Try restarting Railway service

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ Deployment Checklist

- [ ] Railway backend deployed and running
- [ ] PostgreSQL database connected
- [ ] Vercel frontend deployed
- [ ] Environment variables configured on both platforms
- [ ] Frontend URL added to backend CORS origins
- [ ] Backend URL added to frontend `REACT_APP_API_URL`
- [ ] Health check endpoint responding
- [ ] Test user registration/login flow
- [ ] Test AI features (ReproBot)
- [ ] Test email notifications

---

**🎉 You're now Fortune 500 grade deployed!**
