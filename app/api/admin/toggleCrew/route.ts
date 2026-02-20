import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  const session = await getSession();
  const {searchParams} = request.nextUrl;
  const upid = searchParams.get("upid") || "";

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

    const q1 = `SELECT isDomestic
                FROM USERS
                WHERE upid = ?`;
    const [ourResp]: Array<any> = await connection.execute(q1, [upid]);
    const ourCrew = ourResp[0].isDomestic;
    console.log(ourCrew);

    const query = `UPDATE users
                   SET isDomestic=?
                   WHERE upid = ?`;
    const extra: string[] = [(ourCrew === 1 ? '0' : '1'), upid];
    const [resp] = await connection.execute(query, extra);

    return new Response(JSON.stringify({resp: resp}), {
      status: 200,
    });
  } catch (err) {
    connection.end();
    console.log(err);
    return new Response(JSON.stringify({error: err}), {
      status: 500,
    });
  }


}