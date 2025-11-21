# Quick Database Setup Using pgAdmin Query Tool

This guide shows you how to set up the entire database in 2 minutes using pgAdmin's Query Tool.

## 🚀 Quick Steps

### Step 1: Open pgAdmin and Connect

1. Open **pgAdmin 4**
2. Connect to your PostgreSQL server (usually `localhost:5432`)
3. If you haven't created the database yet:
   - Right-click **"Databases"** → **"Create"** → **"Database..."**
   - Name: `reproplan`
   - Click **"Save"**

### Step 2: Open Query Tool

1. In pgAdmin, expand: **Servers** → Your Server → **Databases** → **reproplan**
2. Right-click on **reproplan** database
3. Select **"Query Tool"**
4. A query editor window will open

### Step 3: Run the Setup Script

1. Open the file `backend/setup_database.sql` in a text editor
2. **Copy the entire contents** (Ctrl+A, then Ctrl+C)
3. **Paste it into the Query Tool** in pgAdmin (Ctrl+V)
4. Click the **"Execute"** button (or press **F5**)
5. Wait for it to complete (should take 1-2 seconds)

### Step 4: Verify Setup

After running the script, you should see:
- A message saying "Query returned successfully"
- Two result tables showing:
  - 6 tables (users, health_records, stakeholders, emergency_alerts, cases, inter_role_messages)
  - 6 ENUM types

### Step 5: View Your Tables

1. In pgAdmin left sidebar, expand: **reproplan** → **Schemas** → **public** → **Tables**
2. Right-click **"Tables"** and select **"Refresh"**
3. You should see all 6 tables listed

## ✅ Done!

Your database is now ready. You can:
- Connect your backend using the `.env` file
- Start inserting data through the app
- View data in pgAdmin

## 🔍 What the Script Does

The `setup_database.sql` script automatically:
1. ✅ Creates all 6 ENUM types (for roles, priorities, statuses, etc.)
2. ✅ Creates all 6 tables with proper columns and data types
3. ✅ Sets up all foreign key relationships
4. ✅ Creates indexes for better performance
5. ✅ Creates triggers to auto-update timestamps
6. ✅ Verifies everything was created correctly

## 🐛 Troubleshooting

### Error: "relation already exists"
- This means tables already exist
- The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run again
- If you want to start fresh, drop tables first (see below)

### Error: "type already exists"
- ENUMs already exist - this is fine
- The script handles this automatically

### Want to Start Fresh?

If you want to delete everything and start over, run this first:

```sql
-- WARNING: This deletes ALL data!
DROP TABLE IF EXISTS inter_role_messages CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS emergency_alerts CASCADE;
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS stakeholders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS enum_message_type CASCADE;
DROP TYPE IF EXISTS enum_case_status CASCADE;
DROP TYPE IF EXISTS enum_alert_status CASCADE;
DROP TYPE IF EXISTS enum_priority CASCADE;
DROP TYPE IF EXISTS enum_alert_type CASCADE;
DROP TYPE IF EXISTS enum_stakeholders_role CASCADE;
```

Then run the setup script again.

## 📝 Next Steps

1. **Configure Backend**: Update `backend/.env` with your database credentials
2. **Start Backend**: Run `npm run dev` in the backend folder
3. **Test Connection**: Visit `http://localhost:5000/health`

Your database is ready to use! 🎉

