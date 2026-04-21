import pool from "./db.js";

async function showData() {
    try {
        console.log("Fetching tables from database...\n");
        const [tables] = await pool.query("SHOW TABLES");

        if (tables.length === 0) {
            console.log("No tables found in the database.");
            process.exit(0);
        }

        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            console.log(`\n=========================================`);
            console.log(`         TABLE: ${tableName.toUpperCase()}`);
            console.log(`=========================================`);

            const [rows] = await pool.query(`SELECT * FROM ${tableName} LIMIT 10`);

            if (rows.length === 0) {
                console.log("Table is empty.\n");
            } else {
                console.table(rows);
            }
        }

    } catch (error) {
        console.error("Error connecting to database:", error);
    } finally {
        process.exit(0);
    }
}

showData();
