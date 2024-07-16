import { NextRequest } from 'next/server';
import { getSession } from '@/actions';
import { getPeriod } from '@/utils/payperiod';
import { connectToDb } from '@/utils/connectToDb'

export const GET = async (request: NextRequest) => {

    //param getters
    const { searchParams } = request.nextUrl;
    const prev = (searchParams.get('prev') || '0')=='1';
    
    //query building
    const period = prev ? getPeriod(1) : getPeriod();
    let dparam:string = "(day='-1' ";
    period.forEach((item)=>{
        dparam+="or day='"+item+"'";
    });
    dparam+=")"
    
    //async getters
    const session = await getSession();
    const connection = await connectToDb();

    const uid = session.username; // replace this with UID at some point

    try {
        if(!session.isLoggedIn) return new Response(JSON.stringify({ error: "not logged in"}), {status: 200});
        const values: string[] = [];
        const query = "SELECT * FROM days WHERE username='"+uid+"' AND "+dparam; //q shuold generate
        //console.log(query)
        
        const [results] = await connection.execute(query, values);
        connection.end();

        return new Response(JSON.stringify({ resp: results }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },

        
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }));
    }
}