//insert users account into our database

import { getSession } from '@/actions';
import { NextRequest } from 'next/server';
import { connectToDb } from '@/utils/connectToDb'

export const GET = async (request: NextRequest) => {

    //block if the user is logged in
    const session = await getSession();
    if(session.isLoggedIn) return new Response(JSON.stringify({ error: 'already logged in' }), { status: 500});

    //get URL parameters
    const { searchParams } = request.nextUrl;
    const username = searchParams.get('username') || '';
    const password = searchParams.get('password') || '';
    const fullname = searchParams.get('fullname') || '';
    const email = searchParams.get('email') || '';

    //estab. connection
    const connection = await connectToDb();

    try {
        //check simmilar account exists
        const query = "select * from users where username='"+username+"' or email='"+email+"' or uid='"+fullname+"'";
        const [results] = await connection.execute(query);
        //block if we find a result
        if(String(results)) return new Response(JSON.stringify({error: 'account exists'}), { status: 500});

        //build query
        const query2= "insert into users (uid, password, username, email) values ('"+fullname+"','"+password+"','"+username+"','"+email+"')";

        //execute query
        const [results2] = await connection.execute(query2);
        connection.end();

        return new Response(JSON.stringify({ resp: results2 }), {status: 200});
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500});
        
    }
};