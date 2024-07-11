import { getSession } from '@/actions';
import { NextRequest } from 'next/server';
import { connectToDb } from '@/utils/connectToDb'
const bcrypt = require('bcrypt')    

export const GET = async (request: NextRequest) => {

    //return new Response(JSON.stringify({ error: 'test' }), { status: 500});
    const session = await getSession();
    //if(session.isLoggedIn) return new Response(JSON.stringify({ error: 'already logged in' }), { status: 500});

    const { searchParams } = request.nextUrl;
    const password = searchParams.get('password') || '';
    const oldhash = searchParams.get('oldhash') || '';
    if(!oldhash || !password) return new Response(JSON.stringify({ error: 'something wrong with reset request' }), { status: 500});

    //i need to find a way to wrap this in a function and call it
    const connection = await connectToDb();

    try {
        //update our password
        const query2= "update users set password='"+password+"' where password='"+oldhash+"';"
        //(query2)
        const [results2] = await connection.execute(query2);
        connection.destroy();
        //console.log(results2)
        return new Response(JSON.stringify({ resp: results2 }), {status: 200});
    } catch (error) {
        if(error instanceof Error){
        return new Response(JSON.stringify({ error: error.message }), { status: 500});
        }
    }
};