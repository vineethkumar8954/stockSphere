import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import jwt from "jsonwebtoken";
import { generateToken, authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ── Email Setup ───────────────────────────────────────────────────────────────
let etherealTransporter = null;  // Singleton only for Ethereal (requires async setup)

const createGmailTransporter = () => nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    pool: false  // Force new connection each time for reliability
});

const getEtherealTransporter = async () => {
    if (etherealTransporter) return etherealTransporter;
    console.log("⚠️  No SMTP credentials — creating Ethereal test account...");
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log(`✅ Ethereal account ready: ${testAccount.user}`);
    return etherealTransporter;
};

const sendEmail = async (to, subject, text, html) => {
    const useGmail = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    // Create fresh transporter for Gmail every time to avoid stale connection issues
    const t = useGmail ? createGmailTransporter() : await getEtherealTransporter();

    try {
        const info = await t.sendMail({
            from: useGmail
                ? `"StockSphere" <${process.env.SMTP_USER}>`
                : '"StockSphere" <no-reply@stocksphere.local>',
            to,
            subject,
            text,
            ...(html && { html })
        });

        console.log(`✅ Email sent to ${to}`);

        if (!useGmail) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log("\n╔══════════════════════════════════════════════════════════╗");
            console.log("║  📧  NEW EMAIL SENT — CLICK TO VIEW IN BROWSER            ║");
            console.log("╠══════════════════════════════════════════════════════════╣");
            console.log(`║  To:      ${to.padEnd(47)}║`);
            console.log(`║  Subject: ${subject.substring(0, 47).padEnd(47)}║`);
            console.log("╠══════════════════════════════════════════════════════════╣");
            console.log(`║  👉 ${(previewUrl || "Error getting URL").substring(0, 55)}║`);
            console.log("╚══════════════════════════════════════════════════════════╝\n");
        }
    } catch (err) {
        console.error("❌ Email send error:", err.message);
        throw err;  // Re-throw so the API returns a proper error instead of silent failure
    }
};


// ── POST /api/auth/register-admin ───────────────────────────────────────────
router.post("/register-admin", async (req, res) => {
    const { company_name, name, email, password } = req.body;
    if (!company_name || !name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [existing] = await connection.query("SELECT user_id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) return res.status(409).json({ error: "Email already registered" });

        const [company] = await connection.query("INSERT INTO companies (name) VALUES (?)", [company_name]);
        const companyId = company.insertId;

        const hashed = await bcrypt.hash(password, 12);
        const [userRes] = await connection.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES (?, ?, ?, 'Admin', ?, 'active')",
            [name, email, hashed, companyId]
        );

        const [[user]] = await connection.query(
            "SELECT user_id AS id, name, email, role, company_id FROM users WHERE user_id = ?",
            [userRes.insertId]
        );

        await connection.commit();
        const token = generateToken(user);
        res.status(201).json({ token, user });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// ── POST /api/auth/register-customer (Sign Up & Send Verification Email) ─────
router.post("/register-customer", async (req, res) => {
    let { email, name, password, company_name } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existingUser] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ error: "Email is already registered. Please sign in." });
        }

        // Option C: Multi-tenant — create a brand new company for every user
        const newCompanyName = company_name?.trim() || `${name}'s Store`;
        const [companyRes] = await connection.query(
            "INSERT INTO companies (name) VALUES (?)", [newCompanyName]
        );
        const company_id = companyRes.insertId;

        const hashed = await bcrypt.hash(password, 12);

        // Create user as Customer of their own company, pending email verification
        await connection.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES (?, ?, ?, 'Customer', ?, 'pending_verification')",
            [name, email, hashed, company_id]
        );

        await connection.commit();

        // Generate email verification token (outside transaction)
        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60000); // 24 hours

        await pool.query("DELETE FROM otp_codes WHERE email = ?", [email]);
        await pool.query("INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)", [email, token, expiresAt]);

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
        const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

        const verificationEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td align="center" style="padding:40px 40px 30px;">
          <div style="background:#0d9488;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <img src="https://img.icons8.com/ios-filled/50/ffffff/box.png" width="36" height="36" alt="StockSphere" style="display:block;" />
          </div>
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">StockSphere</h1>
        </td></tr>
        <!-- Body -->
        <tr><td align="center" style="padding:0 40px 32px;">
          <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0d9488;">Verify your email</h2>
          <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.6;">Click the button below to verify your email and activate your account.</p>
          <a href="${verificationLink}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;">Verify Email</a>
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding:20px 40px 36px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">If you didn't create an account, you can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await sendEmail(
            email,
            "StockSphere - Verify your email",
            `Welcome to StockSphere! Click the link below to verify your account:\n\n${verificationLink}\n\nThis link expires in 15 minutes.`,
            verificationEmailHtml
        );

        res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// ── POST /api/auth/resend-verification ──────────────────────────────────────
