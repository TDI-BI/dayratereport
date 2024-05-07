
import { getSession } from '@/actions';
import { NextRequest } from 'next/server';
import { connectToDb } from '@/utils/connectToDb'
const bcrypt = require('bcrypt')    

export const GET = async (request: NextRequest) => {

  //return new Response(JSON.stringify({ error: 'test' }), { status: 500});
  const session = await getSession();
  //if(session.isLoggedIn) return new Response(JSON.stringify({ error: 'already logged in' }), { status: 500});

  const { searchParams } = request.nextUrl;
  const username = searchParams.get('username') || '';
  const password = searchParams.get('password') || '';
  const fullname = searchParams.get('fullname') || '';
  const email = searchParams.get('email') || '';

  //i need to find a way to wrap this in a function and call it
  const connection = await connectToDb();

  try {
    //ok for some reason trying to nest api calls inside eachother was just breaking everything so instead im gonna do this
    const query = "select * from users where username='"+username+"' or email='"+email+"' or uid='"+fullname+"'";
    //console.log(query);
    const [results] = await connection.execute(query);
    if(String(results)) return new Response(JSON.stringify({error: 'account exists'}), { status: 500});
    //clever solution to check if there are any results and return an error if our account exists

    const hashword = await bcrypt.hash(password, 10)

    //create our account
    const query2= "insert into users (uid, password, username, email) values ('"+fullname+"','"+hashword+"','"+username+"','"+email+"')"
    //console.log(query2)
    const [results2] = await connection.execute(query2);
    connection.end();
    return new Response(JSON.stringify({ resp: results2 }), {status: 200});
  } catch (error) {
    if(error instanceof Error){
      return new Response(JSON.stringify({ error: error.message }), { status: 500});
    }
  }
};