import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/companies (Public route for signup dropdown)
router.get("/", async (_req, res) => {
    try {
        const [rows] = await pool.query("SELECT company_id as id, name FROM companies ORDER BY name ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

import { authenticateToken } from "../middleware/auth.js";

// POST /api/companies/reset (Clear all business data for a company)
router.post("/reset", authenticateToken, async (req, res) => {
    const { company_id, role } = req.user;
    if (role !== 'Admin' && role !== 'Customer') {
        return res.status(403).json({ error: "Only admins or store owners can reset company data." });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Delete in correct order to avoid foreign key constraints
        await conn.query("DELETE FROM transactions WHERE company_id = ?", [company_id]);
        await conn.query("DELETE FROM notifications WHERE company_id = ?", [company_id]);
        await conn.query("DELETE FROM products WHERE company_id = ?", [company_id]);
        await conn.query("DELETE FROM categories WHERE company_id = ?", [company_id]);
        await conn.query("DELETE FROM suppliers WHERE company_id = ?", [company_id]);

        await conn.commit();
        res.json({ message: "Data reset successfully." });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

export default router;
