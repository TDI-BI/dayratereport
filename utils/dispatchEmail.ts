import {connectToDb} from "@/utils/connectToDb";
//got rid of the ms graph packages we were using here -- they were all official but better safe than sorry?

//got rid of microsoft's npm packages
const getAccessToken = async () => {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", process.env.CLIENT_ID!);
    params.append("client_secret", process.env.CLIENT_SECRET!);
    params.append("scope", "https://graph.microsoft.com/.default");
    const response = await fetch(
        `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        }
    );

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Token request failed: ${JSON.stringify(data)}`);
    }

    return data.access_token;
};

interface ourFileProps {
    name: string,
    contentType: string,
    base64content: string
}

export const dispatchEmail = async (
    subject: string,
    contentType: 'HTML' | 'Text',
    body: string,
    to: string[],
    attachments: ourFileProps[] = [],
) => {

    const sender = 'no-reply@tdi-bi.com'; // u lowkey can send emails on anyone's behalf here so care
    const accessToken = await getAccessToken();


    const mail = {
        message: {
            subject: subject,
            body: {
                contentType: contentType,
                content: body,
            },
            toRecipients: to.map((usr) => ({
                emailAddress: {
                    address: usr,
                },
            })),
            attachments: attachments.map((att: ourFileProps) => ({
                '@odata.type': '#microsoft.graph.fileAttachment',
                name: att.name,                        // e.g., "invoice.pdf"
                contentBytes: att.base64content,      // base64-encoded file content (no data: prefix!)
                contentType: att.contentType || 'application/octet-stream', // optional, improves MIME accuracy
            })),
        },
        saveToSentItems: "false",
    };

    const connection = await connectToDb();

    const addLine = async (status: string) => {
        const q = `INSERT INTO emails
                   SET body=?, sentto=?, status=?, subject=?, date=?`;
        const vals = [body, JSON.stringify(to), status, subject, new Date().toISOString()];
        const [results] = await connection.execute(q, vals);
        console.log(results);
        return results;
    }

    try {
        await fetch(`https://graph.microsoft.com/v1.0/users/${sender}/sendMail`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mail),
            }
        );
        await addLine('Success:Email Successfully Dispatched');
        connection.end();
        return 'Success sending email!';
    } catch (error) {
        await addLine(`Failure: ${JSON.stringify(error)}`);
        connection.end();
        throw error;
    }


}