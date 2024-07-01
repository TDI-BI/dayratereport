import { NextRequest } from 'next/server';
import { getSession } from '@/actions';
import { connectToDb } from '@/utils/connectToDb'
import { getPeriod } from '@/utils/payperiod';

export const GET = async (request:  NextRequest) => {
    
    const session = await getSession();
    if(!session.isAdmin) return new Response(JSON.stringify({ error: 'not an admin' }), { status: 500});

    const query = "SELECT * FROM days"
    const connection = await connectToDb();

    try{
        const [results] = await connection.execute(query);
        connection.end();
        return new Response(JSON.stringify({ resp: results }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    }
    catch(error){
        return new Response(JSON.stringify({ error: error }), { status: 500});
    }
    

    
};