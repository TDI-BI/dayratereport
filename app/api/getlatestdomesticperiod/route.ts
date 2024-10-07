//pull a list of all users in database

import { connectToDb } from "@/utils/connectToDb";
import { getPeriod } from "@/utils/payperiod";

//this is about as simple as you can get for creating an API route lol
export const GET = async () => {
    //build query

    const connection = await connectToDb();
    try {
        //execute query

        const existsQuery =
            "SELECT id, date FROM periodstarts ORDER BY id DESC LIMIT 1;"; // this could totally just be a tuesday...
        //console.log(existsQuery)
        const dateret = JSON.parse(
            JSON.stringify(await connection.execute(existsQuery))
        )[0][0]["date"]; // gets the date

        let start = 0;
        getPeriod().includes(dateret) ? (start = 0) : (start = 1); // which week is the start of our period

        let p1 = [];
        let p2 = [];

        if (start) {
            p1 = getPeriod(1);
            p2 = getPeriod(0);
        } else {
            p1 = getPeriod(0);
            p2 = getPeriod(-1);
        }

        const retp: any[] = [];
        p1.map((e: any) => retp.push(e));
        p2.map((e: any) => retp.push(e));

        connection.end();
        return new Response(JSON.stringify({ resp: retp }), { status: 200 });
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
};
