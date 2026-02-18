//pull a list of all users in database

import { NextRequest } from "next/server";
import { connectToDb } from "@/utils/connectToDb";

//this is about as simple as you can get for creating an API route lol
export const GET = async (request: NextRequest) => {
    const { searchParams } = request.nextUrl; // getters
    const passkey = searchParams.get("p") || ""; // secret passkey to ensure that our server is the only thing calling.

    if (passkey != process.env.SERVER_KEY)
        return new Response(JSON.stringify({ error: "incorrect key" }), {
            status: 500,
    });

    //build query

    const connection = await connectToDb();
    try {
        //execute query
        const pstart = new Date().toISOString().slice(0, 10);

        const existsQuery =
            "SELECT * FROM periodstarts WHERE date=?;";
        const dateret = JSON.parse(
            JSON.stringify(await connection.execute(existsQuery, [pstart]))
        )[0];

        if (dateret.length > 0) throw { error: "period start already exists" };

        const addDayQ =
            "INSERT INTO periodstarts (date) VALUES (?);"; // make sure to update this to be yesterday at some point
        const addret = await connection.execute(addDayQ, [pstart]);

        connection.end();
        return new Response(JSON.stringify({ resp: addret }), { status: 200 });
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
};
