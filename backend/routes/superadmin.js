import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ── Middleware: verify super admin JWT ──────────────────────────────────────
const authenticateSuperAdmin = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    try {
        const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
        if (decoded.role !== "SuperAdmin") return res.status(403).json({ error: "Forbidden" });
        req.superAdmin = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

// ── GET /api/superadmin/overview ────────────────────────────────────────────
router.get("/overview", authenticateSuperAdmin, async (req, res) => {
    try {
        const [[companies]] = await pool.query("SELECT COUNT(*) AS total FROM companies");
        const [[users]] = await pool.query("SELECT COUNT(*) AS total FROM users");
        const [[suppliers]] = await pool.query("SELECT COUNT(*) AS total FROM suppliers");
        const [[transactions]] = await pool.query("SELECT COUNT(*) AS total FROM transactions");
        const [[products]] = await pool.query("SELECT COUNT(*) AS total FROM products");
        res.json({
            companies: Number(companies.total),
            users: Number(users.total),
            suppliers: Number(suppliers.total),
            transactions: Number(transactions.total),
            products: Number(products.total),
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/superadmin/users ────────────────────────────────────────────────
router.get("/users", authenticateSuperAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                u.user_id, u.name, u.email, u.role, u.status,
                c.name AS company_name, c.company_id,
                (SELECT COUNT(*) FROM products   WHERE company_id = c.company_id) AS product_count,
                (SELECT COUNT(*) FROM suppliers  WHERE company_id = c.company_id) AS supplier_count,
                (SELECT COUNT(*) FROM transactions WHERE company_id = c.company_id) AS transaction_count
            FROM users u
            JOIN companies c ON u.company_id = c.company_id
            ORDER BY u.user_id DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/superadmin/suppliers ────────────────────────────────────────────
router.get("/suppliers", authenticateSuperAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                s.supplier_id, s.supplier_name, s.email, s.phone, s.address,
                c.name AS company_name,
                u.name AS owner_name, u.email AS owner_email
            FROM suppliers s
            JOIN companies c ON s.company_id = c.company_id
            LEFT JOIN users u ON u.company_id = c.company_id AND u.role = 'Admin'
            ORDER BY s.supplier_id DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/superadmin/transactions ─────────────────────────────────────────
router.get("/transactions", authenticateSuperAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                t.transaction_id, t.transaction_type, t.quantity, t.note AS notes, t.transaction_date,
                p.name AS product_name, p.sku,
                c.name AS company_name,
                u.name AS user_name, u.email AS user_email
            FROM transactions t
            JOIN products  p ON t.product_id  = p.product_id
            JOIN companies c ON t.company_id  = c.company_id
            LEFT JOIN users u ON u.company_id = c.company_id AND u.role = 'Admin'
            ORDER BY t.transaction_date DESC
            LIMIT 500
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/superadmin/reset ─────────────────────────────────────────────
router.delete("/reset", authenticateSuperAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Delete all transactions (dependent on products)
        await connection.query("DELETE FROM transactions");

        // 2. Delete products, suppliers, and categories
        await connection.query("DELETE FROM products");
        await connection.query("DELETE FROM suppliers");
        await connection.query("DELETE FROM categories");

        // 3. Delete all users except user_id = 1 (the original default admin if any)
        await connection.query("DELETE FROM users WHERE user_id > 1");

        // 4. Delete all companies except company_id = 1
        await connection.query("DELETE FROM companies WHERE company_id > 1");

        await connection.commit();
        res.json({ message: "All customer data has been successfully wiped." });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: "Failed to reset data: " + err.message });
    } finally {
        connection.release();
    }
});

export default router;
