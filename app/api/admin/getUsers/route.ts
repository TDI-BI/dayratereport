// pull a list of all users in database
import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  const session = await getSession();

  const connection = await connectToDb();
  try {
    const [adminCheck] = await connection.execute(
      "SELECT isAdmin FROM users WHERE email = ?",
      [session.email]
    );
    if (!(adminCheck as any[])[0]?.isAdmin) {
      await connection.end();
      return NextResponse.json({success: false, error: "unauthorized"}, {status: 403});
    }

    const [results] = await connection.execute(
      `SELECT u.username,
              u.firstName,
              u.lastName,
              u.email,
              u.isAdmin,
              u.isActive,
              u.workType,
              COALESCE(id.domesticId, f.fcId) AS id,
              id.domesticId IS NOT NULL       AS isDomestic
       FROM users u
                LEFT JOIN isDomestic id ON u.email = id.email
                LEFT JOIN isForeign f ON u.email = f.email
       ORDER BY u.lastName, u.firstName`
    );

    connection.end();
    return new Response(JSON.stringify({resp: results}), {status: 200});
  } catch (error) {
    connection.end();
    return new Response(JSON.stringify({error: error}), {status: 500});
  }
};