//pull a list of all users in database

import { NextRequest } from "next/server";
import { getSession } from "@/actions";
import { connectToDb } from "@/utils/connectToDb";

//this is about as simple as you can get for creating an API route lol
export const GET = async (request: NextRequest) => {
    const { searchParams } = request.nextUrl; // getters

    const crew = Boolean(Number(searchParams.get("c")));

    //block non-admins
    const session = await getSession(); // blocks if not admin cookie
    if (!session.isLoggedIn)
        return new Response(JSON.stringify({ error: "not logged in" }), {
            status: 500,
        });

    //build query

    const connection = await connectToDb();
    try {
        //execute query
        const updateCrewQ =
            "UPDATE users SET isDomestic=" +
            crew +
            " WHERE username='" +
            session.username +
            "';";
        const r1 = await connection.execute(updateCrewQ)

        const updateCrewDayQ = 
            "UPDATE days SET ship='" +
            Number(crew) + 
            "' WHERE day='-1' AND username='" +
            session.username +
            "';";
        console.log(updateCrewDayQ)
        const r2 = await connection.execute(updateCrewDayQ)

        session.isDomestic = crew;
        await session.save();

        connection.end();
        return new Response(
            JSON.stringify({ resp: {
                updateUser: r1,
                updateDay: r2, 
                isDomestic: session.isDomestic
            } }),
            { status: 200 }
        );
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
};
