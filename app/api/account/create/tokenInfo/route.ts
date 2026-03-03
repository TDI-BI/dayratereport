import {NextRequest} from "next/server";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  const {searchParams} = request.nextUrl;
  const token = searchParams.get("token");

  if (!token) {
    return new Response(
      JSON.stringify({error: "Token is required."}),
      {status: 400}
    );
  }

  const connection = await connectToDb();
  try {
    const [rows]: any = await connection.execute(
      `SELECT pcid, firstName, lastName, email, tokenExpiry, createdAt
       FROM invited_users
       WHERE token = ?`,
      [token]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({error: "Invalid or expired token."}),
        {status: 404}
      );
    }

    const user = rows[0];

    if (new Date(user.tokenExpiry) < new Date()) {
      return new Response(
        JSON.stringify({error: "Token has expired."}),
        {status: 410}
      );
    }

    return new Response(
      JSON.stringify({success: true, user}),
      {status: 200}
    );

  } catch (error) {
    console.error("getInvitedUser error:", error);
    return new Response(
      JSON.stringify({error: (error as Error).message}),
      {status: 500}
    );

  } finally {
    connection.end();
  }
};