//pull a list of all users in database

import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

//this is about as simple as you can get for creating an API route lol
export const GET = async (request: NextRequest) => {
  //block non-admins
  const session = await getSession();

  //build query
  const query = "SELECT username, firstName, lastName, email, isDomestic, lastConfirm, isAdmin, isActive, workType, upid FROM users;"; // just omit passwod
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

    //execute query
    const [results] = await connection.execute(query);
    connection.end();
    return new Response(JSON.stringify({resp: results}), {status: 200});
  } catch (error) {
    connection.end();
    return new Response(JSON.stringify({error: error}), {status: 500});
  }
};
