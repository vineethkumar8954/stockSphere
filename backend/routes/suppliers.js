import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT *, supplier_id AS id, supplier_name AS name FROM suppliers WHERE company_id = ? ORDER BY supplier_name", [req.user.company_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", authenticateToken, async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    try {
        const [result] = await pool.query(
            "INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, company_id) VALUES (?, ?, ?, ?, ?, ?)",
            [name, contact_person || null, phone || null, email || null, address || null, req.user.company_id]
        );
        const [[row]] = await pool.query("SELECT *, supplier_id AS id, supplier_name AS name FROM suppliers WHERE supplier_id = ?", [result.insertId]);
        res.status(201).json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", authenticateToken, async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    try {
        const fields = [], vals = [];
        if (name !== undefined) { fields.push("supplier_name = ?"); vals.push(name); }
        if (contact_person !== undefined) { fields.push("contact_person = ?"); vals.push(contact_person); }
        if (phone !== undefined) { fields.push("phone = ?"); vals.push(phone); }
        if (email !== undefined) { fields.push("email = ?"); vals.push(email); }
        if (address !== undefined) { fields.push("address = ?"); vals.push(address); }
        if (fields.length > 0) {
            vals.push(req.params.id, req.user.company_id);
            await pool.query(`UPDATE suppliers SET ${fields.join(", ")} WHERE supplier_id = ? AND company_id = ?`, vals);
        }
        const [[row]] = await pool.query("SELECT *, supplier_id AS id, supplier_name AS name FROM suppliers WHERE supplier_id = ?", [req.params.id]);
        res.json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        await pool.query("DELETE FROM suppliers WHERE supplier_id = ? AND company_id = ?", [req.params.id, req.user.company_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
