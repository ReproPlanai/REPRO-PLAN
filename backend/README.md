# REPRO PLAN Backend API v3.0

Backend API server for REPRO PLAN built with Express.js, TypeScript, and PostgreSQL.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Robust relational database
- **Sequelize ORM** - Database abstraction layer
- **TypeScript** - Type-safe development
- **Railway Ready** - Pre-configured for Railway deployment
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Error Handling** - Centralized error management

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/reproplan
```

## 🗄️ Database Setup

### Local Development

1. Create PostgreSQL database:
```sql
CREATE DATABASE reproplan;
```

2. Update `.env` with your local database credentials

3. Run migrations (if using):
```bash
npm run migrate:up
```

4. Seed database (optional):
```bash
npm run seed
```

### Railway PostgreSQL

Railway automatically provides a `DATABASE_URL` environment variable when you add a PostgreSQL service. The backend is configured to use this automatically.

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in `.env`).

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/register - Create new user with secret code
POST /api/auth/login - Login with secret code
```

### Users
```
GET /api/users/:id - Get user profile
PUT /api/users/:id - Update user profile
```

### Health Records
```
GET /api/health/records/:userId - Get user health records
POST /api/health/records - Create health record
```

### Clinics
```
GET /api/clinics - Get all clinics
GET /api/clinics/:id - Get clinic by ID
```

## 🚂 Railway Deployment

1. **Connect Repository**: Link your GitHub repository to Railway

2. **Add PostgreSQL Service**: 
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically provide `DATABASE_URL`

3. **Deploy Backend**:
   - Click "New" → "GitHub Repo" → Select your repo
   - Set root directory to `backend`
   - Railway will detect `package.json` and deploy automatically

4. **Environment Variables**:
   - Railway automatically sets `DATABASE_URL` from PostgreSQL service
   - Add other variables in Railway dashboard:
     - `NODE_ENV=production`
     - `JWT_SECRET=your-secret-key`
     - `CORS_ORIGIN=https://your-frontend-domain.com`

5. **Deploy**: Railway will automatically build and deploy on push

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (Railway provides this) | Yes |
| `PORT` | Server port (Railway provides this) | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `CORS_ORIGIN` | Allowed CORS origin | Yes |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | No |

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.ts  # Database connection
│   ├── models/          # Sequelize models
│   │   └── index.ts     # User, HealthRecord models
│   ├── routes/          # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── health.routes.ts
│   │   └── clinic.routes.ts
│   ├── middleware/      # Express middleware
│   │   └── errorHandler.ts
│   └── server.ts        # Main server file
├── dist/                # Compiled JavaScript (generated)
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
├── railway.json         # Railway configuration
└── railway.toml         # Railway configuration (alternative)
```

## 🔐 Security Features

- **Helmet** - Sets various HTTP headers for security
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Prevents API abuse
- **Input Validation** - Express-validator for request validation
- **Environment Variables** - Sensitive data in environment variables

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate:up` - Run database migrations
- `npm run migrate:down` - Rollback migrations
- `npm run seed` - Seed database with sample data

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists
- Check firewall settings

### Railway Deployment Issues
- Verify `DATABASE_URL` is set automatically
- Check build logs in Railway dashboard
- Ensure `package.json` has correct start script
- Verify Node.js version compatibility

## 📄 License

MIT

