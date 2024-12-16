//pull a list of all users in database

import { NextRequest } from "next/server";
import { getSession } from "@/actions";

//this is about as simple as you can get for creating an API route lol
export const GET = async (request: NextRequest) => {
    try {

        const session = await getSession();



        //attempting to dodge issue
        const response = new Response(JSON.stringify({ resp: session }), { status: 200 });
        response.headers.set('Access-Control-Allow-Origin', 'https://tdifielddays.com')
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        return response;
    } catch (error) {
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
};
