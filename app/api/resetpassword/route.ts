//updates hashed password in our user entry

import { getSession } from '@/actions';
import { NextRequest } from 'next/server';
import { connectToDb } from '@/utils/connectToDb' 

export const GET = async (request: NextRequest) => {

    //block if you are logged in... how would you even get here
    const session = await getSession();
    if(session.isLoggedIn) return new Response(JSON.stringify({ error: 'already logged in' }), { status: 500});

    //get URL parameters
    const { searchParams } = request.nextUrl;
    const password = searchParams.get('password') || '';
    const oldhash = searchParams.get('oldhash') || '';
    if(!oldhash || !password) return new Response(JSON.stringify({ error: 'something wrong with reset request' }), { status: 500});

    //i need to find a way to wrap this in a function and call it
    const connection = await connectToDb();

    try {
        //build query
        const query= "update users set password='"+password+"' where password='"+oldhash+"';";

        //execute query
        const [results] = await connection.execute(query);
        connection.end();

        return new Response(JSON.stringify({ resp: results }), {status: 200});
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500});
    }
};