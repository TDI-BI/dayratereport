import mysql from 'mysql2/promise';
import { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
  //i need to find a way to wrap this in a function and call it
  const { searchParams } = request.nextUrl;
  const uid = searchParams.get('uid') || 'uid_broken';
  const day = searchParams.get('day') || 'day_broken';
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'eygwa',
    database: 'dayratereport',
  });

  try {
    const values: string[] = [];
    const query = "SELECT * FROM days WHERE uid='"+uid+"' AND day=' "+day+"'"; //q shuold generate
    
    const [results] = await connection.execute(query, values);
    connection.end();

    return new Response(JSON.stringify({ resp: results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      // idk why this throws an eror, doesnt stop the program from running though so ill ignore it :)
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};