router.post("/resend-verification", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    try {
        const [[user]] = await pool.query("SELECT * FROM users WHERE email = ? AND status = 'pending_verification'", [email]);
        if (!user) return res.json({ message: "If your account needs verification, a new link has been sent." });

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60000); // 24 hours
        await pool.query("DELETE FROM otp_codes WHERE email = ?", [email]);
        await pool.query("INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)", [email, token, expiresAt]);

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
        const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;"><tr><td align="center"><table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td align="center" style="padding:40px 40px 30px;"><div style="background:#0d9488;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;"><img src="https://img.icons8.com/ios-filled/50/ffffff/box.png" width="36" height="36" alt="StockSphere" style="display:block;" /></div><h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">StockSphere</h1></td></tr><tr><td align="center" style="padding:0 40px 32px;"><h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0d9488;">Verify your email</h2><p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.6;">Click the button below to verify your email and activate your account.</p><a href="${verificationLink}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;">Verify Email</a></td></tr><tr><td align="center" style="padding:20px 40px 36px;border-top:1px solid #f3f4f6;"><p style="margin:0;font-size:12px;color:#9ca3af;">If you didn't create an account, you can ignore this email.</p></td></tr></table></td></tr></table></body></html>`;

        await sendEmail(email, "StockSphere - New Verification Link", `Verify your account: ${verificationLink}`, html);
        res.json({ message: "If your account needs verification, a new link has been sent." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/auth/verify-email (Activate Account & Login) ───────────────────
router.post("/verify-email", async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Verification token is required" });

    try {
        const [[record]] = await pool.query(
            "SELECT email FROM otp_codes WHERE otp = ? AND expires_at > NOW()",
            [token]
        );
        if (!record) return res.status(400).json({ error: "Invalid or expired verification link" });

        const email = record.email;

        // Activate user
        await pool.query("UPDATE users SET status = 'active' WHERE email = ?", [email]);
        await pool.query("DELETE FROM otp_codes WHERE email = ?", [email]);

        // Fetch user object to login
        const [[user]] = await pool.query(
            "SELECT user_id AS id, name, email, role, company_id FROM users WHERE email = ?",
            [email]
        );

        if (!user) return res.status(404).json({ error: "User not found" });

        const tokenJwt = generateToken(user);
        res.json({ token: tokenJwt, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    try {
        // Find user by email regardless of status first
        const [[user]] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (!user) return res.status(401).json({ error: "No account found with that email address." });

        // Check if account is unverified
        if (user.status === 'pending_verification') {
            return res.status(403).json({ error: "Please verify your email before signing in. Check your inbox for the verification link." });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Incorrect password. Please try again." });

        const safeUser = { id: user.user_id, name: user.name, email: user.email, role: user.role, company_id: user.company_id };
        const token = generateToken(safeUser);
        res.json({ token, user: safeUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const [[user]] = await pool.query(
            "SELECT user_id AS id, name, email, role, company_id FROM users WHERE user_id = ?",
            [req.user.id]
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const [[user]] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        // Always respond with success to prevent email enumeration
        if (!user) return res.json({ message: "If that email exists, a reset link has been sent." });

        const resetToken = uuidv4();
        const expiresAt = new Date(Date.now() + 30 * 60000); // 30 minutes

        await pool.query("DELETE FROM otp_codes WHERE email = ?", [email]);
        await pool.query("INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)", [email, `reset_${resetToken}`, expiresAt]);

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        const resetEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding:40px 40px 30px;">
          <div style="background:#0d9488;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <img src="https://img.icons8.com/ios-filled/50/ffffff/box.png" width="36" height="36" alt="StockSphere" style="display:block;" />
          </div>
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">StockSphere</h1>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 32px;">
          <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0d9488;">Reset your password</h2>
          <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.6;">Click the button below to reset your password. This link expires in 30 minutes.</p>
          <a href="${resetLink}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;">Reset Password</a>
        </td></tr>
        <tr><td align="center" style="padding:20px 40px 36px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">If you didn't request a password reset, you can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await sendEmail(
            email,
            "StockSphere - Reset your password",
            `Click the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 30 minutes.`,
            resetEmailHtml
        );

        res.json({ message: "If that email exists, a reset link has been sent." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and new password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    try {
        const [[record]] = await pool.query(
            "SELECT email FROM otp_codes WHERE otp = ? AND expires_at > NOW()",
            [`reset_${token}`]
        );
        if (!record) return res.status(400).json({ error: "Invalid or expired reset link" });

        const hashed = await bcrypt.hash(password, 12);
        // Update password AND activate account (reset proves email ownership)
        await pool.query("UPDATE users SET password = ?, status = 'active' WHERE email = ?", [hashed, record.email]);
        await pool.query("DELETE FROM otp_codes WHERE email = ?", [record.email]);

        res.json({ message: "Password reset successfully. You can now sign in." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/auth/super-admin-login ─────────────────────────────────────────
router.post("/super-admin-login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    if (
        email !== process.env.SUPER_ADMIN_EMAIL ||
        password !== process.env.SUPER_ADMIN_PASSWORD
    ) {
        return res.status(401).json({ error: "Invalid super admin credentials" });
    }
    const token = jwt.sign({ role: "SuperAdmin", email }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, email });
});

export default router;
