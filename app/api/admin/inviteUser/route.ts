/*
+-------------+--------------+------+-----+-------------------+-------------------+
| Field       | Type         | Null | Key | Default           | Extra             |
+-------------+--------------+------+-----+-------------------+-------------------+
| id          | int          | NO   | PRI | NULL              | auto_increment    |
| pcid        | varchar(255) | YES  |     | NULL              |                   |
| firstName   | varchar(255) | NO   |     | NULL              |                   |
| lastName    | varchar(255) | NO   |     | NULL              |                   |
| email       | varchar(255) | NO   | UNI | NULL              |                   |
| token       | varchar(255) | NO   | UNI | NULL              |                   |
| tokenExpiry | datetime     | NO   |     | NULL              |                   |
| createdAt   | datetime     | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+-------------+--------------+------+-----+-------------------+-------------------+
you are given: pcid?, firstName, lastName, email
you need to insert an entry, token expiry should be 1 week from now.
after that, you need to call export const dispatchEmail = async (
  subject: string,
  contentType: 'HTML' | 'Text',
  body: string,
  to: string[],
  attachments: ourFileProps[] = []
);
to should be the userEmail, our content should have a link to: `${NEXT_PUBLIC_TYPE}${NEXT_PUBLIC_URL=192.168.1.197:3000}/login/register?token=tokena
 */
import {NextRequest} from "next/server";
import {connectToDb} from "@/utils/connectToDb";
import {dispatchEmail} from "@/utils/dispatchEmail";
import crypto from "crypto";

export const POST = async (request: NextRequest) => {
  const {upid, firstName, lastName, email} = await request.json();

  if (!firstName || !lastName || !email) {
    return new Response(
      JSON.stringify({error: "firstName, lastName, and email are required."}),
      {status: 400}
    );
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date();
  tokenExpiry.setDate(tokenExpiry.getDate() + 7);

  const connection = await connectToDb();
  try {
    await connection.execute(
      `INSERT INTO invited_users (pcid, firstName, lastName, email, token, tokenExpiry)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [upid ?? null, firstName, lastName, email, token, tokenExpiry]
    );

    const baseUrl = `${process.env.NEXT_PUBLIC_TYPE}${process.env.NEXT_PUBLIC_URL}`;
    const registrationLink = `${baseUrl}/login/register?token=${token}`;

    await dispatchEmail(
      "You've been invited to register!",
      "HTML",
      `
                <p>Hello ${firstName} ${lastName},</p>
                <p>You have been invited to register. Click the link below to complete your registration:</p>
                <p><a href="${registrationLink}">${registrationLink}</a></p>
                <p>This link will expire in 7 days.</p>
            `,
      [email]
    );

    return new Response(
      JSON.stringify({success: true}),
      {status: 201}
    );

  } catch (error) {
    if ((error as any)?.code === "ER_DUP_ENTRY") {
      return new Response(
        JSON.stringify({error: "A user with this email already exists."}),
        {status: 409}
      );
    }

    console.error("inviteUser error:", error);
    return new Response(
      JSON.stringify({error: (error as Error).message}),
      {status: 500}
    );

  } finally {
    connection.end();
  }
};