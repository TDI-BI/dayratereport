//import { EmailTemplate } from '@/components/emailtemplate'; //-> reccomended we use this but im not sure i care lol
import { Resend } from 'resend';
import { getSession } from '@/actions';
import { NextRequest } from 'next/server';


const resend = new Resend(process.env.RESEND_API_KEY);

export const GET = async (request:  NextRequest) => {
    const { searchParams } = request.nextUrl;
    const day = searchParams.get('day') || '';
    const pdf = searchParams.get('pdf') || '';

    //process string
    let pdl = pdf.split('nline')
    let pds=''
    pdl.forEach((item)=>{ // THIS WORKS !!!!!!!!!!!!!!!!!!!!!!!!!!
        pds+=item+' \n '
    })
    
    const session = await getSession();
    console.log(session.userEmail)
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: session.userEmail,
            subject: 'travel report for ' + session.username + ' from period starting ' + day + 'extra info',
            text: pds,

            attachments:[
                {
                  filename:"report_for_"+session.username+".pdf",
                  path:"https://www.google.com" //  i may want to pass a file link and read it here
                }
              ]
        });
        console.log('no error, sent')
        return Response.json(data);
    } catch (error) {
        console.log('some error occured')
        return Response.json({ error });
    }
}