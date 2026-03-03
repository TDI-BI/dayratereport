// /api/admin/updateUserInfo/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const POST = async (request: NextRequest) => {
  const session = await getSession();
  if (!session.isLoggedIn || !session.email) {
    return NextResponse.json({success: false, error: "not logged in"}, {status: 401});
  }

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

    const {email, firstName, lastName, username, domesticId, isActive, isAdmin} = await request.json();

    if (!email || !firstName || !lastName) {
      await connection.end();
      return NextResponse.json({success: false, error: "missing required fields"}, {status: 400});
    }

    // Update users table
    await connection.execute(
      `UPDATE users
       SET firstName = ?,
           lastName  = ?,
           username  = ?,
           isActive  = ?,
           isAdmin   = ?
       WHERE email = ?`,
      [firstName, lastName, username || null, isActive, isAdmin, email]
    );

    // Handle isDomestic — upsert if domesticId provided, delete if cleared
    if (domesticId) {
      await connection.execute(
        `INSERT INTO isDomestic (email, domesticId)
         VALUES (?, ?) ON DUPLICATE KEY
        UPDATE domesticId = ?`,
        [email, domesticId, domesticId]
      );
    } else {
      await connection.execute(
        `DELETE
         FROM isDomestic
         WHERE email = ?`,
        [email]
      );
    }

    await connection.end();
    return NextResponse.json({success: true}, {status: 200});

  } catch (error) {
    await connection.end();
    return NextResponse.json({success: false, error: (error as Error).message}, {status: 500});
  }
};