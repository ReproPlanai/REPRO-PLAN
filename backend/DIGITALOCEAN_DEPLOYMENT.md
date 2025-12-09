# DigitalOcean Deployment Guide for REPRO PLAN Backend

This guide will help you deploy the complete REPRO PLAN stack to DigitalOcean:
- ✅ PostgreSQL Database (Managed Database)
- ✅ Backend API (App Platform)
- ✅ Frontend (via Netlify)

## Prerequisites

1. A DigitalOcean account ([Sign up here](https://www.digitalocean.com))
2. Git repository with your backend code
3. Basic knowledge of DigitalOcean App Platform

## Pre-deployment: Set up Resend Email Service

1. **Sign up for Resend**:
   - Go to [resend.com](https://resend.com)
   - Create an account and verify your email

2. **Get your API Key**:
   - Go to API Keys section in your Resend dashboard
   - Create a new API key
   - Copy the API key (starts with `re_`)

3. **Verify your domain** (optional but recommended):
   - Go to Domains section
   - Add your domain (e.g., `yourdomain.com`)
   - Follow DNS verification steps
   - Set up SPF, DKIM, and DMARC records

4. **Note your API key** - you'll need it for deployment

## Step 1: Create a Managed PostgreSQL Database

1. Log in to your DigitalOcean dashboard
2. Navigate to **Databases** → **Create Database Cluster**
3. Choose:
   - **Database Engine**: PostgreSQL
   - **Version**: PostgreSQL 15 (or latest)
   - **Datacenter Region**: Choose closest to your users (e.g., New York, Amsterdam)
   - **Plan**: Start with Basic plan ($15/month) - can upgrade later
   - **Database Name**: `defaultdb` (DigitalOcean default)
4. Click **Create Database Cluster**
5. Wait for the database to be created (5-10 minutes)

### Get Database Connection Details

1. Once created, click on your database cluster
2. Go to **Connection Details** tab
3. **Important**: Copy the **Connection String** (it includes SSL parameters)
   - Format: `postgresql://doadmin:password@host:port/defaultdb?sslmode=require`
4. Note the individual details (for reference):
   - **Host**: `your-cluster-host.db.ondigitalocean.com`
   - **Port**: `25060` (usually)
   - **Database**: `defaultdb`
   - **Username**: `doadmin`
   - **Password**: (click "Show" to reveal)

## Step 2: Deploy Backend to DigitalOcean App Platform

### Option A: Deploy via DigitalOcean Dashboard

1. Navigate to **App Platform** → **Create App**
2. Connect your Git repository:
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select your repository
   - Choose the branch (usually `main` or `master`)
3. Configure the app:
   - **Type**: Web Service
   - **Name**: `repro-plan-backend`
   - **Source Directory**: `backend` (important!)
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`
   - **HTTP Port**: `5000`
4. Add Environment Variables:
   - Click **Edit** next to Environment Variables
   - Add the following variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<paste your database connection string from Step 1>
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
JWT_SECRET=<generate a strong random string>
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=noreply@yourdomain.com
```

   - **JWT_SECRET**: Generate using: `openssl rand -base64 32`
5. Connect Database:
   - Click **Add Database** → Select your PostgreSQL database from Step 1
   - DigitalOcean will automatically set `DATABASE_URL` with SSL configuration
   - **Note**: If you prefer manual configuration, you can set `DATABASE_URL` manually
6. Choose a plan:
   - Start with Basic plan ($5/month) - can upgrade later
7. Click **Create Resources**

### Option B: Deploy via Dockerfile (Recommended)

1. Navigate to **App Platform** → **Create App**
2. Connect your Git repository
3. Configure the app:
   - **Type**: Docker
   - **Source Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile` (should be in backend folder)
4. Add Environment Variables (same as Option A)
5. Connect Database (same as Option A)
6. Deploy

## Step 3: Configure Database

### Run Database Migrations

After deployment, you'll need to run database migrations:

1. **Option 1: Via DigitalOcean Console**
   - Go to your app → **Settings** → **Console**
   - Run: `npm run migrate:up`

2. **Option 2: Via Local Connection**
   - Connect to your DigitalOcean database from your local machine
   - Run migrations locally pointing to the remote database

3. **Option 3: Via One-Off Command**
   - In App Platform, create a one-off command component
   - Command: `npm run migrate:up`

### Initialize Database Schema

Run the setup script:
```bash
# Connect to your app console and run:
npm run migrate:up
```

## Step 4: Verify Deployment

1. Check your app URL (provided by DigitalOcean)
2. Visit: `https://your-app-url.ondigitalocean.app/health`
3. You should see:
```json
{
  "status": "ok",
  "message": "REPRO PLAN API v3.0 is running",
  "timestamp": "...",
  "environment": "production"
}
```

## Step 5: Update Frontend Configuration

When you're ready to connect the frontend to the backend:

1. Update frontend environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.ondigitalocean.app
   REACT_APP_USE_MOCK_API=false
   ```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string (auto-set by DigitalOcean) | `postgresql://doadmin:pass@host:port/defaultdb?sslmode=require` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://repro-plan.netlify.app` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `JWT_SECRET` | JWT signing secret | Random 32+ character string |
| `RESEND_API_KEY` | Resend email API key | `re_xxx...` |
| `FROM_EMAIL` | Sender email address | `noreply@yourdomain.com` |

## Database Connection Methods

### Method 1: Connection String (Recommended)
DigitalOcean provides a connection string in the format:
```
postgresql://doadmin:password@host:port/database?sslmode=require
```

Set this as `DATABASE_URL` in your environment variables.

### Method 2: Individual Variables
If you prefer individual variables:
```
DB_HOST=your-db-host.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=your_password
```

## Troubleshooting

### Database Connection Issues

1. **Check SSL Mode**: DigitalOcean databases require SSL
   - Ensure connection string includes `?sslmode=require`
   - Or set `dialectOptions.ssl.require = true` in database config

2. **Check Firewall**: Ensure your app can access the database
   - In database settings, add your app's IP or allow all trusted sources

3. **Check Credentials**: Verify database username and password

### App Not Starting

1. Check logs in DigitalOcean dashboard
2. Verify `PORT` environment variable is set
3. Ensure `npm run build` completes successfully
4. Check that `dist/server.js` exists after build

### Build Failures

1. Ensure all dependencies are in `dependencies` (not `devDependencies`)
2. Check Node.js version matches (18+)
3. Verify TypeScript compiles without errors

## Scaling

### Vertical Scaling (More Resources)
- Go to App Platform → Your App → Settings → Plan
- Upgrade to a larger plan for more CPU/RAM

### Horizontal Scaling (More Instances)
- Go to App Platform → Your App → Settings → Scaling
- Increase instance count

### Database Scaling
- Go to Databases → Your Database → Settings
- Upgrade to a larger plan

## Monitoring

1. **Logs**: View real-time logs in App Platform dashboard
2. **Metrics**: Monitor CPU, memory, and request metrics
3. **Alerts**: Set up alerts for errors or high resource usage

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, random secret (32+ characters)
3. **Database**: Use SSL connections only
4. **CORS**: Restrict to your frontend domain only
5. **Rate Limiting**: Configure appropriate limits
6. **HTTPS**: DigitalOcean provides HTTPS automatically

## Cost Estimation (Complete Stack)

- **DigitalOcean App Platform Basic**: ~$5/month
- **DigitalOcean PostgreSQL Basic**: ~$15/month
- **Netlify (Frontend)**: Free tier available, or ~$9/month for pro features
- **Resend Email**: Free tier (3,000 emails/month)
- **Total**: ~$20/month (minimum)

Costs scale with usage and can be reduced with:
- Smaller database plans for development
- Pausing resources when not in use
- Netlify free tier for basic hosting

## Support

- DigitalOcean Documentation: https://docs.digitalocean.com
- DigitalOcean Community: https://www.digitalocean.com/community
- REPRO PLAN Issues: Contact your development team

## Next Steps

1. ✅ Backend deployed and running
2. ✅ Database connected and migrations run
3. ✅ Email service (Resend) configured
4. ⏳ Test API endpoints
5. ⏳ Connect frontend when ready for production
6. ⏳ Set up monitoring and alerts
7. ⏳ Configure custom domain (optional)

