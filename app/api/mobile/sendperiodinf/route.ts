//import { EmailTemplate } from '@/components/emailtemplate'; //-> reccomended we use this but im not sure i care lol
import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { getPeriod } from '@/utils/payperiod';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // this is so gas actually


const resend = new Resend(process.env.RESEND_API_KEY);

export const GET = async (request:  NextRequest) => {

    //important setup
    const { searchParams } = request.nextUrl;
    const day = searchParams.get('day') || '';
    const pdf = searchParams.get('pdf') || '';
    const uid = searchParams.get('uid')
    const username = searchParams.get('username')
    if(!uid || !username || !day || !pdf) return  new Response(JSON.stringify({ error: 'bad query' }), {status: 200});
    const extraInfo:string = '';
    let names:string[] = uid!.split('/')


    //assemble our dictionary from a string
    let list = pdf.split(';');
    var dict: {[id: string] : string} = {};
    var daysworked=0;
    list.map((item)=>{
        let line = item.split(':')
        dict[line[0]]=line[1]
        if(line[1]!='') daysworked+=1;
    })

    const period = await getPeriod();

    //BELOW THIS POINT IS COPIED IN FROM THE OLD PDF SOLUTION, ITS ESSENTIALLY DUPLICATE CODE
    const doc = new jsPDF();
    let data:string[][] = []
    let dinf=''
    let w = ''
    let strdict=''

    period.map((day) => {   
        strdict+=day+':'+dict[day]+';';
        dict[day] ? dinf = dict[day] : dinf = '';
        dict[day] ? w = '[X]' : w ='[  ]'
        data.push([day, w, dinf])
    })

    //make pdf
    autoTable(doc, { 
        head: [["date","worked?","ship"]], 
        body: data,
    })
    doc.text('days worked: '+daysworked, 100, 100, {align: 'center'})
    doc.setFontSize(12)
    //doc.addFont('ComicSansMS', 'Comic Sans', 'normal');
    doc.text(
        'I, '+ names[0] + ' ' + names[1] +', acknowledge and certify that the information \non this document is true and accurate', 
        100,    
        170, 
        {align: 'center'}
    )
    let pds = doc.output()

   
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // we will change this probably
            to: 'dayratereportdonotrespond@gmail.com', // hard set this
            subject: 'travel report for ' + names[0] + ' ' + names[1] + ' from period starting ' + day + extraInfo,
            text: 
                'the following attached file is a travel report for '+ names[0] + ' ' + 
                names[1] + ' @ ' + '{from mobile app}' +' for pay period starting on' + day + 
                extraInfo,
            attachments:[
                {
                  filename:"report_for_"+username+"_"+day+".pdf",
                  content: btoa(pds),
                }
              ]
        });
        //console.log('no error, sent')
        return Response.json(data);
    } catch (error) {
        //console.log('some error occured')
        if(error instanceof Error){
            return  new Response(JSON.stringify({ error: error.message }), {status: 200});
        }
    }
}