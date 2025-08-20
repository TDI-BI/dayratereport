//find and return a user from our user table

import { getSession } from "@/actions";
import { NextRequest } from "next/server";
import { connectToDb } from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
    //block if you are already logged in
    const session = await getSession();
    if (session.isLoggedIn)
        return new Response(JSON.stringify({ error: "already logged in" }), {
            status: 500,
        });

    //get url parameters
    const { searchParams } = request.nextUrl;
    const username = searchParams.get("username") || "";

    //initiate DB connection
    const connection = await connectToDb();

    try {
        //build query
        const query = "select * from users where username=?";

        //execute query
        const [results] = await connection.execute(query, [username]);
        connection.end();

        return new Response(JSON.stringify({ resp: results }), { status: 200 });
    } catch (error) {
        connection.end();
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500 }
        );
    }
};
