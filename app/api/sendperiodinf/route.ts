//import { EmailTemplate } from '@/components/emailtemplate'; //-> reccomended we use this but im not sure i care lol
import { Resend } from 'resend';
import { getSession } from '@/actions';

const resend = new Resend(process.env.RESEND_API_KEY);

export const GET = async () => {
    
    const session = await getSession();
    console.log(session.userEmail)
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: session.userEmail,
            subject: 'lets test ehe ability to handle events',
            html: '<p><strong>we should have an image attached here</strong></p>',
            /*attachments:[
                {
                  filename:"icon.jpg",
                  path:"http://localhost:3000/files/GMZ5PqzWEAAvKdI.jpg" //  i may want to pass a file link and read it here
                }
              ]*/
        });

        return Response.json(data);
    } catch (error) {
        return Response.json({ error });
    }
}
