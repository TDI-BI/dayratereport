import { NextRequest } from 'next/server';
import { getSession } from '@/actions';
import { getPeriod } from '@/utils/payperiod';
import { connectToDb } from '@/utils/connectToDb'

//this works on pulling individual days!

export const GET = async (request: NextRequest) => {
    const { searchParams } = request.nextUrl;
    const prev = (searchParams.get('prev') || '0')=='1';
    
    //query building
    const period = prev ? getPeriod(1) : getPeriod();
    let dparam:string = "(day='-1' ";
    period.forEach((item)=>{
        dparam+="or day='"+item+"'";
    });
    dparam+=")"
    //building the query like this feels deeply unserious but whatever lol
    
    const session = await getSession();
    //i need to find a way to wrap this in a function and call it
    //const { searchParams } = request.nextUrl; -> was originally passing the day but ive decided against it
    //const day = searchParams.get('day') || 'day_broken';
    const uid = session.username; // replace this with UID at some point
    const connection = await connectToDb();

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
        if(error instanceof Error){
        return new Response(JSON.stringify({ error: error.message }), { 
            // idk why this throws an eror, doesnt stop the program from running though so ill ignore it :)
            status: 500,
            headers: {
            'Content-Type': 'application/json',
            },
        });
        }
    }
}