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

    const {email, firstName, lastName, username, id, isDomestic, isActive, isAdmin, type} = await request.json();

    if (!email || !firstName || !lastName) {
      await connection.end();
      return NextResponse.json({success: false, error: "missing required fields"}, {status: 400});
    }

    // Update users table
    await connection.execute(
      `UPDATE users
       SET firstName = ?,
           lastName  = ?,
           isActive  = ?,
           isAdmin   = ?,
           workType  = ?
       WHERE email = ?`,
      [firstName, lastName, isActive, isAdmin, type, email]
    );

    // Handle ID — enforce mutual exclusivity between isDomestic and isForeign
    if (id) {
      if (isDomestic) {
        await connection.execute(`DELETE
                                  FROM isForeign
                                  WHERE email = ?`, [email]);
        await connection.execute(
          `INSERT INTO isDomestic (email, domesticId)
           VALUES (?, ?) ON DUPLICATE KEY
          UPDATE domesticId = ?`,
          [email, id, id]
        );
      } else {
        await connection.execute(`DELETE
                                  FROM isDomestic
                                  WHERE email = ?`, [email]);
        await connection.execute(
          `INSERT INTO isForeign (email, fcId)
           VALUES (?, ?) ON DUPLICATE KEY
          UPDATE fcId = ?`,
          [email, id, id]
        );
      }
    } else {
      // ID cleared — remove from both tables
      await connection.execute(`DELETE
                                FROM isDomestic
                                WHERE email = ?`, [email]);
      await connection.execute(`DELETE
                                FROM isForeign
                                WHERE email = ?`, [email]);
    }

    await connection.end();
    return NextResponse.json({success: true}, {status: 200});

  } catch (error) {
    await connection.end();
    return NextResponse.json({success: false, error: (error as Error).message}, {status: 500});
  }
};