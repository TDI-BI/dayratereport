//bsaically just our login script, we q the databse to get user info then send a recovery email

import { getPort } from "@/utils/getPort";
const por = getPort();
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
import { getSession } from "@/actions";
import { NextRequest } from "next/server";
import { connectToDb } from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
    //block if logged in
    const session = await getSession();
    if (session.isLoggedIn)
        return new Response(JSON.stringify({ error: "already logged in" }), {
            status: 500,
        });

    //get URL parameters
    const { searchParams } = request.nextUrl;
    const email = searchParams.get("email") || "";

    //init DB connection
    const connection = await connectToDb();

    try {
        //build query
        const query = "select * from users where email='" + email + "'";

        //execute query
        const [results] = await connection.execute(query);
        connection.end();
        if (JSON.stringify(results) === "[]") throw { error: "no accnt found" };
        const resp = JSON.parse(JSON.stringify(results));


        //send email
        resp.map(async (e: any) => {
            // should only ever give one result

            const htmlout = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>recovery emails</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
            <p style="font-size: 16px;">your recovery link can be accessed below</p>
            <p style="font-size: 16px;">this link is one time use, do not allow others to see this email</p>
    
            <a href="${process.env.NEXT_PUBLIC_TYPE}${por}/login/resetpassword?acc=${e.password}" style="color: #0066cc; text-decoration: none;">
                <div style="background-color: #0066cc; padding: 20px; border-radius: 10px; text-align: center; color:white">
                    <p style="font-size: 16px; font-weight:600;">Recover Account</p>
                </div>
            </a>    
    </div>
</body>
</html>
`
            //console.log(e);//debug line
            
            const data = await resend.emails.send({
                from: "recover@tdifielddays.com", // we will change this probably
                to: e.email, //e.email,
                subject: "recover your account",
                text:
                    'your username is "' +
                    e.username +
                    '"\n' +
                    "to recover your account please follow the link: " +
                    por +
                    "/login/resetpassword?acc=" +
                    e.password +
                    "\ndo not allow others to see/use this link. It can only be used once. do not reply to this email",
                html:htmlout,
            });
            
        });

        return new Response(JSON.stringify({ resp: "email sent" }), {
            status: 200,
        });
    } catch (error) {
        connection.end();
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500 }
        );
    }
};
