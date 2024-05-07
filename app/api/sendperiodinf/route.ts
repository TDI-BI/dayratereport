//import { EmailTemplate } from '@/components/emailtemplate'; //-> reccomended we use this but im not sure i care lol
import { Resend } from 'resend';
import { getSession } from '@/actions';
import { NextRequest } from 'next/server';


const resend = new Resend(process.env.RESEND_API_KEY);

export const GET = async (request:  NextRequest) => {
    //important setup
    const { searchParams } = request.nextUrl;
    const day = searchParams.get('day') || '';
    const pdf = searchParams.get('pdf') || '';
    const extraInfo:string = '';
    const session = await getSession();
    let names:string[] = session.userId!.split('/')

    if(session.isLoggedIn==false || pdf=='') return new Response(JSON.stringify({error: 'issue with request'}), {status: 200});// get defensive

    //process string
    let pdl = pdf.split('zNL')  
    let pds=''
    pdl.forEach((item)=>{ // THIS WORKS !!!!!!!!!!!!!!!!!!!!!!!!!!
        pds+=item+' \n '
    })
    
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // we will change this probably
            to: 'dayratereportdonotrespond@gmail.com', // hard set this
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
        //console.log('no error, sent')
        return Response.json(data);
    } catch (error) {
        //console.log('some error occured')
        if(error instanceof Error){
            return  new Response(JSON.stringify({ error: error.message }), {status: 200});
        }
    }
}