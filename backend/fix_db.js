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
    console.log("Updating users table role enum...");
    await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Staff', 'Customer') DEFAULT 'Staff'");
    console.log("Success! Role enum updated.");
} catch (err) {
    console.error("Error updating schema:", err.message);
} finally {
    await pool.end();
}
