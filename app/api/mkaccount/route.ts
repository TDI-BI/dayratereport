//insert users account into our database

import { getSession } from "@/actions";
import { NextRequest } from "next/server";
import { connectToDb } from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
    //block if the user is logged in
    const session = await getSession();
    if (session.isLoggedIn)
        return new Response(JSON.stringify({ error: "already logged in" }), {
            status: 500,
        });

    //get URL parameters
    const { searchParams } = request.nextUrl;
    const username = searchParams.get("username") || "";
    const password = searchParams.get("password") || "";
    const fullname = searchParams.get("fullname") || "";
    const email = searchParams.get("email") || "";
    const isDomestic = searchParams.get("isdomestic");
    const isDomesticCheck = isDomestic == "domestic";

    //estab. connection
    const connection = await connectToDb();

    try {
        //check simmilar account exists
        const query =
            "select * from users where username=? or email=? or uid=?";
        const [results] = await connection.execute(query, [username, email, fullname]);
        //block if we find a result
        if (String(results))
            return new Response(JSON.stringify({ error: "account exists" }), {
                status: 500,
            });

        //build query
        const query2 =
            "insert into users (uid, password, username, email, isDomestic) values (?, ?, ?, ?, ?)";
        //execute query
        const [results2] = await connection.execute(query2, [fullname, password, username, email, isDomesticCheck]);
        connection.end();

        return new Response(JSON.stringify({ resp: results2 }), {
            status: 200,
        });
    } catch (error) {
        connection.end();
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500 }
        );
    }
};
