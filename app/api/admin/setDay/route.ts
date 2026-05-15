import {NextRequest} from "next/server";
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
      return new Response(JSON.stringify({error: "unauthorized"}), {status: 403});
    }

    const {searchParams} = request.nextUrl;
    const targetEmail = searchParams.get("email");
    const day = searchParams.get("day");
    const ship = searchParams.get("ship") ?? "";

    if (!targetEmail || !day) {
      await connection.end();
      return new Response(JSON.stringify({error: "missing email or day"}), {status: 400});
    }

    await connection.execute(
      "DELETE FROM days WHERE userEmail = ? AND day = ?",
      [targetEmail, day]
    );

    if (ship !== "") {
      await connection.execute(
        "INSERT INTO days (userEmail, day, ship) VALUES (?, ?, ?)",
        [targetEmail, day, ship]
      );
    }

    await connection.end();
    return new Response(JSON.stringify({resp: "ok"}), {status: 200});
  } catch (error) {
    await connection.end();
    return new Response(JSON.stringify({error: error}), {status: 500});
  }
};

export const dynamic = "force-dynamic";