import fs from "fs";
import path from "path";
import { connectToDb } from "@/utils/connectToDb";
import { NextRequest } from "next/server";

// Helper function to execute a query
const executeQuery = async (query: string, params: any[] = []) => {
    const connection = await connectToDb();
    try {
        const [results] = await connection.execute(query, params);
        return results;
    } finally {
        await connection.end();
    }
};

// API handler
export const GET = async (request: NextRequest) => {
    if (process.env.NODE_ENV !== "development") {
        return new Response(
            JSON.stringify({ error: "Cannot run this script in production" }),
            { status: 500 }
        );
    }

    try {
        // Read the JSON file
        const filePath = path.join(process.cwd(), "app/api/uploadships/shipjson.txt");
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8")).resp;

        console.log("Opened file");

        // Step 1: Clear `days_new` table
        await executeQuery(`TRUNCATE TABLE days_new`);
        console.log("Truncated days_new table");

        // Step 2: Insert data into `days_new`
        const insertQuery = `
          INSERT INTO days_new (uid, day, ship, username, type)
          VALUES (?, ?, ?, ?, ?)
        `;
        for (const item of jsonData) {
            await executeQuery(insertQuery, [
                item.uid || null,
                item.day || null,
                item.ship || null,
                item.username || null,
                item.type || null,
            ]);
        }

        console.log("Inserted data into days_new");

        // Step 3: Copy data from `days_new` to `days`
        await executeQuery(`
          TRUNCATE TABLE days; -- Clears existing data in the days table
        `);

        await executeQuery(`
          INSERT INTO days (uid, day, ship, username, type)
          SELECT uid, day, ship, username, type
          FROM days_new
        `);

        console.log("Copied data to days");

        return new Response(
            JSON.stringify({
                message: "Data imported and copied successfully!",
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to process data." }),
            { status: 500 }
        );
    }
};
