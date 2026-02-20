import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  //block non-admins
  const session = await getSession();
  const {searchParams} = request.nextUrl;
  const user = searchParams.get("upid") || '';
  const isActive = searchParams.get("active") === '1' || false;

  const connection = await connectToDb();

  const [adminCheck] = await connection.execute(
    "SELECT isAdmin FROM users WHERE upid = ?",
    [session.upid]
  );
  if (!(adminCheck as any[])[0]?.isAdmin) {
    await connection.end();
    return NextResponse.json({success: false, error: "unauthorized"}, {status: 403});
  }

  try {
    const query = `UPDATE users
                   SET isActive=?
                   WHERE upid = ?`;
    const extra: string[] = [(isActive ? '0' : '1'), user];
    const [resp] = await connection.execute(query, extra);
    console.log(resp);

    connection.end();
    return new Response(JSON.stringify({error: resp}), {
      status: 200,
    });

  } catch (e) {
    connection.end();
    console.error(e)
    return new Response(JSON.stringify({error: e}), {
      status: 500,
    });
  }

}