//pull a list of all users in database

import { NextRequest } from 'next/server';
import { getSession } from '@/actions';

//this is about as simple as you can get for creating an API route lol
export const GET = async (request:  NextRequest) => {

    try{
        const session = await getSession()
        //console.log('1s')
        return new Response(JSON.stringify({ resp: session }), { status: 200});
    }
    catch(error){
        return new Response(JSON.stringify({ error: error }), { status: 500});
    }
}