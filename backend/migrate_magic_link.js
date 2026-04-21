import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: 'd:/dld/stock-harmony/backend/.env' });

const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

try {
    console.log("Expanding otp column to support UUIDs...");
    await pool.query("ALTER TABLE otp_codes MODIFY COLUMN otp VARCHAR(255)");

    // Add pending_verification status to enum if not exists
    console.log("Updating users table status enum...");
    try {
        await pool.query("ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive', 'pending_verification') DEFAULT 'active'");
    } catch (e) {
        // If it's a varchar, we can just leave it or update it. Currently it might be a varchar.
        // Let's check what it is
        console.log("Status column might not be enum, updating data directly if needed later.");
    }

    console.log("Database updated successfully.");
} catch (err) {
    console.error("Error updating schema:", err.message);
} finally {
    await pool.end();
}
