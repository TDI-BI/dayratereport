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
