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
        const filePath = path.join(process.cwd(), "app/api/uploadusers/usersjson.txt");
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8")).resp;

        console.log("Opened usersjson.txt");

        // Step 1: Clear `users` table
        await executeQuery(`TRUNCATE TABLE users`);
        console.log("Truncated users table");

        // Step 2: Insert data into `users` table
        const insertQuery = `
          INSERT INTO users (uid, password, username, email, isAdmin, lastConfirm, isDomestic)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        for (const item of jsonData) {
            await executeQuery(insertQuery, [
                item.uid || null,
                item.password || null,
                item.username || null,
                item.email || null,
                item.isAdmin || null,
                item.lastConfirm || null,
                item.isDomestic ,
            ]);
        }

        console.log("Inserted data into users");

        return new Response(
            JSON.stringify({
                message: "User data imported successfully!",
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to process user data." }),
            { status: 500 }
        );
    }
};
