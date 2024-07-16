import { NextRequest } from 'next/server';
import { connectToDb } from '@/utils/connectToDb'

export const GET = async (request: NextRequest) => {
    const { searchParams } = request.nextUrl;
    const msg = searchParams.get('msg') || 'hello world';
    const connection = await connectToDb();

    try {
        const values: string[] = [msg];
        const query = "SELECT * FROM msgs";
        
        const [results] = await connection.execute(query, values);
        connection.end();

        return new Response(JSON.stringify({ resp: results }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }));
    }
};