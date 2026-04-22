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

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    "https://main.d2ps4n55wo4erw.amplifyapp.com",
    "https://13-201-177-21.sslip.io",
    "http://localhost:8080",
    "http://localhost:5173",
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
}));

// ── Middleware ────────────────────────────────────────────────────────────────
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
