import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/dashboard/metrics
router.get("/metrics", authenticateToken, async (req, res) => {
    try {
        const [[productStats]] = await pool.query(`
      SELECT
        COUNT(*)                              AS total_products,
        COALESCE(SUM(price * quantity), 0)    AS total_value,
        COUNT(CASE WHEN quantity <= reorder_level AND quantity > 0 THEN 1 END) AS low_stock_count,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) AS out_of_stock_count
      FROM products
      WHERE company_id = ?
    `, [req.user.company_id]);
        const [[txnStats]] = await pool.query(`
      SELECT
        COUNT(*)  AS total_transactions,
        COALESCE(SUM(CASE WHEN transaction_type = 'IN'  THEN quantity ELSE 0 END), 0) AS total_stock_in,
        COALESCE(SUM(CASE WHEN transaction_type = 'OUT' THEN quantity ELSE 0 END), 0) AS total_stock_out
      FROM transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND company_id = ?
    `, [req.user.company_id]);
        const [[catCount]] = await pool.query("SELECT COUNT(*) AS total_categories FROM categories WHERE company_id = ?", [req.user.company_id]);
        const [[supCount]] = await pool.query("SELECT COUNT(*) AS total_suppliers FROM suppliers WHERE company_id = ?", [req.user.company_id]);
        res.json({
            total_products: Number(productStats.total_products),
            total_value: Number(productStats.total_value),
            low_stock_count: Number(productStats.low_stock_count),
            out_of_stock_count: Number(productStats.out_of_stock_count),
            total_transactions: Number(txnStats.total_transactions),
            total_stock_in: Number(txnStats.total_stock_in),
            total_stock_out: Number(txnStats.total_stock_out),
            total_categories: Number(catCount.total_categories),
            total_suppliers: Number(supCount.total_suppliers),
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/low-stock
router.get("/low-stock", authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT p.product_id AS id, p.name, p.sku, p.quantity, p.reorder_level, p.price,
             c.category_name, s.supplier_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN suppliers  s ON p.supplier_id  = s.supplier_id
       WHERE p.company_id = ? AND p.quantity <= p.reorder_level
       ORDER BY p.quantity ASC
       LIMIT 20
    `, [req.user.company_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/recent-transactions
router.get("/recent-transactions", authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT t.transaction_id AS id, t.transaction_type, t.quantity, t.note, 
             t.transaction_date AS created_at,
             p.name AS product_name, p.sku
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.product_id
       WHERE t.company_id = ?
       ORDER BY t.transaction_date DESC
       LIMIT 10
    `, [req.user.company_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
