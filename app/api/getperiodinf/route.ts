//get period information for a user
import { NextRequest } from "next/server";
import { getSession } from "@/actions";
import { getPeriod } from "@/utils/payperiod";
import { connectToDb } from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {

    //block if you are already logged in
    const session = await getSession(); // block anyone not logged in
    //console.log(session); // this line is where the issue is happening :(, when i call it directly I get everything exactly as I want it however otherwise its just being annoying as fuck
    console.log('from api: ')
    console.log(session);
    if (!session.isLoggedIn){
        return new Response(JSON.stringify({ error: "not logged in" }), {
            status: 500,
        });
    }
    //get URL parameters

    //console.log('pre search param read')
    const { searchParams } = request.nextUrl;
    var prev = Number(searchParams.get("prev"));

    //console.log('pre query read')

    //query info building
    const period = getPeriod(prev);
    let dparam: string = "(day='-1' ";
    period.forEach((item) => {
        dparam += "or day='" + item + "'";
    });
    dparam += ")";

    // connections

    const connection = await connectToDb();

    const uid = session.username; // replace this with UID at some point

    try {
        //build query
        const values: string[] = []; // legacy code, scared to delete this but I dont use it i think
        const query =
            "SELECT * FROM days WHERE username='" + uid + "' AND " + dparam;

        //execute query
        const [results] = await connection.execute(query, values);
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

export const dynamic = 'force-dynamic'; // another way to try to break the caching, was just worth a try really