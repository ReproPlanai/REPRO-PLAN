# How to Create and Configure Your .env File

This guide shows you step-by-step how to create and configure your `.env` file for the REPRO PLAN backend.

## Step 1: Create the .env File

### Option A: Using File Explorer (Windows)

1. Open File Explorer
2. Navigate to: `C:\Users\Christopher O Fallah\REPRO PLAN\backend`
3. Right-click in an empty area
4. Select **"New"** → **"Text Document"**
5. Name it exactly: `.env` (including the dot at the beginning)
   - If Windows warns about changing the extension, click **"Yes"**
   - If you can't see the file after creating it, it's because Windows hides files starting with a dot
   - To see it: File Explorer → View tab → Check "Hidden items"

### Option B: Using Command Line

1. Open Command Prompt or PowerShell
2. Navigate to backend folder:
   ```bash
   cd "C:\Users\Christopher O Fallah\REPRO PLAN\backend"
   ```
3. Create the file:
   ```bash
   type nul > .env
   ```
   Or in PowerShell:
   ```powershell
   New-Item -Path .env -ItemType File
   ```

### Option C: Using VS Code or Text Editor

1. Open VS Code (or any text editor)
2. File → Open Folder → Select `backend` folder
3. Click the **"New File"** button (or right-click → New File)
4. Name it: `.env`

---

## Step 2: Open the .env File

1. Right-click on `.env` file
2. Select **"Open with"** → Choose **"Notepad"** (or VS Code, or any text editor)
3. The file will be empty (or have some content if you copied from example)

---

## Step 3: Add All Required Variables

Copy and paste this template into your `.env` file, then replace the placeholder values:

```env
# Application Environment
NODE_ENV=development
PORT=5000

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reproplan
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRESQL_PASSWORD_HERE

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# JWT Secret (generate a random string)
JWT_SECRET=YOUR_RANDOM_SECRET_KEY_HERE
```

---

## Step 4: Fill in Your Values

### 1. Database Password (REQUIRED)

**Find your PostgreSQL password:**
- This is the password you use to connect to PostgreSQL in pgAdmin
- If you don't remember it:
  1. Open pgAdmin
  2. Try to connect to your PostgreSQL server
  3. The password it asks for is what you need
  4. If you can't remember, you may need to reset PostgreSQL password

**In .env file, replace:**
```
DB_PASSWORD=YOUR_POSTGRESQL_PASSWORD_HERE
```
**With your actual password:**
```
DB_PASSWORD=mypassword123
```

**Important:**
- No quotes around the password
- No spaces before or after the `=`
- Example: `DB_PASSWORD=abc123` ✅ (correct)
- Example: `DB_PASSWORD = abc123` ❌ (wrong - has spaces)
- Example: `DB_PASSWORD="abc123"` ❌ (wrong - has quotes)

### 2. Database Host (Usually Default)

**Default value:**
```
DB_HOST=localhost
```

**Only change if:**
- Your PostgreSQL is on a different computer
- You're using a remote database
- Otherwise, keep it as `localhost`

### 3. Database Port (Usually Default)

**Default value:**
```
DB_PORT=5432
```

**Only change if:**
- Your PostgreSQL uses a different port
- To check your port: In pgAdmin, right-click server → Properties → Connection tab
- Otherwise, keep it as `5432`

### 4. Database Name (Should Match)

**Value:**
```
DB_NAME=reproplan
```

**Must match:**
- The database name you created in pgAdmin
- Should be exactly `reproplan` (all lowercase, no spaces)

### 5. Database User (Usually Default)

**Default value:**
```
DB_USER=postgres
```

**Only change if:**
- You created a different PostgreSQL user
- To check: In pgAdmin Query Tool, run: `SELECT current_user;`
- Otherwise, keep it as `postgres`

### 6. JWT Secret (Generate Random String)

**Generate a random secret:**
- This is used for authentication tokens
- Should be a long, random string
- You can use any random text

**Examples:**
```
JWT_SECRET=my-super-secret-key-12345-abcdef
JWT_SECRET=reproplan-v3-secret-key-2024-random
JWT_SECRET=abc123xyz789secretkey456
```

**Or generate one online:**
- Visit: https://randomkeygen.com/
- Copy a "CodeIgniter Encryption Keys" or any long random string
- Paste it after `JWT_SECRET=`

