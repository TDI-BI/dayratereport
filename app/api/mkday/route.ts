//homebrew UPSERT to create/update days for a users period report

import { NextRequest } from 'next/server';
import { getSession } from '@/actions';
import { connectToDb } from '@/utils/connectToDb'
import { getPeriod } from '@/utils/payperiod';

export const GET = async (request:  NextRequest) => {
    
    //block if not logged in
    const session = await getSession();
    if(!session.isLoggedIn) return new Response(JSON.stringify({error: "user not logged in "}), {status: 500});

    //get session information
    const uid = session.userId; // will update this to UID at some point, but not now ig
    const username = session.username;

    //get URL parameters
    const { searchParams } = request.nextUrl;
    const days = searchParams.get('days') || '';
    const domestic = searchParams.get('dom') || '0';
    const prev = (searchParams.get('prev') || '0')=='1';
    const period = prev ? getPeriod(1) : getPeriod();

    //estab. connection
    const connection = await connectToDb();

    try{ // from here below is our homebrew upsert

        //build queries
        let query1 = 'delete from days where (username="'+username+'") and (';
        let query2= 'insert into days (uid, day, ship, username, type) VALUES ';

        let list = days.split(';'); // break down passed parameters
        let dict: {[day: string] : string[]} = {}; // day maps to ship and type
        let daysworked=0;
        list.map((item)=>{ // build dictionary
            let line = item.split(':');
            dict[line[0]]=[line[1], line[2]];
            if(line[1]!='') daysworked+=1;
        })

        period.map((day)=>{ // finish constructing query
            query1+='(day="'+day+'") or ';
            query2+='("'+uid+'","'+day+'","'+dict[day][0]+'","'+username+'","'+dict[day][1]+'"),';
        })
        query2+='("","-1","'+domestic+'","'+username+'", "");'
        query1+='(day="-1"));';

        const q3 = 'insert into logs (email, date, request, type) values ("'+session.userEmail+'", "'+new Date().toISOString()+'", \''+'q1='+query1 + ' and q2='+query2+'\', "save");'
        console.log(q3);
        await connection.execute(q3);

        await connection.execute(query1);
        //execute query
        const [results] = await connection.execute(query2);

        //create log
        connection.end();
        return new Response(JSON.stringify({ resp: results }), {status: 200});
    }catch (error) { 
        connection.end();
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500});
    }
};