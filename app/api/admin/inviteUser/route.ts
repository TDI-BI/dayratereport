import {NextRequest} from "next/server";
import {connectToDb} from "@/utils/connectToDb";
import {dispatchEmail} from "@/utils/dispatchEmail";
import crypto from "crypto";

export const POST = async (request: NextRequest) => {
  const {upid, firstName, lastName, email, type, crew} = await request.json();

  if (!upid || !firstName || !lastName || !email || !type) {
    return new Response(
      JSON.stringify({error: "upid, firstName, lastName, email, and type are required."}),
      {status: 400}
    );
  }

  const isDomestic = type === 'domestic';

  const connection = await connectToDb();
  try {
    // Check email uniqueness against registered users
    const [existingUsers] = await connection.execute(
      `SELECT email
       FROM users
       WHERE email = ?`,
      [email]
    );
    if ((existingUsers as any[]).length > 0) {
      await connection.end();
      return new Response(
        JSON.stringify({error: "A user with this email is already registered."}),
        {status: 409}
      );
    }

    // Check ID uniqueness against the correct table
    if (isDomestic) {
      const [existing] = await connection.execute(
        `SELECT email
         FROM isDomestic
         WHERE domesticId = ?`,
        [upid]
      );
      if ((existing as any[]).length > 0) {
        await connection.end();
        return new Response(
          JSON.stringify({error: "This Domestic ID is already assigned to another user."}),
          {status: 409}
        );
      }
    } else {
      const [existing] = await connection.execute(
        `SELECT email
         FROM isForeign
         WHERE fcId = ?`,
        [upid]
      );
      if ((existing as any[]).length > 0) {
        await connection.end();
        return new Response(
          JSON.stringify({error: "This Foreign Contractor ID is already assigned to another user."}),
          {status: 409}
        );
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 7);

    await connection.execute(
      `INSERT INTO invited_users (pcid, firstName, lastName, email, token, tokenExpiry, isDomestic, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [upid, firstName, lastName, email, token, tokenExpiry, isDomestic, type]
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

    await connection.end();
    return new Response(
      JSON.stringify({success: true}),
      {status: 201}
    );

  } catch (error) {
    await connection.end();
    console.error("inviteUser error:", error);
    return new Response(
      JSON.stringify({error: (error as Error).message}),
      {status: 500}
    );
  }
};