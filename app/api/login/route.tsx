
import { getSession } from '@/actions';
import { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

export const GET = async (request: NextRequest) => {
    const session = await getSession();
    if(session.isLoggedIn) return new Response(JSON.stringify({ error: 'already logged in' }), { status: 500});

    const { searchParams } = request.nextUrl;
    const username = searchParams.get('username') || '';
    const password = searchParams.get('password') || '';



  //i need to find a way to wrap this in a function and call it
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'eygwa',
    database: 'dayratereport',
  });

  try {
    const query = "select * from users where username='"+username+"' and password='"+password+"'";
    const values:string[] = ['another one'];
    const [results] = await connection.execute(query, values);
    connection.end();
    return new Response(JSON.stringify({ resp: results }), {status: 200});
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500});
  }
};