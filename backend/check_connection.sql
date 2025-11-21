-- =====================================================
-- REPRO PLAN v3.0 - Database Connection Check & Setup
-- =====================================================
-- Run these queries to verify your database setup
-- and get connection information for your .env file
-- =====================================================

-- =====================================================
-- Query 1: Check Current Database Connection Info
-- =====================================================
-- This shows you which database you're connected to
SELECT 
    current_database() as "Database Name",
    current_user as "Database User",
    inet_server_addr() as "Server IP",
    inet_server_port() as "Server Port",
    version() as "PostgreSQL Version";

-- =====================================================
-- Query 2: Verify All Tables Exist
-- =====================================================
-- This confirms all 6 tables were created successfully
SELECT 
    table_name as "Table Name",
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name 
     AND table_schema = 'public') as "Column Count"
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('users', 'health_records', 'stakeholders', 
                       'emergency_alerts', 'cases', 'inter_role_messages')
ORDER BY table_name;

-- =====================================================
-- Query 3: Check All ENUM Types
-- =====================================================
-- Verify all ENUM types are created
SELECT 
    typname as "ENUM Name",
    array_agg(enumlabel ORDER BY enumsortorder) as "Allowed Values"
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('enum_stakeholders_role', 'enum_alert_type', 
                  'enum_priority', 'enum_alert_status', 
                  'enum_case_status', 'enum_message_type')
GROUP BY typname
ORDER BY typname;

-- =====================================================
-- Query 4: Check Foreign Keys (Relationships)
-- =====================================================
-- Verify all table relationships are set up correctly
SELECT
    tc.table_name as "Table",
    kcu.column_name as "Column",
    ccu.table_name AS "References Table",
    ccu.column_name AS "References Column",
    tc.constraint_name as "Constraint Name"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- Query 5: Check Indexes (Performance)
-- =====================================================
-- Verify indexes are created for better performance
SELECT
    tablename as "Table",
    indexname as "Index Name",
    indexdef as "Index Definition"
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('users', 'health_records', 'stakeholders', 
                      'emergency_alerts', 'cases', 'inter_role_messages')
ORDER BY tablename, indexname;

-- =====================================================
-- Query 6: Get Connection String Format
-- =====================================================
-- This shows you the format for your DATABASE_URL
SELECT 
    'postgresql://' || 
    current_user || 
    ':[YOUR_PASSWORD]@' || 
    COALESCE(inet_server_addr()::text, 'localhost') || 
    ':' || 
    COALESCE(inet_server_port()::text, '5432') || 
    '/' || 
    current_database() 
    as "Connection String Format (replace [YOUR_PASSWORD])";

-- =====================================================
-- Query 7: Test Database is Ready
-- =====================================================
-- Run this to confirm everything is set up correctly
SELECT 
    CASE 
        WHEN table_count.count = 6 THEN '✅ All tables exist'
        ELSE '❌ Missing tables: ' || (6 - table_count.count)::text
    END as "Table Status",
    CASE 
        WHEN enum_count.count = 6 THEN '✅ All ENUMs exist'
        ELSE '❌ Missing ENUMs: ' || (6 - enum_count.count)::text
    END as "ENUM Status"
FROM (
    SELECT COUNT(*) as count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN ('users', 'health_records', 'stakeholders', 
                          'emergency_alerts', 'cases', 'inter_role_messages')
) table_count
CROSS JOIN (
    SELECT COUNT(DISTINCT typname) as count
    FROM pg_type 
    WHERE typtype = 'e' 
    AND typname IN ('enum_stakeholders_role', 'enum_alert_type', 
                    'enum_priority', 'enum_alert_status', 
                    'enum_case_status', 'enum_message_type')
) enum_count;

-- =====================================================
-- Query 8: Sample Connection Test
-- =====================================================
-- This creates a test record to verify writes work
-- (You can delete this test data after)
DO $$
BEGIN
    -- Test insert into users (will be rolled back if error)
    INSERT INTO users ("secretCode", "surveyLink", "isVerified", "isUsed")
    VALUES ('TEST123', 'https://test-survey.com', false, false)
    ON CONFLICT DO NOTHING;
    
    -- Test select
    IF EXISTS (SELECT 1 FROM users WHERE "secretCode" = 'TEST123') THEN
        RAISE NOTICE '✅ Database write test: SUCCESS';
        -- Clean up test data
        DELETE FROM users WHERE "secretCode" = 'TEST123';
    ELSE
        RAISE NOTICE '❌ Database write test: FAILED';
    END IF;
END $$;

-- =====================================================
-- Summary: What You Need for .env File
-- =====================================================
-- Based on the queries above, your .env file should have:
-- 
-- DB_HOST=localhost (or the IP from Query 1)
-- DB_PORT=5432 (or the port from Query 1)
-- DB_NAME=reproplan (from Query 1)
-- DB_USER=postgres (or the user from Query 1)
-- DB_PASSWORD=[Your PostgreSQL password - not shown here for security]
-- 
-- OR use the connection string format from Query 6:
-- DATABASE_URL=postgresql://postgres:your_password@localhost:5432/reproplan
-- =====================================================

