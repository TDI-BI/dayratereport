//pull a list of all users in database

import { NextRequest } from 'next/server';
import { connectToDb } from '@/utils/connectToDb'

//this is about as simple as you can get for creating an API route lol
export const GET = async (request:  NextRequest) => {

    const { searchParams } = request.nextUrl; // getters
    const passkey = Boolean(Number(searchParams.get('p'))); // this will be a secret passkey eventually to ensure our cromtask is the only thing that can access it
    


    //build query
    
    const connection = await connectToDb();
    try{
        //execute query
        const pstart = (new Date()).toISOString().slice(0, 10)

        const existsQuery = "SELECT * FROM periodstarts WHERE date='"+pstart+"';";
        const dateret =  JSON.parse(JSON.stringify(await connection.execute(existsQuery)))[0]

        if(dateret.length>0) throw {err: 'period start already exists'};

        const addDayQ = "INSERT INTO periodstarts (date) VALUES ('"+pstart+"');"; // make sure to update this to be yesterday at some point
        const addret =  await connection.execute(addDayQ)

        connection.end();
        return new Response(JSON.stringify({ resp: addret }), {status: 200});
    }
    catch(error){
        connection.end();
        return new Response(JSON.stringify({ error: error }), { status: 500});
    }
    

    
};