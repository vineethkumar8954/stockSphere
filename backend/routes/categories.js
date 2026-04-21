import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT *, category_id AS id, category_name AS name FROM categories WHERE company_id = ? ORDER BY category_name", [req.user.company_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", authenticateToken, async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    try {
        const [result] = await pool.query(
            "INSERT INTO categories (category_name, description, company_id) VALUES (?, ?, ?)",
            [name, description || null, req.user.company_id]
        );
        const [[row]] = await pool.query("SELECT *, category_id AS id, category_name AS name FROM categories WHERE category_id = ?", [result.insertId]);
        res.status(201).json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", authenticateToken, async (req, res) => {
    const { name, description } = req.body;
    try {
        const fields = [], vals = [];
        if (name !== undefined) { fields.push("category_name = ?"); vals.push(name); }
        if (description !== undefined) { fields.push("description = ?"); vals.push(description); }
        if (fields.length > 0) {
            vals.push(req.params.id, req.user.company_id);
            await pool.query(`UPDATE categories SET ${fields.join(", ")} WHERE category_id = ? AND company_id = ?`, vals);
        }
        const [[row]] = await pool.query("SELECT *, category_id AS id, category_name AS name FROM categories WHERE category_id = ?", [req.params.id]);
        res.json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        await pool.query("DELETE FROM categories WHERE category_id = ? AND company_id = ?", [req.params.id, req.user.company_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
