//pull a list of all users in database

import { NextRequest } from "next/server";
import { getSession } from "@/actions";
import { connectToDb } from "@/utils/connectToDb";

//this is about as simple as you can get for creating an API route lol
export const GET = async (request: NextRequest) => {
    //block non-admins
    const session = await getSession();

    if (!session.isAdmin)
        return new Response(JSON.stringify({ error: "not an admin" }), {
            status: 500,
        });

    //build query
    const query = "SELECT username, uid, email, isDomestic, lastConfirm, isAdmin FROM users;"; // just omit passwod
    const connection = await connectToDb();
    try {
        //execute query
        const [results] = await connection.execute(query);
        connection.end();
        return new Response(JSON.stringify({ resp: results }), { status: 200 });
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
};
