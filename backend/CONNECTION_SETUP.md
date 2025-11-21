# Database Connection Setup Guide

This guide helps you get the connection information from pgAdmin and set up your `.env` file.

## Step 1: Get Connection Info from pgAdmin

### Option A: Using Query Tool (Recommended)

1. Open pgAdmin
2. Right-click on `reproplan` database → **"Query Tool"**
3. Open the file `backend/check_connection.sql`
4. Copy and paste **Query 1** into the Query Tool
5. Click **"Execute"** (F5)
6. You'll see:
   - **Database Name**: `reproplan`
   - **Database User**: Usually `postgres`
   - **Server IP**: Usually `localhost` or `127.0.0.1`
   - **Server Port**: Usually `5432`

### Option B: Check Server Properties

1. In pgAdmin, right-click on your PostgreSQL server
2. Select **"Properties"**
3. Go to **"Connection"** tab
4. Note down:
   - **Host**: Usually `localhost`
   - **Port**: Usually `5432`
   - **Maintenance database**: Usually `postgres`
   - **Username**: Usually `postgres`

## Step 2: Create Your .env File

1. Navigate to the `backend` folder in your project
2. Copy `env.example.txt` and rename it to `.env`
3. Open `.env` in a text editor

## Step 3: Fill in Your Connection Details

Update your `.env` file with the information from Step 1:

```env
# Application Environment
NODE_ENV=development
PORT=5000

# Database Configuration
# Replace these with your actual values from pgAdmin
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reproplan
DB_USER=postgres
DB_PASSWORD=your_actual_postgresql_password_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_here
```

### Important Notes:

- **DB_HOST**: Use `localhost` for local development
- **DB_PORT**: Usually `5432` (default PostgreSQL port)
- **DB_NAME**: Must be exactly `reproplan` (the database you created)
- **DB_USER**: Usually `postgres` (or your PostgreSQL username)
- **DB_PASSWORD**: Your PostgreSQL password (the one you use to connect in pgAdmin)

## Step 4: Verify Connection Settings

Run these queries in pgAdmin Query Tool to verify:

### Query 1: Check Database Name
```sql
SELECT current_database();
```
Should return: `reproplan`

### Query 2: Check User
```sql
SELECT current_user;
```
Should return: `postgres` (or your username)

### Query 3: Check Port
```sql
SELECT inet_server_port();
```
Should return: `5432` (or your port)

## Step 5: Test Backend Connection

1. Open terminal/command prompt
2. Navigate to backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies (if not done):
   ```bash
   npm install
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
5. You should see:
   ```
   ✅ Database connection established successfully.
   ✅ Database models synchronized.
   🚀 REPRO PLAN API v3.0 server running on port 5000
   ```

## Step 6: Verify Connection in Browser

1. Open browser
2. Go to: `http://localhost:5000/health`
3. You should see:
   ```json
   {
     "status": "ok",
     "message": "REPRO PLAN API v3.0 is running",
     "timestamp": "...",
     "environment": "development"
   }
   ```

## Troubleshooting

### Error: "Connection refused"

**Problem**: Backend can't connect to PostgreSQL

**Solutions**:
1. Check PostgreSQL service is running:
   - Windows: Open Services (Win+R → `services.msc`)
   - Look for "postgresql" service
   - Make sure it's "Running"
2. Verify `DB_HOST` in `.env` is `localhost`
3. Verify `DB_PORT` in `.env` is `5432`

### Error: "Password authentication failed"

**Problem**: Wrong password in `.env` file

**Solutions**:
1. Test password in pgAdmin:
   - Try connecting to PostgreSQL server in pgAdmin
   - If it works there, use the same password in `.env`
2. Update `DB_PASSWORD` in `.env` file
3. If you forgot password, you may need to reset it

### Error: "Database does not exist"

**Problem**: Database name mismatch

**Solutions**:
1. In pgAdmin, verify database name is exactly `reproplan`
2. In `.env`, make sure `DB_NAME=reproplan` (case-sensitive)
3. Create the database if it doesn't exist

### Error: "relation does not exist"

**Problem**: Tables not created

**Solutions**:
1. Run the `setup_database.sql` script in pgAdmin
2. Verify tables exist: Run Query 2 from `check_connection.sql`
3. Make sure you're connected to the `reproplan` database

## Alternative: Using Connection String

Instead of individual variables, you can use a connection string:

```env
# Instead of DB_HOST, DB_PORT, etc., use:
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/reproplan
```

**Format**: `postgresql://username:password@host:port/database`

## Security Notes

⚠️ **Important**:
- Never commit `.env` file to git (it's already in `.gitignore`)
- Never share your `.env` file
- Use strong passwords for production
- Change default PostgreSQL password if still using default

## Quick Reference

Your `.env` file should look like this:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reproplan
DB_USER=postgres
DB_PASSWORD=your_password_here
CORS_ORIGIN=http://localhost:3000
```

Replace `your_password_here` with your actual PostgreSQL password.

