import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  //block non-admins
  const session = await getSession();
  const {searchParams} = request.nextUrl;
  const user = searchParams.get("uid") || "";
  const isAdmin = searchParams.get("admin") === 'true' || false;

  const connection = await connectToDb();

  try {
    const [adminCheck] = await connection.execute(
      "SELECT isAdmin FROM users WHERE upid = ?",
      [session.upid]
    );
    if (!(adminCheck as any[])[0]?.isAdmin) {
      await connection.end();
      return NextResponse.json({success: false, error: "unauthorized"}, {status: 403});
    }

    const q1 = `select isAdmin
                from users
                where upid = ?`;
    const [ourResp]: Array<any> = await connection.execute(q1, [user]);
    const ourAdminStat = ourResp[0].isAdmin;


    const query = `UPDATE users
                   SET isAdmin=?
                   WHERE uid = ?`;
    const extra: string[] = [(ourAdminStat == 1 ? '' : 'true'), user];
    const [resp] = await connection.execute(query, extra);
    console.log(resp);

    connection.end();
    return new Response(JSON.stringify({error: resp}), {
      status: 200,
    });

  } catch (e) {
    connection.end();
    return new Response(JSON.stringify({error: e}), {
      status: 500,
    });
  }

}