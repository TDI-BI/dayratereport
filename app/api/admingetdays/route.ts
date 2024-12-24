import { NextRequest } from "next/server";
import { getSession } from "@/actions";
import { connectToDb } from "@/utils/connectToDb";
import { getPeriod } from "@/utils/payperiod";

export const GET = async (request: NextRequest) => {
    const { searchParams } = request.nextUrl;
    const prev = Number(searchParams.get("prev") || "0");
    const tot = Number(searchParams.get("tot") || "1");
    // Get session and check admin status
    const session = await getSession();
    if (!session.isAdmin) {
        return new Response(JSON.stringify({ error: "not an admin" }), {
            status: 500,
        });
    }

    const periodDates:string[] = [];

    for (let i=0; i<tot; i++){
        getPeriod(prev+i).map((e:string)=>periodDates.push(e))
    }
    
    // Build query with parameterized values
    const query = `
        SELECT * FROM days 
        WHERE day IN (${periodDates.map(() => '?').join(',')})
        ORDER BY day ASC
    `;

    const connection = await connectToDb();
    
    try {
        // Execute query with the dates array as parameters
        const [results] = await connection.execute(query, periodDates);
        connection.end();
        return new Response(JSON.stringify({ resp: results }), { 
            status: 200,
        });
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: error }), { 
            status: 500,
        });
    }
};