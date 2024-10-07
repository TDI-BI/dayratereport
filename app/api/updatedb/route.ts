//pull a list of all users in database

import { NextRequest } from "next/server";
import { getSession } from "@/actions";
import { connectToDb } from "@/utils/connectToDb";

//this is about as simple as you can get for creating an API route lol
export const GET = async (request: NextRequest) => {
    //block non-admins
    const session = await getSession(); // blocks if not admin cookie
    if (!session.isAdmin)
        return new Response(JSON.stringify({ error: "not an admin" }), {
            status: 500,
        });

    //build query

    const connection = await connectToDb();
    try {
        //execute query
        const locInfoQ = "SELECT * FROM days where day=-1;"; // fuck my stupid kappachungusdeluxe life
        const locInfo = JSON.parse(
            JSON.stringify(await connection.execute(locInfoQ))
        )[0];

        const updateUsersQuery =
            "ALTER TABLE users ADD COLUMN isDomestic boolean;";
        const updateUsers = connection.execute(updateUsersQuery);

        var qstart = "UPDATE users SET isDomestic = CASE ";
        var qend = "WHERE username IN (";
        locInfo.map((e: any) => {
            const isDomestic = e["ship"] == "1";
            const name = e["username"];
            qstart += "WHEN username = '" + name + "' THEN " + isDomestic + " ";
            qend += "'" + name + "', ";
        });
        qend = qend.slice(0, qend.length - 3);
        const fullQ = qstart + "ELSE isDomestic END " + qend + "')";

        const migrateCol = await connection.execute(fullQ);

        connection.end();
        return new Response(JSON.stringify({ resp: fullQ }), { status: 200 });
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
};
