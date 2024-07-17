// build a PDF and email it as an attachment to the user and dayrate
// theres probably a bug somewhere in this script, check logs in teh database for what im trcking to hunt it
import { Resend } from 'resend'; const resend = new Resend(process.env.RESEND_API_KEY);
import { getSession } from '@/actions';
import { NextRequest } from 'next/server';
import { getPeriod } from '@/utils/payperiod';
import { connectToDb } from '@/utils/connectToDb';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // this is so gas actually


export const GET = async (request:  NextRequest) => {
    //URL parameters
    const { searchParams } = request.nextUrl;
    const day = searchParams.get('day') || '';
    const pdf = searchParams.get('pdf') || '';
    const type = searchParams.get('type') || '';
    const prev = Number(searchParams.get('prev') || '0');

    //block if not logged in 
    const session = await getSession();
    if(session.isLoggedIn==false || pdf=='') return new Response(JSON.stringify({error: 'issue with request'}), {status: 500});

    //get session info
    let names:string[] = session.userId!.split('/');

    //datatype declarations
    let vesseldict: {[id: string] : string} = {};
    let jobdict: {[id: string] : string} = {};
    const doc = new jsPDF();
    let data:string[][] = [];
    let workedEh:string;
    let vesselinf:string;
    let jobinf:string;

    // var setup
    let list = pdf.split(';');
    let daysworked=0;
    
    list.map((item)=>{ // process input into dictionaries
        let line = item.split(':')
        vesseldict[line[0]]=line[1]
        jobdict[line[0]]=line[2]
        if(line[1]) daysworked+=1;
    });

    const period = getPeriod(prev);

    //setup data for autotable
    period.map((day) => { 
        vesseldict[day] ? vesselinf = vesseldict[day] : vesselinf = '';
        jobdict[day] ? jobinf = jobdict[day] : jobinf = '';
        vesseldict[day] ? workedEh = '[X]' : workedEh ='[  ]';
        data.push([day, workedEh, vesselinf, jobinf]);
    });

    // build our pdf
    doc.text('report for: '+ names[0] + ' ' + names[1], 100, 10, {align: 'center'});
    autoTable(doc, { 
        head: [["date","worked?","vessel", "job"]], 
        body: data,
    });
    doc.text('days worked: '+daysworked, 100, 100, {align: 'center'});
    doc.text('crew type: '+type, 100, 120, {align: 'center'});
    doc.setFontSize(12);
    doc.text(
        'I, '+ names[0] + ' ' + names[1] +', acknowledge and certify that the information \non this document is true and accurate', 
        100,    
        170, 
        {align: 'center'}
    );
    //get PDF as raw text string
    let pds = doc.output();

    //init connection
    const connection = await connectToDb();
    try {
        //build queries to log this report
        const query = 'UPDATE users set lastConfirm="'+(new Date()).toISOString().substring(0, 10)+'" where uid="'+session.userId+'";';
        const q2 = 'INSERT INTO logs (email, date, request, type) VALUES ("' + session.userEmail + '", "' + new Date().toISOString() + '", "' + pdf + '", "pdf generation");';

        //execute queries
        await connection.execute(query);
        await connection.execute(q2);
        connection.end();

        //send email
        const data = await resend.emails.send(
            {
            from: 'reports@tdifielddays.com',
            to: [session.userEmail!, 'dayratereportdonotrespond@gmail.com'],
				//'dayratereportdonotrespond@gmail.com', dayrate@tdi-bi.com', // swap for dev/prod
            subject: 'travel report for ' + names[0] + ' ' + names[1] + ' from period starting ' + day,
            text: 
                'the following attached file is a travel report for '+ names[0] + ' ' + 
                names[1] + ' @ ' + session.userEmail +' for pay period starting on ' + day + 
                ' \nWith issues email parkerseeley@tdi-bi.com. do not reply to this email. ',
            attachments:[
                {
                  filename:"report_for_"+session.username+"_"+day+".pdf",
                  content: btoa(pds),
                }
              ]
        });
        
        return Response.json({data}, {status: 200});
    } catch (error:any) {
        connection.end();
        return  new Response(JSON.stringify({ error: (error as Error).message }), {status: 500});
    }
}
