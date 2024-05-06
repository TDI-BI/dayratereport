import mysql from 'mysql2/promise';

export const GET = async (request: Request) => {
  //i need to find a way to wrap this in a function and call it
  const connection = await connectToDb();


  try {
    const query = "INSERT INTO msgs (msg) VALUES (?)";
    const values:string[] = ['another one'];
    const [results] = await connection.execute(query, values);
    connection.end();
    return new Response(JSON.stringify({ resp: results }), {status: 200});
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500});
  }
};