import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT *, 
             (status = 'Unread') AS \`read_false\`,
             (status = 'Read') AS \`read\`
        FROM notifications 
       WHERE company_id = ?
       ORDER BY created_date DESC`, [req.user.company_id]);
        res.json(rows.map(n => ({
            ...n,
            id: n.notification_id,
            created_at: n.created_date,
            read: n.status === 'Read'
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/unread-count", authenticateToken, async (req, res) => {
    try {
        const [[{ count }]] = await pool.query("SELECT COUNT(*) AS count FROM notifications WHERE status = 'Unread' AND company_id = ?", [req.user.company_id]);
        res.json({ count: Number(count) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/read-all", authenticateToken, async (req, res) => {
    try {
        await pool.query("UPDATE notifications SET status = 'Read' WHERE company_id = ?", [req.user.company_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id/read", authenticateToken, async (req, res) => {
    try {
        await pool.query("UPDATE notifications SET status = 'Read' WHERE notification_id = ? AND company_id = ?", [req.params.id, req.user.company_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
