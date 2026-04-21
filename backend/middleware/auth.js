import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "stockharmony_secret";

export function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}

export function generateToken(user) {
    return jwt.sign(
        { id: user.id || user.user_id, name: user.name, email: user.email, role: user.role, company_id: user.company_id },
        JWT_SECRET,
        { expiresIn: "24h" }
    );
}
