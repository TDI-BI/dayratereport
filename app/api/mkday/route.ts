import { NextRequest } from 'next/server';
import { getSession } from '@/actions';
import { connectToDb } from '@/utils/connectToDb'
import { getPeriod } from '@/utils/payperiod';

export const GET = async (request:  NextRequest) => {
    const session = await getSession();
    //get our passed parameters
    const { searchParams } = request.nextUrl;
    const days = searchParams.get('days') || '';
    const domestic = searchParams.get('dom') || '0';
    //if(domestic) console.log('domestic')
    const uid = session.userId; // will update this to UID at some point, but not now ig
    const username = session.username;
        const period = getPeriod();
    //i need to find a way to wrap this in a utility function and call it
    const connection = await connectToDb();
    try{ // esentially just making a homemade UPSERT here

        if(!session.isLoggedIn) return new Response(JSON.stringify({error: "user not logged in "}), {status: 200});
        let list = days.split(';');
        var dict: {[id: string] : string} = {};
        var daysworked=0;
        list.map((item)=>{
            let line = item.split(':')
            dict[line[0]]=line[1]
            if(line[1]!='') daysworked+=1;
        })

        //build queries, 1 for clearing db and 2 for inserting into db
        var query1 = 'delete from days where (username="'+username+'") and (';
        var query2= 'insert into days (uid, day, ship, username) VALUES '
        period.map((day)=>{
            query1+='(day="'+day+'") or '
            query2+='("'+uid+'","'+day+'","'+dict[day]+'","'+username+'"),';
        })
        //update this to track domestic
        query2+='("","-1","'+domestic+'","'+username+'");'
        query1+='(day="-1"));';
        await connection.execute(query1);
        const [results] = await connection.execute(query2);

        return new Response(JSON.stringify({ resp: results }), {status: 200})
    }catch (error) { // try this ig, see if we spit an error
        if(error instanceof Error){
        return new Response(JSON.stringify({ error: error.message }), { status: 500});
        }
    }
};