
import { getSession } from '@/actions';
import { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
const bcrypt = require('bcrypt')    

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
    //ok for some reason trying to nest api calls inside eachother was just breaking everything so instead im gonna do this
    const query = "select * from users where username='"+username+"'";
    const [results] = await connection.execute(query);
    console.log(results)
    //if the password exists, return an error
    try {if(results[0].password)return {error: 'account exists'}}
    catch(error){/*continue*/} // if the password doesnt exist, we catch an error and continue

    const hashword = await bcrypt.hash(password, 10)

    //create our account
    const query2= "insert into users (uid, password, username) values ('"+username+"','"+hashword+"','"+username+"')"
    const [results2] = await connection.execute(query2);
    connection.end();
    return new Response(JSON.stringify({ resp: results2 }), {status: 200});
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500});
  }
};