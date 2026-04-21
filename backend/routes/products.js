import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const { search, category_id, low_stock } = req.query;
        let sql = `
      SELECT p.*,
             c.category_name AS category_name,
             s.supplier_name AS supplier_name,
             JSON_OBJECT('name', c.category_name) AS categories,
             JSON_OBJECT('name', s.supplier_name) AS suppliers
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN suppliers  s ON p.supplier_id  = s.supplier_id
       WHERE p.company_id = ?
    `;
        const conditions = [], vals = [req.user.company_id];
        if (search) { conditions.push("(p.name LIKE ? OR p.sku LIKE ?)"); vals.push(`%${search}%`, `%${search}%`); }
        if (category_id) { conditions.push("p.category_id = ?"); vals.push(category_id); }
        if (low_stock === "true") { conditions.push("p.quantity <= p.reorder_level"); }
        if (conditions.length) sql += " AND " + conditions.join(" AND ");
        sql += " ORDER BY p.name";
        const [rows] = await pool.query(sql, vals);
        res.json(rows.map(p => ({ ...p, id: String(p.product_id) })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const getProductByIdAndCompany = async (id, companyId) => {
    const [[row]] = await pool.query(`
    SELECT p.*, c.category_name, s.supplier_name,
           JSON_OBJECT('name', c.category_name) AS categories,
           JSON_OBJECT('name', s.supplier_name) AS suppliers
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers  s ON p.supplier_id  = s.supplier_id
     WHERE p.product_id = ? AND p.company_id = ?`, [id, companyId]);
    return row ? { ...row, id: String(row.product_id) } : null;
};

router.get("/:id", authenticateToken, async (req, res) => {
    const row = await getProductByIdAndCompany(req.params.id, req.user.company_id);
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(row);
});

router.post("/", authenticateToken, async (req, res) => {
    const { name, sku, category_id, supplier_id, price, quantity, reorder_level } = req.body;
    if (!name || !sku) return res.status(400).json({ error: "name and sku are required" });
    try {
        const [result] = await pool.query(
            "INSERT INTO products (name, sku, category_id, supplier_id, price, quantity, reorder_level, company_id) VALUES (?,?,?,?,?,?,?,?)",
            [name, sku, category_id || null, supplier_id || null, price || 0, quantity || 0, reorder_level || 10, req.user.company_id]
        );
        res.status(201).json(await getProductByIdAndCompany(result.insertId, req.user.company_id));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", authenticateToken, async (req, res) => {
    const { name, sku, category_id, supplier_id, price, quantity, reorder_level } = req.body;
    try {
        const fields = [], vals = [];
        if (name !== undefined) { fields.push("name = ?"); vals.push(name); }
        if (sku !== undefined) { fields.push("sku = ?"); vals.push(sku); }
        if (category_id !== undefined) { fields.push("category_id = ?"); vals.push(category_id); }
        if (supplier_id !== undefined) { fields.push("supplier_id = ?"); vals.push(supplier_id); }
        if (price !== undefined) { fields.push("price = ?"); vals.push(price); }
        if (quantity !== undefined) { fields.push("quantity = ?"); vals.push(quantity); }
        if (reorder_level !== undefined) { fields.push("reorder_level = ?"); vals.push(reorder_level); }
        if (fields.length > 0) {
            vals.push(req.params.id, req.user.company_id);
            await pool.query(`UPDATE products SET ${fields.join(", ")} WHERE product_id = ? AND company_id = ?`, vals);
        }
        res.json(await getProductByIdAndCompany(req.params.id, req.user.company_id));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const [txns] = await pool.query("SELECT transaction_id FROM transactions WHERE product_id = ? AND company_id = ? LIMIT 1", [req.params.id, req.user.company_id]);
        if (txns.length > 0) return res.status(400).json({ error: "Cannot delete product with existing transactions" });
        await pool.query("DELETE FROM products WHERE product_id = ? AND company_id = ?", [req.params.id, req.user.company_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
