//debugging tool for testing db connection, just returns a list hello worlds

import { NextRequest } from 'next/server';
import { connectToDb } from '@/utils/connectToDb'

export const GET = async (request: NextRequest) => {

    //url params
    const { searchParams } = request.nextUrl;
    const msg = searchParams.get('msg') || 'hello world';

    //connect to databse
    const connection = await connectToDb();

    try {
        //build query
        const values: string[] = [msg]; // legacy, scared to delete but doesnt do anything
        const query = "SELECT * FROM msgs";
        
        //execute query
        const [results] = await connection.execute(query, values);
        connection.end();

        return new Response(JSON.stringify({ resp: results }), {status: 200});
    } catch (error) {
        connection.end();
        return new Response(JSON.stringify({ error: (error as Error).message }), {status: 500});
    }
    
};