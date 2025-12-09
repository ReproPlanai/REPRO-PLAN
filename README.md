# REPRO PLAN v3.0

**REPRO PLAN** - Anonymous, Inclusive & Scalable SRHR Platform for Youth across Africa

A comprehensive sexual and reproductive health and rights (SRHR) platform designed for youth across Africa. Starting in Ghana, expanding to West Africa, and serving all of Africa. Focus on anonymity, accessibility, and offline functionality.

## 🏗️ Project Structure

This project is organized into two main directories:

```
REPRO PLAN/
├── frontend/          # React TypeScript frontend application
│   ├── src/          # Source code
│   ├── public/       # Public assets
│   ├── build/        # Production build (generated, not committed)
│   └── package.json  # Frontend dependencies
│
└── backend/          # Express.js PostgreSQL API server
    ├── src/          # Source code
    ├── dist/         # Compiled JavaScript (generated)
    └── package.json  # Backend dependencies
```

## 📁 About the Build Folder

The `frontend/build/` folder contains the **compiled production build** of the React application. This is generated automatically when you run `npm run build` in the frontend directory.

**Important Notes:**
- ✅ **Already in `.gitignore`** - The build folder is ignored by git (you don't commit it)
- ✅ **Can be regenerated** - You can delete it and rebuild anytime with `npm run build`
- ✅ **Used for deployment** - Netlify/Railway use this folder to deploy your app
- ⚠️ **Not needed for development** - Only needed when deploying to production

**You can safely delete it** if you want - it will be regenerated on the next build.

## 📦 About node_modules

- **Root `node_modules/`**: Only needed if you have a root `package.json` for workspace management. Since we have separate backend/frontend folders, this can be removed if empty.
- **Frontend `node_modules/`**: Contains React and frontend dependencies (in `.gitignore`)
- **Backend `node_modules/`**: Contains Express and backend dependencies (in `.gitignore`)

## 📝 About .gitignore

The `.gitignore` file **should stay at the root** - this is standard practice. It tells Git which files/folders to ignore across the entire project (both backend and frontend).

## 🚀 Quick Start

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend deployed on Netlify

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

Backend deployed on DigitalOcean App Platform

## 📚 Documentation

- **Frontend**: See `frontend/README.md`
- **Backend**: See `backend/README.md`
- **Accessibility**: See `frontend/ACCESSIBILITY.md`
- **Deployment**: See `frontend/DEPLOYMENT.md`

## 🎨 Brand Guidelines

### Colors
- **Primary Pink**: `#de3673` (RGB: 222, 54, 115)
- **Secondary Blue-Purple**: `#5c67b6` (RGB: 92, 103, 182)
- **Accent Light Lavender**: `#edf0fd` (RGB: 237, 240, 253)

### Typography
- **Primary Font**: Blinker
- **Weights**: Light (200), Regular (300), Semibold (600), Bold (700, 800)

## 🗄️ Database

The backend uses **PostgreSQL** and is configured for **Railway** deployment. Railway automatically provides the `DATABASE_URL` environment variable when you add a PostgreSQL service.

### Local Development
1. Install PostgreSQL
2. Create database: `CREATE DATABASE reproplan;`
3. Update `backend/.env` with credentials

### Railway Deployment
1. Add PostgreSQL service in Railway
2. `DATABASE_URL` is automatically set
3. Backend connects automatically

## 🚂 Railway Deployment

### Backend
1. Connect repository to Railway
2. Add PostgreSQL service
3. Deploy backend from `backend/` directory
4. Railway auto-detects and deploys

### Frontend
- Currently configured for Netlify
- Can be deployed to Railway or any static hosting

## 🔧 Technology Stack

### Frontend
- React 18.2.0
- TypeScript
- Tailwind CSS
- React Router
- PWA Support

### Backend
- Express.js
- TypeScript
- PostgreSQL
- Sequelize ORM
- Railway Ready

## 📝 License

MIT

## 👥 Team

REPRO PLAN Team

