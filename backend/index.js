import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import companiesRouter from "./routes/companies.js";
import dashboardRouter from "./routes/dashboard.js";
import categoriesRouter from "./routes/categories.js";
import suppliersRouter from "./routes/suppliers.js";
import productsRouter from "./routes/products.js";
import transactionsRouter from "./routes/transactions.js";
import notificationsRouter from "./routes/notifications.js";
import superadminRouter from "./routes/superadmin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/products", productsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/superadmin", superadminRouter);

// ── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", db: process.env.DB_NAME }));

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || "Internal server error" });
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 StockSphere API running on http://localhost:${PORT}`);
    console.log(`📦 Database: ${process.env.DB_NAME}`);
});
