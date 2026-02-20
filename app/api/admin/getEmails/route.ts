import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  const connection = await connectToDb();
  const session = await getSession();
  try {

    const {searchParams} = new URL(request.url);
    const user = searchParams.get("user")?.trim() || null;
    const status = searchParams.get("status")?.trim() || null;
    const page = parseInt(searchParams.get("page") || "1");
    console.log(page);
    const limit = 13; // can flex this
    const offset = (page - 1) * limit;

    let q = `SELECT id, body, sentTo, status, subject, date
             FROM emails`;
    const where: string[] = [];
    const params: string[] = [];

    if (user) {
      where.push(`sentTo LIKE ?`);
      params.push(`%${user}%`);
    }

    if (status === '1') {
      where.push(`status LIKE ?`);
      params.push(`%Fail%`);
    }

    if (where.length > 0) {
      q += ` WHERE ` + where.join(" AND ");
    }

    q += ` ORDER BY id DESC LIMIT ?, ?`;
    params.push(String(offset), String(limit));


    const [adminCheck] = await connection.execute(
      "SELECT isAdmin FROM users WHERE upid = ?",
      [session.upid]
    );
    if (!(adminCheck as any[])[0]?.isAdmin) {
      await connection.end();
      return NextResponse.json({success: false, error: "unauthorized"}, {status: 403});
    }
    const [rows] = await connection.execute(q, params);
    connection.end();

    return new Response(JSON.stringify({emails: rows}), {
      status: 200,
      headers: {'Content-Type': 'application/json'}
    });

  } catch (error) {
    connection.end();
    console.error('API Error:', error);
    return new Response(JSON.stringify({error: "Internal server error"}), {
      status: 500,
      headers: {'Content-Type': 'application/json'}
    });
  }
};