//import { EmailTemplate } from '@/components/emailtemplate'; //-> reccomended we use this but im not sure i care lol
import { Resend } from 'resend';
import { getSession } from '@/actions';
import { NextRequest } from 'next/server';
import { getPeriod, getPeriodNow } from '@/utils/payperiod';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // this is so gas actually


const resend = new Resend(process.env.RESEND_API_KEY);
//console.log(process.env.RESEND_API_KEY);

export const GET = async (request:  NextRequest) => {
    //important setup
    const { searchParams } = request.nextUrl;
    const day = searchParams.get('day') || '';
    const pdf = searchParams.get('pdf') || '';
    const type = searchParams.get('type') || '';
    const extraInfo:string = '';
    const session = await getSession();
    let names:string[] = session.userId!.split('/')

    if(session.isLoggedIn==false || pdf=='') return new Response(JSON.stringify({error: 'issue with request'}), {status: 200});// get defensive

    //assemble our dictionary from a string
    let list = pdf.split(';');
    var dict: {[id: string] : string} = {};
    var jdict: {[id: string] : string} = {};
    var daysworked=0;
    list.map((item)=>{
        let line = item.split(':')
        
        dict[line[0]]=line[1]
        jdict[line[0]]=line[2]
        if(line[1]){
            daysworked+=1;
        }
    })

    //console.log(daysworked);

    const period = getPeriodNow();

    //BELOW THIS POINT IS COPIED IN FROM THE OLD PDF SOLUTION, ITS ESSENTIALLY DUPLICATE CODE
    const doc = new jsPDF();
    let data:string[][] = []
    let dinf=''
    let jinf=''
    let w = ''
    let strdict=''

    period.map((day) => {    // we can do this better, and should pop this out into a util probably
        strdict+=day+':'+dict[day]+';';
        dict[day] ? dinf = dict[day] : dinf = '';
        jdict[day] ? jinf = jdict[day] : jinf = '';
        dict[day] ? w = '[X]' : w ='[  ]'
        data.push([day, w, dinf, jinf])
    })

    doc.text('report for: '+ names[0] + ' ' + names[1], 100, 10, {align: 'center'})
    //make pdf
    autoTable(doc, { 
        head: [["date","worked?","vessel", "job"]], 
        body: data,
    })
    doc.text('days worked: '+daysworked, 100, 100, {align: 'center'})
    doc.text('crew type: '+type, 100, 120, {align: 'center'})
    doc.setFontSize(12)
    //doc.addFont('ComicSansMS', 'Comic Sans', 'normal');
    doc.text(
        'I, '+ names[0] + ' ' + names[1] +', acknowledge and certify that the information \non this document is true and accurate', 
        100,    
        170, 
        {align: 'center'}
    )
    let pds = doc.output()
    //return {error: 'block here'} //to stop us from gettin email
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // we will change this probably
            to: 'dayrate@tdi-bi.com',
				//'dayratereportdonotrespond@gmail.com', ', // swap for dev/prod
            subject: 'travel report for ' + names[0] + ' ' + names[1] + ' from period starting ' + day + extraInfo,
            text: 
                'the following attached file is a travel report for '+ names[0] + ' ' + 
                names[1] + ' @ ' + session.userEmail +' for pay period starting on' + day + 
                extraInfo,
            attachments:[
                {
                  filename:"report_for_"+session.username+"_"+day+".pdf",
                  content: btoa(pds),
                }
              ]
        });

		//console.log(data)
        //console.log('no error, sent')
        return Response.json(data);
    } catch (error:any) {
        //console.log('some error occured')
        if(error instanceof Error){
            return  new Response(JSON.stringify({ error: error.message }), {status: 200});
        }
    }
}
