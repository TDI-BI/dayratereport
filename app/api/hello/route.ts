import mysql from 'mysql2/promise';
import { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
  //i need to find a way to wrap this in a function and call it
  const { searchParams } = request.nextUrl;
  const msg = searchParams.get('msg') || 'hello world';
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'eygwa',
    database: 'dayratereport',
  });

  try {
    const values: string[] = [msg];
    const query = "SELECT * FROM msgs where msg=(?)";
    
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