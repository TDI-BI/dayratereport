import mysql from 'mysql2/promise';

export const GET = async (request: Request) => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'eygwa',
    database: 'dayratereport',
  });

  try {
    const query = "SELECT * FROM msgs";
    const values:string[] = [];
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