---

## Step 5: Complete Example

Here's what a complete `.env` file should look like (with example values):

```env
# Application Environment
NODE_ENV=development
PORT=5000

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reproplan
DB_USER=postgres
DB_PASSWORD=mypassword123

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# JWT Secret
JWT_SECRET=reproplan-secret-key-abc123xyz789-2024
```

---

## Step 6: Save the File

1. Press **Ctrl + S** to save
2. Make sure the file is saved as `.env` (not `.env.txt`)
3. Close the file

---

## Step 7: Verify the File

1. Make sure the file is in: `backend/.env`
2. The file should contain all the variables above
3. Make sure `DB_PASSWORD` has your actual password (not the placeholder)

---

## Step 8: Test the Connection

1. Open terminal/command prompt
2. Navigate to backend folder:
   ```bash
   cd backend
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

**Success looks like:**
```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 REPRO PLAN API v3.0 server running on port 5000
```

**If you see errors:**
- Check that `DB_PASSWORD` has your actual password
- Verify PostgreSQL service is running
- Check that database name matches (`reproplan`)

---

## Common Mistakes to Avoid

### ❌ Wrong: Using quotes
```env
DB_PASSWORD="mypassword"  # Don't use quotes
```

### ✅ Correct: No quotes
```env
DB_PASSWORD=mypassword  # No quotes
```

### ❌ Wrong: Spaces around =
```env
DB_PASSWORD = mypassword  # Don't use spaces
```

### ✅ Correct: No spaces
```env
DB_PASSWORD=mypassword  # No spaces
```

### ❌ Wrong: Empty password
```env
DB_PASSWORD=  # This won't work
```

### ✅ Correct: Actual password
```env
DB_PASSWORD=mypassword123  # Use your real password
```

---

## Quick Reference: All Variables Explained

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `5000` | Server port |
| `DB_HOST` | Yes | `localhost` | PostgreSQL server address |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_NAME` | Yes | `reproplan` | Database name |
| `DB_USER` | Yes | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | **Yes** | - | **Your PostgreSQL password** |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Frontend URL |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max API requests per window |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (15 min) |
| `JWT_SECRET` | No | - | Secret key for tokens |

---

## Getting Your PostgreSQL Password

If you don't remember your PostgreSQL password:

### Method 1: Check pgAdmin
1. Open pgAdmin
2. Try to connect to your PostgreSQL server
3. The password it asks for is what you need

### Method 2: Reset Password (if needed)
1. Open Command Prompt as Administrator
2. Navigate to PostgreSQL bin folder (usually):
   ```bash
   cd "C:\Program Files\PostgreSQL\14\bin"
   ```
3. Run:
   ```bash
   psql -U postgres
   ```
4. If it asks for password and you don't know it, you may need to:
   - Reset PostgreSQL password through Windows Services
   - Or reinstall PostgreSQL with a new password

---

## File Location

Your `.env` file must be located at:
```
C:\Users\Christopher O Fallah\REPRO PLAN\backend\.env
```

**Important:**
- The file must be named exactly `.env` (with the dot)
- It must be in the `backend` folder (same folder as `package.json`)
- The backend code looks for this file automatically

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` to git (it's already in `.gitignore`)
- Never share your `.env` file
- Never put your `.env` file in public places
- Use strong passwords for production

---

## Troubleshooting

### "DB_PASSWORD is not set" Error
- Make sure `.env` file exists in `backend` folder
- Check that `DB_PASSWORD=yourpassword` is in the file
- Make sure there are no quotes around the password
- Make sure there are no spaces around the `=`

### "Connection refused" Error
- Check PostgreSQL service is running
- Verify `DB_HOST=localhost` is correct
- Verify `DB_PORT=5432` matches your PostgreSQL port

### "Password authentication failed" Error
- Double-check your password in `.env`
- Try connecting in pgAdmin with the same password
- Make sure password has no extra spaces or characters

---

## Next Steps

After creating and configuring your `.env` file:

1. ✅ Save the file
2. ✅ Verify all values are correct
3. ✅ Run `npm run dev` in the backend folder
4. ✅ Check for success messages
5. ✅ Test API at `http://localhost:5000/health`

Your backend should now connect to PostgreSQL successfully! 🎉


