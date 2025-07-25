import {Client} from "@microsoft/microsoft-graph-client";
import {ClientSecretCredential} from "@azure/identity";
import {connectToDb} from "@/utils/connectToDb";

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

    //set these in dot env
    const tenantId: string = process.env.TENANT_ID ?? '';
    const clientId: string = process.env.CLIENT_ID ?? '';
    const clientSecret: string = process.env.CLIENT_SECRET ?? ''; // not hitting?
    console.log({tenID: tenantId, cliId: clientId, cli: clientSecret});
    const sender = 'no-reply@tdi-bi.com'; // u lowkey can send emails on anyone's behalf here so care

    const credential = new ClientSecretCredential(
        tenantId,
        clientId,
        clientSecret
    );
    const token = await credential.getToken("https://graph.microsoft.com/.default");

    const graphClient = Client.init({
        authProvider: (done) => {
            done(null, token.token);
        },
    });

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
        await graphClient.api(`/users/${sender}/sendMail`).post(mail);
        await addLine('Success:');
        connection.end();
        return 'Success sending email!';
    } catch (error) {
        await addLine(`Failure: ${JSON.stringify(error)}`);
        connection.end();
        throw error;
    }


}