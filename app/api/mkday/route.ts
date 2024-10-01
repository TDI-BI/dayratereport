//homebrew UPSERT to create/update days for a users period report

import { NextRequest } from 'next/server';
import { getSession } from '@/actions';
import { connectToDb } from '@/utils/connectToDb'
import { getPeriod } from '@/utils/payperiod';
import { error } from 'console';

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
    var prev = Number(searchParams.get('prev'));

    const period = getPeriod(prev);

    

    //estab. connection
    const connection = await connectToDb();

    try{ // from here below is our homebrew upsert

        //i need to set up some protection here to make sure you arent doing illegal stuff
        if(session.isDomestic) {
            
            const existsQuery = "SELECT id, date FROM periodstarts ORDER BY id DESC LIMIT 1;"; // this could totally just be a tuesday...
            const dateret = JSON.parse(JSON.stringify(await connection.execute(existsQuery)))[0][0]['date'] // gets the date
            console.log(getPeriod())
            const thingy = getPeriod().includes(dateret) ? prev=-1 || prev==0 : prev==1 || prev==0; 
            if(!thingy) throw {error: 'you are oob ...'}

        } else {
            const thismonth = (new Date).getMonth();
            const np = period.filter((e)=>((new Date(e)).getMonth() == thismonth))
            if(np.length==0) throw {error : 'you are oob ...'};
        }

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

        //debugging tool, commented otu for now
        /*
        const q3 = 'insert into logs (email, date, request, type) values ("'+session.userEmail+'", "'+new Date().toISOString()+'", \''+'q1='+query1 + ' and q2='+query2+'\', "save");'
        await connection.execute(q3);
        */
        
        await connection.execute(query1);
        //execute query
        const [results] = await connection.execute(query2);

        //create log
        connection.end();
        return new Response(JSON.stringify({ resp: results }), {status: 200});
    }catch (error) { 
        connection.end();
        return new Response(JSON.stringify({ error: error }), { status: 500});
    }
};