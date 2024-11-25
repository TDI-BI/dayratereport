import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
import { NextRequest } from "next/server";

const htmlout = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Days Worked Sheet Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px; font-weight: 600;">Good morning crew,</p>
        <p style="font-size: 16px;">This is a friendly reminder to complete your days worked sheets.</p>
        <p style="font-size: 16px;">These submissions are due every Monday by 10:00 AM CST.</p>
        <p style="font-size: 16px;">The link to our web page is <a href="https://tdifielddays.com/" style="color: #0066cc; text-decoration: none;">https://tdifielddays.com/</a></p>
        <p style="font-size: 16px;">Thanks!</p>
        <p style="font-size: 16px; margin-bottom: 30px;">- Dayrate team</p>
        <a href="https://tdifielddays.com/" style="color: #0066cc; text-decoration: none;">
            <div style="background-color: #0066cc; padding: 20px; border-radius: 10px; text-align: center; color:white">
                <p style="font-size: 16px; font-weight:600;">click here to begin reporting</p>
            </div>
        </a>
    </div>
</body>
</html>
`

//import { port } from "@/utils/getport"; // will eventually need this

export const GET = async (request: NextRequest) => {
    const { searchParams } = request.nextUrl; // getters
    const passkey = searchParams.get("p") || ""; // secret passkey to ensure that our server is the only thing calling.

    if (passkey != process.env.SERVER_KEY)
        return new Response(JSON.stringify({ error: "incorrect key" }), {
            status: 500,
        });

    try {
        const data = await resend.emails.send({
            from: "reminders@tdifielddays.com", // we will change this probably
            to: [
                "all@tdi-bi.com", 
                "mariner@tdi-bi.com", 
                "proteus@tdi-bi.com", 
                "gyre@tdi-bi.com", 
                "brooksmccall@tdi-bi.com", 
                "emmamccall@tdi-bi.com", 
                "nautilus@tdi-bi.com", 
                "fcmariners@tdi-bi.com",
            ],
            reply_to: ["reminders@tdifielddays.com", "dayrate@tdi-bi.com"],
            //'dayratereportdonotrespond@gmail.com', dayrate@tdi-bi.com', // swap for dev/prod
            subject:
                "Field Days Worked Reminder",
            text:
                `
Good morning crew,\n
this is a friendly reminder to complete your days worked sheets.\n
These submissions are due every monday by 10AM CST.\n
The link to our web page is https://tdifielddays.com/\n

Thanks!\n
- Dayrate team\n    
            `,
            html: htmlout,
        });

        return Response.json({ data }, { status: 200 });
    }

    catch (e) {
        return new Response(
            JSON.stringify({ error: e }),
            { status: 500 }
        );
    }

}