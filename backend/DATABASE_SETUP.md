# PostgreSQL Database Setup Guide for REPRO PLAN v3.0

This guide will walk you through setting up the PostgreSQL database in pgAdmin and connecting it to the REPRO PLAN backend.

## Prerequisites

Before starting, make sure you have:
- PostgreSQL installed on your computer (download from https://www.postgresql.org/download/)
- pgAdmin 4 installed (download from https://www.pgadmin.org/)
- Backend folder ready with all files

---

## PART 1: Setting Up pgAdmin

### Step 1: Open pgAdmin 4

1. Launch **pgAdmin 4** from your applications or Start menu
2. You'll see the pgAdmin interface with a left sidebar showing "Servers"
3. When you first open pgAdmin, you may be asked to set a master password - this is for pgAdmin itself, not PostgreSQL

### Step 2: Connect to Your PostgreSQL Server

1. In the left sidebar, find **"Servers"** and click the arrow to expand it
2. If you see your PostgreSQL server listed (usually named "PostgreSQL 14" or similar), click on it
3. If you don't see a server, you need to add one:
   - Right-click on **"Servers"**
   - Select **"Create"** → **"Server..."**
   - In the **"General"** tab:
     - **Name**: Enter a name like "Local PostgreSQL" or "REPRO PLAN DB"
   - In the **"Connection"** tab:
     - **Host name/address**: `localhost` (or `127.0.0.1`)
     - **Port**: `5432` (default PostgreSQL port)
     - **Maintenance database**: `postgres`
     - **Username**: `postgres` (or your PostgreSQL username)
     - **Password**: Enter your PostgreSQL password (the one you set during installation)
     - Check **"Save password"** if you want pgAdmin to remember it
   - Click **"Save"**

### Step 3: Verify Connection

1. Click on your server in the left sidebar
2. If it asks for a password, enter your PostgreSQL password
3. You should see the server expand showing "Databases", "Login/Group Roles", etc.
4. If you see an error, check:
   - PostgreSQL service is running (check Windows Services or Task Manager)
   - Your password is correct
   - Port 5432 is not blocked by firewall

---

## PART 2: Creating the Database

### Step 4: Create the Database

1. In the left sidebar, expand your server (click the arrow next to it)
2. Expand **"Databases"**
3. Right-click on **"Databases"**
4. Select **"Create"** → **"Database..."**
5. In the **"General"** tab:
   - **Database**: Type `reproplan` (all lowercase, no spaces)
   - **Owner**: Leave as `postgres` (or select your PostgreSQL user)
6. In the **"Definition"** tab:
   - **Encoding**: Select `UTF8`
   - **Template**: Select `template0`
7. Click **"Save"**
8. You should now see `reproplan` listed under "Databases"

### Step 5: Verify Database Was Created

1. Click on the `reproplan` database in the left sidebar
2. Click on the **"Tools"** menu at the top
3. Select **"Query Tool"**
4. In the query editor that opens, type:
   ```sql
   SELECT current_database();
   ```
5. Click the **"Execute"** button (or press F5)
6. You should see `reproplan` in the results panel below
7. This confirms your database is working

---

## PART 3: Connecting Backend to Database

### Step 6: Create Environment File

1. Open your file explorer
2. Navigate to the `backend` folder in your project
3. Look for a file named `.env.example`
4. Copy this file and rename the copy to `.env` (remove the `.example` part)
5. Open the `.env` file with a text editor (Notepad, VS Code, etc.)

### Step 7: Configure Database Connection

In your `.env` file, you need to add your database connection details. The file should look like this:

```
NODE_ENV=development
PORT=5000

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reproplan
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
```

**Important**: Replace `your_postgres_password_here` with the actual password you use for PostgreSQL.

**Example** (if your password is "mypassword123"):
```
DB_PASSWORD=mypassword123
```

### Step 8: Save the .env File

1. Save the `.env` file
2. Make sure it's saved in the `backend` folder (same location as `package.json`)

---

## PART 4: Creating Tables (Automatic Method - Recommended)

### Step 9: Install Backend Dependencies

1. Open your terminal or command prompt
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Wait for installation to complete

### Step 10: Start the Backend Server

1. In the same terminal, run:
   ```bash
   npm run dev
   ```

2. The server will:
   - Connect to your PostgreSQL database
   - Automatically create all tables
   - Start the API server

3. You should see in the console:
   ```
   ✅ Database connection established successfully.
   ✅ Database models synchronized.
   🚀 REPRO PLAN API v3.0 server running on port 5000
   ```

4. If you see errors, check:
   - Your `.env` file has the correct password
   - PostgreSQL service is running
   - Database name is `reproplan` (exactly as created)

### Step 11: Verify Tables Were Created

1. Go back to pgAdmin
2. In the left sidebar, expand: `reproplan` → **"Schemas"** → **"public"** → **"Tables"**
3. Right-click on **"Tables"** and select **"Refresh"**
4. You should now see these tables:
   - **users** - Regular user accounts
   - **health_records** - User health data
   - **stakeholders** - Admin, Police, Medical, SafeHouse, NGO accounts
   - **emergency_alerts** - Emergency alerts from users
   - **cases** - Case management records
   - **inter_role_messages** - Messages between different roles

5. To view a table structure:
   - Right-click on any table (e.g., `users`)
   - Select **"View/Edit Data"** → **"All Rows"**
   - This will show the table columns and any data

---

## PART 5: Testing the Connection

### Step 12: Test Backend Connection

1. Make sure your backend server is still running (from Step 10)
2. Open a web browser
3. Go to: `http://localhost:5000/health`
4. You should see a JSON response like:
   ```json
   {
     "status": "ok",
     "message": "REPRO PLAN API v3.0 is running",
     "timestamp": "2024-01-15T10:30:00.000Z",
     "environment": "development"
   }
   ```
5. This confirms your backend is connected to the database

### Step 13: Test Database Operations

1. In pgAdmin, right-click on the `users` table
2. Select **"View/Edit Data"** → **"All Rows"**
3. The table should be empty initially (no rows)
4. When you create a user through the frontend, you'll see data appear here

---

## PART 6: Understanding the Tables

### users Table
- Stores regular anonymous users
- Each user has a unique `secretCode`
- Tracks if the code has been used (`isUsed`)
- Links to `surveyLink` for account recovery

### health_records Table
- Stores health tracking data for users
- Linked to users via `userId`
- Uses JSONB format for flexible data storage

### stakeholders Table
- Stores Admin, Police, Medical, SafeHouse, and NGO accounts
- Each has a unique `secretCode` for login
- Tracks permissions and activity status

### emergency_alerts Table
- Stores emergency alerts from users or stakeholders
- Can be linked to a user (`userId`) or stakeholder (`stakeholderId`)
- Tracks alert type, priority, status, and location

### cases Table
- Stores case management records
- Can be assigned to stakeholders
- Tracks case status, priority, and notes

### inter_role_messages Table
- Stores messages between different stakeholder roles
- Links stakeholders for communication
- Tracks message type, priority, and read status

---

## Troubleshooting Common Issues

### Issue: "Connection refused" Error

**What it means**: Backend can't connect to PostgreSQL

**Solutions**:
1. Check if PostgreSQL service is running:
   - Windows: Open Services (Win+R, type `services.msc`), look for "postgresql" service, make sure it's "Running"
   - Or check Task Manager for PostgreSQL processes
2. Verify port 5432 is correct in your `.env` file
3. Check if firewall is blocking the connection

### Issue: "Database does not exist" Error

**What it means**: The database name in `.env` doesn't match what you created

**Solutions**:
1. In pgAdmin, check the exact name of your database (should be `reproplan`)
2. In your `.env` file, make sure `DB_NAME=reproplan` (exactly matching, case-sensitive)
3. Recreate the database if needed

### Issue: "Password authentication failed" Error

**What it means**: Wrong password in `.env` file

**Solutions**:
1. Verify your PostgreSQL password
2. Try connecting in pgAdmin with the same password to confirm it works
3. Update `DB_PASSWORD` in your `.env` file
4. If you forgot your password, you may need to reset it

### Issue: Tables Not Creating Automatically

**What it means**: Backend isn't creating tables when starting

**Solutions**:
1. Make sure `NODE_ENV=development` in your `.env` file
2. Check the console for error messages
3. Verify all model files exist in `backend/src/models/`
4. Make sure the database connection is successful first

### Issue: "Cannot find module" Errors

**What it means**: Dependencies not installed

**Solutions**:
1. Make sure you ran `npm install` in the backend folder
2. Check that `node_modules` folder exists in backend
3. Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

---

## Viewing Data in pgAdmin

### To View Table Data:

1. In pgAdmin, expand: `reproplan` → **"Schemas"** → **"public"** → **"Tables"**
2. Right-click on any table (e.g., `users`)
3. Select **"View/Edit Data"** → **"All Rows"**
4. A data grid will open showing all rows in the table
5. You can edit data directly in this view

### To View Table Structure:

1. Right-click on a table
2. Select **"Properties"**
3. Go to the **"Columns"** tab to see all columns, their types, and constraints

### To Run SQL Queries:

1. Right-click on the `reproplan` database
2. Select **"Query Tool"**
3. Type your SQL query
4. Click **"Execute"** (or press F5)
5. Results appear below

**Example queries**:
```sql
-- Count all users
SELECT COUNT(*) FROM users;

-- View all stakeholders
SELECT * FROM stakeholders;

-- View active emergency alerts
SELECT * FROM emergency_alerts WHERE status = 'active';
```

---

## Connection String Format

Your backend can use two connection methods:

### Method 1: Individual Variables (What we're using)
In `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reproplan
DB_USER=postgres
DB_PASSWORD=your_password
```

### Method 2: Connection String (Alternative)
In `.env`:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/reproplan
```

Both methods work the same way. The backend code automatically uses whichever one you provide.

---

## Next Steps After Setup

1. **Test User Creation**: Use the frontend to create a user account - it will appear in the `users` table
2. **Test Stakeholder Login**: Create a stakeholder account - it will appear in the `stakeholders` table
3. **Monitor Data**: Use pgAdmin to view data as it's created through the app
4. **Backup Database**: Right-click `reproplan` → **"Backup..."** to create database backups

---

## Important Notes

- **Never commit `.env` file**: It contains your password - it's already in `.gitignore`
- **Development vs Production**: The automatic table creation only happens when `NODE_ENV=development`
- **Data Persistence**: All data is stored in PostgreSQL and persists between server restarts
- **Backup Regularly**: Use pgAdmin's backup feature to save your data

---

## Quick Reference: Database Connection Details

- **Host**: `localhost` (or `127.0.0.1`)
- **Port**: `5432`
- **Database**: `reproplan`
- **Username**: `postgres` (or your PostgreSQL username)
- **Password**: (Your PostgreSQL password)

These values go in your `backend/.env` file.
