//import { EmailTemplate } from '@/components/emailtemplate'; //-> reccomended we use this but im not sure i care lol
import { Resend } from 'resend';
import { getSession } from '@/actions';
import { NextRequest } from 'next/server';


const resend = new Resend(process.env.RESEND_API_KEY);

export const GET = async (request:  NextRequest) => {
    const { searchParams } = request.nextUrl;
    const day = searchParams.get('day') || '';
    
    const session = await getSession();
    console.log(session.userEmail)
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: session.userEmail,
            subject: 'travel report for ' + session.username + ' from period starting ' + day,
            html: 
                "<p><strong>ultimately, we will be putting a report in here</strong></p>"+
                "<br> <p>but for now we will just have to deal with this demo</p>"+
                "<br> this file is unopenable, not worth trying",
            attachments:[
                {
                  filename:"report_for_"+session.username+".pdf",
                  path:"https://www.google.com" //  i may want to pass a file link and read it here
                }
              ]
        });

        return Response.json(data);
    } catch (error) {
        return Response.json({ error });
    }
}