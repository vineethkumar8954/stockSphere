import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: 'd:/dld/stock-harmony/backend/.env' });

const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

try {
    const [tables] = await pool.query("SHOW TABLES");
    console.log("Existing Tables:", tables.map(t => Object.values(t)[0]));

    const [otpDesc] = await pool.query("DESCRIBE otp_codes");
    console.log("\n=== otp_codes ===");
    otpDesc.forEach(r => console.log(`  ${r.Field} [${r.Type}]`));

    const [userDesc] = await pool.query("DESCRIBE users");
    console.log("\n=== users ===");
    userDesc.forEach(r => console.log(`  ${r.Field} [${r.Type}]`));
} catch (err) {
    console.error("Error inspecting database:", err.message);
} finally {
    await pool.end();
}
