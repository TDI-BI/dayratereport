import mysql from 'mysql2/promise';
import { NextRequest } from 'next/server';

export const GET = async (request:  NextRequest) => {
  //get our passed parameters
  const { searchParams } = request.nextUrl;
  const ship = searchParams.get('ship') || '';
  const day = searchParams.get('day') || '';
  const uid = searchParams.get('uid') || '';

  //i need to find a way to wrap this in a utility function and call it
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'eygwa',
    database: 'dayratereport',
  });
  try{ // esentially just making a homemade UPSERT here
    

    //we are gonna take our input here
    const values:string[] = []; // we probably want some overlap occuring here,
    //i just need to figure out how to make this pull anything lolge
    
    const query = "DELETE FROM days WHERE uid='"+uid+"' and day='"+day+"'"; // this properly deletes & covers overlap
    const [results] = await connection.execute(query, values);

    const query2 = "INSERT INTO days (uid, day, ship) VALUES ('"+uid+"','"+day+"','"+ship+"')";
    const [results2] = await connection.execute(query2, values);
    connection.end();
    return new Response(JSON.stringify({ resp: results2 }), {status: 200});

  }catch (error) { // try this ig, see if we spit an error
    return new Response(JSON.stringify({ error: error.message }), { status: 500});
  }
};