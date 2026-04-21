import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    const { type } = req.query;
    try {
        let sql = `
      SELECT t.*, t.transaction_id AS id, t.note AS notes,
             p.name AS product_name, p.sku AS product_sku,
             JSON_OBJECT('name', p.name, 'sku', p.sku) AS products,
             t.transaction_date AS created_at
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.product_id
       WHERE t.company_id = ?
    `;
        const vals = [req.user.company_id];
        if (type) { sql += " AND t.transaction_type = ?"; vals.push(type); }
        sql += " ORDER BY t.transaction_date DESC";
        const [rows] = await pool.query(sql, vals);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", authenticateToken, async (req, res) => {
    const { product_id, transaction_type, quantity, notes, note } = req.body;
    const finalNote = note || notes;
    if (!product_id || !transaction_type || !quantity) return res.status(400).json({ error: "missing fields" });
    if (Number(quantity) <= 0) return res.status(400).json({ error: "qty > 0 req" });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [[product]] = await conn.query(
            "SELECT product_id, name, quantity, reorder_level FROM products WHERE product_id = ? AND company_id = ? FOR UPDATE",
            [product_id, req.user.company_id]
        );
        if (!product) { await conn.rollback(); return res.status(404).json({ error: "Product not found" }); }

        let newQty;
        if (transaction_type === "IN") {
            newQty = product.quantity + Number(quantity);
        } else {
            if (product.quantity < Number(quantity)) {
                await conn.rollback();
                return res.status(400).json({ error: `Insufficient stock` });
            }
            newQty = product.quantity - Number(quantity);
        }

        await conn.query("UPDATE products SET quantity = ? WHERE product_id = ? AND company_id = ?", [newQty, product_id, req.user.company_id]);

        const [result] = await conn.query(
            "INSERT INTO transactions (product_id, transaction_type, quantity, note, performed_by, company_id) VALUES (?, ?, ?, ?, ?, ?)",
            [product_id, transaction_type, quantity, finalNote || null, req.user.id || null, req.user.company_id]
        );

        // General transaction notification
        await conn.query(
            "INSERT INTO notifications (message, type, status, company_id) VALUES (?, 'info', 'Unread', ?)",
            [`${transaction_type === 'IN' ? 'Stock In' : 'Stock Out'}: ${quantity} units of ${product.name}`, req.user.company_id]
        );

        if (newQty === 0) {
            await conn.query("INSERT INTO notifications (message, type, status, company_id) VALUES (?, 'danger', 'Unread', ?)", [`${product.name} is now out of stock!`, req.user.company_id]);
        } else if (newQty <= product.reorder_level) {
            await conn.query("INSERT INTO notifications (message, type, status, company_id) VALUES (?, 'warning', 'Unread', ?)", [`${product.name} stock is low (${newQty} remaining)`, req.user.company_id]);
        }

        await conn.commit();

        const [[txn]] = await conn.query(
            `SELECT t.*, t.transaction_date AS created_at, JSON_OBJECT('name', p.name, 'sku', p.sku) AS products
         FROM transactions t LEFT JOIN products p ON t.product_id = p.product_id
        WHERE t.transaction_id = ? AND t.company_id = ?`, [result.insertId, req.user.company_id]
        );
        res.status(201).json({ ...txn, new_quantity: newQty });
    } catch (err) {
        await conn.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        conn.release();
    }
});

export default router;
