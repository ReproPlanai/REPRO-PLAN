import { Router, Request, Response } from 'express';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('admin');
const router = Router();

// System settings storage
let systemSettings = {
  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    emergencyAlerts: true
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    ipWhitelist: false
  },
  database: {
    backupFrequency: 'daily',
    retentionDays: 90,
    autoBackup: true
  },
  api: {
    rateLimit: 100,
    timeout: 30,
    corsEnabled: true
  },
  email: {
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    fromEmail: 'noreply@reproplan.org',
    fromName: 'REPRO PLAN'
  }
};

// Get system settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, settings: systemSettings });
  } catch (err) {
    log.error({ err }, 'Failed to get system settings');
    res.status(500).json({ error: 'Failed to get system settings' });
  }
});

// Update system settings
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    systemSettings = { ...systemSettings, ...updates };
    log.info('System settings updated');
    res.json({ success: true, settings: systemSettings });
  } catch (err) {
    log.error({ err }, 'Failed to update system settings');
    res.status(500).json({ error: 'Failed to update system settings' });
  }
});

// Get dashboard stats
router.get('/dashboard-stats', async (req: Request, res: Response) => {
  try {
    // Query all counts from database
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const verifiedUsers = await query('SELECT COUNT(*) as count FROM users WHERE is_verified = true');
    const activeUsers = await query("SELECT COUNT(*) as count FROM users WHERE last_login > NOW() - INTERVAL '7 days'");
    
    const stakeholderCount = await query('SELECT COUNT(*) as count FROM stakeholders');
    const stakeholdersByRole = await query('SELECT role, COUNT(*) as count FROM stakeholders GROUP BY role');
    
    const alertCount = await query('SELECT COUNT(*) as count FROM alerts');
    const activeAlerts = await query("SELECT COUNT(*) as count FROM alerts WHERE status = 'active'");
    const resolvedAlerts = await query("SELECT COUNT(*) as count FROM alerts WHERE status = 'resolved'");
    const criticalAlerts = await query("SELECT COUNT(*) as count FROM alerts WHERE priority = 'critical'");
    
    const caseCount = await query('SELECT COUNT(*) as count FROM cases');
    const openCases = await query("SELECT COUNT(*) as count FROM cases WHERE status = 'open'");
    const inProgressCases = await query("SELECT COUNT(*) as count FROM cases WHERE status = 'in_progress'");
    const resolvedCases = await query("SELECT COUNT(*) as count FROM cases WHERE status = 'resolved'");
    
    const messageCount = await query('SELECT COUNT(*) as count FROM messages');
    const unreadMessages = await query('SELECT COUNT(*) as count FROM messages WHERE is_read = false');
    
    const avgResponseTime = await query("SELECT AVG(response_time) as avg FROM alerts WHERE response_time IS NOT NULL");
    const alertsToday = await query("SELECT COUNT(*) as count FROM alerts WHERE created_at::date = CURRENT_DATE");

    const stats = {
      users: {
        total: parseInt(userCount[0].count),
        verified: parseInt(verifiedUsers[0].count),
        active: parseInt(activeUsers[0].count)
      },
      stakeholders: {
        total: parseInt(stakeholderCount[0].count),
        byRole: stakeholdersByRole.reduce<Record<string, number>>((acc, s) => {
          acc[s.role as string] = parseInt(s.count as string);
          return acc;
        }, {})
      },
      alerts: {
        total: parseInt(alertCount[0].count),
        active: parseInt(activeAlerts[0].count),
        resolved: parseInt(resolvedAlerts[0].count),
        critical: parseInt(criticalAlerts[0].count)
      },
      cases: {
        total: parseInt(caseCount[0].count),
        open: parseInt(openCases[0].count),
        inProgress: parseInt(inProgressCases[0].count),
        resolved: parseInt(resolvedCases[0].count)
      },
      messages: {
        total: parseInt(messageCount[0].count),
        unread: parseInt(unreadMessages[0].count)
      },
      responseMetrics: {
        averageResponseTime: Math.round(parseFloat(avgResponseTime[0]?.avg || 0)),
        totalAlertsToday: parseInt(alertsToday[0].count)
      }
    };

    res.json({ success: true, stats });
  } catch (err) {
    log.error({ err }, 'Failed to get dashboard stats');
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// Get analytics data
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query;
    const days = parseInt(timeRange as string) || 30;

    // Get summary counts from database
    const totalUsers = await query("SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '$1 days'", [days]);
    const totalAlerts = await query("SELECT COUNT(*) as count FROM alerts WHERE created_at > NOW() - INTERVAL '$1 days'", [days]);
    const totalCases = await query("SELECT COUNT(*) as count FROM cases WHERE created_at > NOW() - INTERVAL '$1 days'", [days]);
    const resolvedAlerts = await query("SELECT COUNT(*) as count FROM alerts WHERE status = 'resolved' AND updated_at > NOW() - INTERVAL '$1 days'", [days]);
    const avgResponseTime = await query("SELECT AVG(response_time) as avg FROM alerts WHERE response_time IS NOT NULL AND created_at > NOW() - INTERVAL '$1 days'", [days]);

    // Get daily activity (last 30 days)
    const dailyActivity = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) FILTER (WHERE 'user' = 'user') as users,
        COUNT(*) FILTER (WHERE alert_type IS NOT NULL) as alerts,
        COUNT(*) FILTER (WHERE case_number IS NOT NULL) as cases
      FROM (
        SELECT created_at, NULL as alert_type, NULL as case_number FROM users 
        WHERE created_at > NOW() - INTERVAL '${days} days'
        UNION ALL
        SELECT created_at, alert_type, NULL FROM alerts 
        WHERE created_at > NOW() - INTERVAL '${days} days'
        UNION ALL
        SELECT created_at, NULL, case_number FROM cases 
        WHERE created_at > NOW() - INTERVAL '${days} days'
      ) combined
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT ${days}
    `);

    // Get alerts by type
    const alertsByType = await query('SELECT alert_type, COUNT(*) as count FROM alerts GROUP BY alert_type');
    
    // Get cases by type
    const casesByType = await query('SELECT case_type, COUNT(*) as count FROM cases GROUP BY case_type');
    
    // Get alerts by priority
    const alertsByPriority = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE priority = 'critical') as critical,
        COUNT(*) FILTER (WHERE priority = 'high') as high,
        COUNT(*) FILTER (WHERE priority = 'medium') as medium,
        COUNT(*) FILTER (WHERE priority = 'low') as low
      FROM alerts
    `);

    const analytics = {
      timeRange: `${days}d`,
      summary: {
        totalUsers: parseInt(totalUsers[0]?.count || 0),
        totalAlerts: parseInt(totalAlerts[0]?.count || 0),
        totalCases: parseInt(totalCases[0]?.count || 0),
        resolvedAlerts: parseInt(resolvedAlerts[0]?.count || 0),
        averageResponseTime: Math.round(parseFloat(avgResponseTime[0]?.avg || 0))
      },
      dailyActivity: dailyActivity.map(d => ({
        date: d.date,
        users: parseInt(d.users || 0),
        alerts: parseInt(d.alerts || 0),
        cases: parseInt(d.cases || 0),
        responses: 0
      })),
      alertsByType: alertsByType.reduce<Record<string, number>>((acc, a) => {
        acc[a.alert_type as string] = parseInt(a.count as string);
        return acc;
      }, {}),
      casesByType: casesByType.reduce<Record<string, number>>((acc, c) => {
        acc[c.case_type as string] = parseInt(c.count as string);
        return acc;
      }, {}),
      alertsByPriority: {
        critical: parseInt(alertsByPriority[0]?.critical || 0),
        high: parseInt(alertsByPriority[0]?.high || 0),
        medium: parseInt(alertsByPriority[0]?.medium || 0),
        low: parseInt(alertsByPriority[0]?.low || 0)
      }
    };

    res.json({ success: true, analytics });
  } catch (err) {
    log.error({ err }, 'Failed to get analytics');
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Verify auth token
router.get('/auth/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    // In a real app, verify JWT token here
    res.json({ success: true, user: { id: 'admin', role: 'ADMIN' } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get game analytics
router.get('/game-analytics', async (req: Request, res: Response) => {
  try {
    const { timeRange = '30d', gameType } = req.query;
    const days = parseInt(timeRange as string) || 30;
    
    // Get game session stats
    const totalSessions = await query(
      "SELECT COUNT(*) as count FROM game_sessions WHERE created_at > NOW() - INTERVAL '$1 days'",
      [days]
    );
    
    const sessionsByGameType = await query(
      `SELECT game_type, COUNT(*) as count, AVG(score) as avg_score, AVG(duration_seconds) as avg_duration
       FROM game_sessions 
       WHERE created_at > NOW() - INTERVAL '${days} days'
       ${gameType ? `AND game_type = '${gameType}'` : ''}
       GROUP BY game_type`
    );
    
    const dailySessions = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as sessions,
        AVG(score) as avg_score,
        COUNT(DISTINCT user_id) as unique_users
       FROM game_sessions 
       WHERE created_at > NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT ${days}`
    );
    
    const topScorers = await query(
      `SELECT 
        user_id,
        game_type,
        MAX(score) as high_score,
        COUNT(*) as total_sessions
       FROM game_sessions 
       WHERE created_at > NOW() - INTERVAL '${days} days'
       GROUP BY user_id, game_type
       ORDER BY high_score DESC
       LIMIT 20`
    );
    
    const completionRates = await query(
      `SELECT 
        game_type,
        COUNT(*) FILTER (WHERE completed = true) as completed,
        COUNT(*) as total,
        ROUND(COUNT(*) FILTER (WHERE completed = true) * 100.0 / NULLIF(COUNT(*), 0), 2) as completion_rate
       FROM game_sessions 
       WHERE created_at > NOW() - INTERVAL '${days} days'
       GROUP BY game_type`
    );
    
    const analytics = {
      timeRange: `${days}d`,
      summary: {
        totalSessions: parseInt(totalSessions[0]?.count || 0),
        uniqueGameTypes: sessionsByGameType.length,
        averageScore: sessionsByGameType.reduce((sum: number, s: any) => sum + parseFloat(s.avg_score || 0), 0) / (sessionsByGameType.length || 1),
        totalDuration: sessionsByGameType.reduce((sum: number, s: any) => sum + parseFloat(s.avg_duration || 0), 0)
      },
      sessionsByGameType: sessionsByGameType.map((s: any) => ({
        gameType: s.game_type,
        sessions: parseInt(s.count),
        averageScore: parseFloat(s.avg_score || 0),
        averageDuration: parseFloat(s.avg_duration || 0)
      })),
      dailyActivity: dailySessions.map((d: any) => ({
        date: d.date,
        sessions: parseInt(d.sessions),
        averageScore: parseFloat(d.avg_score || 0),
        uniqueUsers: parseInt(d.unique_users)
      })),
      topScorers: topScorers.map((t: any) => ({
        userId: t.user_id,
        gameType: t.game_type,
        highScore: parseInt(t.high_score),
        totalSessions: parseInt(t.total_sessions)
      })),
      completionRates: completionRates.map((c: any) => ({
        gameType: c.game_type,
        completed: parseInt(c.completed),
        total: parseInt(c.total),
        completionRate: parseFloat(c.completion_rate || 0)
      }))
    };
    
    res.json({ success: true, analytics });
  } catch (err) {
    log.error({ err }, 'Failed to get game analytics');
    res.status(500).json({ error: 'Failed to get game analytics' });
  }
});

export default router;
