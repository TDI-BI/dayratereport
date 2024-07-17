//debugging tool for testing db connection, just inserts 'another one' into our msgs table
import { connectToDb } from '@/utils/connectToDb'

export const GET = async (request: Request) => {
    //initiate connection
    const connection = await connectToDb();

    try {
        //build query
        const query = "INSERT INTO msgs (msg) VALUES (?)";
        const values:string[] = ['another one'];

        //execute query
        const [results] = await connection.execute(query, values);
        connection.end();

        return new Response(JSON.stringify({ resp: results }), {status: 200});
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: (error as Error).message }), {status: 500});
    }
};