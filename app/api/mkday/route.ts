import mysql from 'mysql2/promise';

export const GET = async (request: Request) => {
  //i need to find a way to wrap this in a utility function and call it
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'eygwa',
    database: 'dayratereport',
  });
  try{ // esentially just making a homemade UPSERT here
    

    //we are gonna take our input here
    const values:string[] = ['uidtest', 'daytest', 'shiptest']; // we probably want some overlap occuring here,
    //i just need to figure out how to make this pull anything lolge
    
    const query = "DELETE FROM days WHERE day='2' and uid='1'"; // this properly deletes & covers overlap
    const [results] = await connection.execute(query, values);
    //connection.end();
    //return new Response(JSON.stringify({ resp: results }), {status: 200});

    const query2 = "INSERT INTO days (uid, day, ship) VALUES ('"+values[0]+"','"+values[1]+"','"+values[2]+"')";
    const [results2] = await connection.execute(query2, values);
    connection.end();
    return new Response(JSON.stringify({ resp: results2 }), {status: 200});



  }catch (error) { // try this ig, see if we spit an error
    return new Response(JSON.stringify({ error: error.message }), { status: 500});
  }
};