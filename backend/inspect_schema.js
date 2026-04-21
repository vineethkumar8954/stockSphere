import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = await mysql.createPool({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, waitForConnections: true, connectionLimit: 3
});

const tables = ['categories', 'suppliers', 'products', 'transactions', 'notifications'];
for (const t of tables) {
    const [rows] = await pool.query(`DESCRIBE ${t}`);
    console.log(`\n=== ${t} ===`);
    rows.forEach(r => console.log(`  ${r.Field} [${r.Type}] ${r.Key} ${r.Extra}`));
}
await pool.end();
