//literally jsut our login script but with email not username
import { getSession } from '@/actions';
import { NextRequest } from 'next/server';
import { connectToDb } from '@/utils/connectToDb'
import { Resend } from 'resend';
import { getPort } from '@/utils/getPort';
const resend = new Resend(process.env.RESEND_API_KEY);
const por = getPort()

export const GET = async (request: NextRequest) => {
    const session = await getSession();
    if(session.isLoggedIn) return new Response(JSON.stringify({ error: 'already logged in' }), { status: 500});

    const { searchParams } = request.nextUrl;
    const email = searchParams.get('email') || '';



    //i need to find a way to wrap this in a function and call it
    const connection = await connectToDb();

    try {
        const query = "select * from users where email='"+email+"'";
        const values:string[] = ['another one'];    
        const [results] = await connection.execute(query, values);
        if(JSON.stringify(results)==='[]') throw {error: 'pibby'}
        const fweh = JSON.parse((JSON.stringify(results)));
        fweh.map(async (e:any)=>{ // should only ever give one result
                const data = await resend.emails.send({
                    from: 'recover@tdifielddays.com', // we will change this probably
                    to: e.email,//e.email,
                    subject: 'recover your account',
                    text: 
                        'your username is "'+e.username+'"\n'+
                        'to recover your account please follow the link: https://'+por+'/login/resetpassword?acc='+e.password+
                        '\ndo not allow others to see/use this link. It can only be used once. do not reply to this email',
                        
                });
        })

        return new Response(JSON.stringify({ resp: 'fein' }), {status: 200});
    } catch (error) {
        if(error instanceof Error){
        return new Response(JSON.stringify({ error: error.message }), { status: 500});
        }
    }
};