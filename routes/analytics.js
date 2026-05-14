const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const dbPromise = db.promise();

// ADMIN ANALYTICS
router.get("/admin", verifyToken, isAdmin, async (req, res) => {
  try {
    // Get all stats in parallel
    const [ticketStatsRows] = await dbPromise.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as lowCount,
        SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as mediumCount,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as highCount,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as criticalCount
      FROM tickets
    `);
    const [trendRows] = await dbPromise.query(`
      SELECT 
        DATE(created_at) as day,
        COUNT(*) as count
      FROM tickets
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);
    
    const [userStatsRows] = await dbPromise.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as pending
      FROM users
    `);
    
    const [topServicesRows] = await dbPromise.query(`
      SELECT 
        s.name,
        COUNT(t.id) as request_count
      FROM servicecatalog s
      LEFT JOIN tickets t ON s.id = t.service_id
      GROUP BY s.id, s.name
      ORDER BY request_count DESC
      LIMIT 5
    `);
    
    const [agentPerformanceRows] = await dbPromise.query(`
      SELECT 
        u.firstname,
        u.lastname,
        COUNT(t.id) as total_tickets,
        SUM(CASE WHEN t.status IN ('assigned','in_progress') THEN 1 ELSE 0 END) as active_tickets,
        SUM(CASE WHEN t.status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN tickets t ON u.id = t.assigned_to
      WHERE r.name = 'Technician'
      GROUP BY u.id
    `);
      
    res.json({
      tickets: ticketStatsRows[0],
      users: userStatsRows[0],
      topServices: topServicesRows,
      agentPerformance: agentPerformanceRows,
      trends: trendRows
    });
    
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: err.message });
  }
});

  // AGENT MANAGER ANALYTICS
  // AGENT MANAGER ANALYTICS
router.get("/manager", verifyToken, async (req, res) => {
  try {
    console.log("🔍 User from token:", req.user);
    const userRole = req.user.role_name || req.user.role; 
    console.log("🔍 User role:", userRole);
    // Only allow agent managers
    if (userRole !== "IT Agent Manager" && userRole !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const dbPromise = db.promise();

    // Team workload stats
    const [teamWorkloadRows] = await dbPromise.query(`
      SELECT 
        SUM(CASE WHEN assigned_to IS NULL THEN 1 ELSE 0 END) as unassigned,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN priority = 'high' OR priority = 'critical' THEN 1 ELSE 0 END) as highPriorityCount,
        SUM(CASE WHEN status IN ('assigned','in_progress') THEN 1 ELSE 0 END) as total_active
      FROM tickets
      WHERE status NOT IN ('resolved','closed')
    `);

    // Agent metrics
    const [agentMetricsRows] = await dbPromise.query(`
      SELECT 
        u.id,
        u.firstname,
        u.lastname,
        SUM(CASE WHEN t.status IN ('assigned','in_progress') THEN 1 ELSE 0 END) as active_tickets,
        SUM(CASE WHEN t.status = 'resolved' AND DATE(t.resolved_at) = CURDATE() THEN 1 ELSE 0 END) as resolved_today,
        SUM(CASE WHEN t.status = 'resolved' AND WEEK(t.resolved_at) = WEEK(CURDATE()) THEN 1 ELSE 0 END) as resolved_this_week
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN tickets t ON u.id = t.assigned_to
      WHERE r.name = 'Technician'
      GROUP BY u.id, u.firstname, u.lastname
      ORDER BY active_tickets DESC
    `);

    // Unassigned tickets
    const [unassignedTicketsRows] = await dbPromise.query(`
      SELECT 
        t.id,
        t.title,
        t.priority,
        t.created_at,
        u.firstname,
        u.lastname,
        s.name as service_name
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN servicecatalog s ON t.service_id = s.id
      WHERE t.assigned_to IS NULL AND t.status NOT IN ('resolved','closed')
      ORDER BY 
        CASE t.priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        t.created_at ASC
      LIMIT 20
    `);

    res.json({
      teamWorkload: teamWorkloadRows[0],
      agents: agentMetricsRows,
      unassignedTickets: unassignedTicketsRows
    });

  } catch (err) {
    console.error("MANAGER ANALYTICS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
  
{/*
  // AGENT PERSONAL ANALYTICS
  router.get("/agent/me", verifyToken, async (req, res) => {
    try {
      const agentId = req.user.id;
      
      const [myStats, myTickets] = await Promise.all([
        // My performance stats
        db.promise().query(`
          SELECT 
            COUNT(CASE WHEN status IN ('assigned', 'in_progress') THEN 1 END) as assigned_to_me,
            COUNT(CASE WHEN status = 'resolved' AND DATE(resolved_at) = CURDATE() THEN 1 END) as resolved_today,
            COUNT(CASE WHEN status = 'resolved' AND WEEK(resolved_at) = WEEK(CURDATE()) THEN 1 END) as resolved_this_week
          FROM tickets
          WHERE assigned_to = ?
        `, [agentId]),
        
        // My active tickets
        db.promise().query(`
          SELECT 
            t.id,
            t.title,
            t.priority,
            t.status,
            t.created_at,
            s.name as service_name
          FROM tickets t
          LEFT JOIN servicecatalog s ON t.service_id = s.id
          WHERE t.assigned_to = ? AND t.status IN ('assigned', 'in_progress')
          ORDER BY 
            CASE t.priority
              WHEN 'critical' THEN 1
              WHEN 'high' THEN 2
              WHEN 'medium' THEN 3
              WHEN 'low' THEN 4
            END,
            t.created_at ASC
        `, [agentId])
      ]);

      res.json({
        stats: myStats[0],
        activeTickets: myTickets
      });
      
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
*/}
module.exports = router;