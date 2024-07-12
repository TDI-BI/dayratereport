//import { EmailTemplate } from '@/components/emailtemplate'; //-> reccomended we use this but im not sure i care lol
import { Resend } from 'resend';
import { NextRequest } from 'next/server';


const resend = new Resend(process.env.RESEND_API_KEY);

export const GET = async (request:  NextRequest) => {
    try {
        //return  new Response(JSON.stringify({ resp: 'fweh, bypassing emails for right now' }), {status: 200});
        const data = await resend.emails.send({
            from: 'reports@tdifielddays.com', // we will change this probably
            to: 'parkerseeley@tdi-bi.com',
            subject: 'test the email!',
            text: 
                'FEIN FEIN FEIN FEIN fweh',
        });

        return Response.json(data);
    } catch (error:any) {
        if(error instanceof Error){
            return  new Response(JSON.stringify({ error: error.message }), {status: 200});
        }
    }
}
