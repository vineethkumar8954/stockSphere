import pool from "./db.js";

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at DATETIME NOT NULL,
                INDEX idx_email (email)
            )
        `);
        console.log("✅ otp_codes table ready");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration error:", err.message);
        process.exit(1);
    }
}
migrate();
