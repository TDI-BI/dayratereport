// /api/admin/getDomesticPeriods/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";
import {getPeriod} from "@/utils/payperiod";

export const GET = async (request: NextRequest) => {
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

    const {searchParams} = request.nextUrl;
    const add = Math.max(0, Number(searchParams.get("add") ?? 0));

    const [periodRows] = await connection.execute(
      "SELECT date FROM periodstarts ORDER BY id DESC LIMIT 1"
    );
    const latestStart = (periodRows as any[])[0]?.date as string;
    if (!latestStart) {
      await connection.end();
      return NextResponse.json({success: false, error: "no period found"}, {status: 500});
    }

    const totalWeekPairs = 1 + add;
    const allDays: string[] = [];
    const weeks: string[][] = [];

    for (let pair = 0; pair < totalWeekPairs; pair++) {
      const week1 = getPeriod(pair * 2);
      const week2 = getPeriod(pair * 2 + 1);

      if (week1.includes(latestStart)) {
        weeks.unshift(week1, week2);
        allDays.unshift(...week1, ...week2);
      } else {
        weeks.unshift(week2, week1);
        allDays.unshift(...week2, ...week1);
      }
    }


    const [dayRows] = await connection.execute(
      `SELECT d.userEmail, d.day, d.ship, u.firstName, u.lastName
       FROM days d
                JOIN users u ON d.userEmail = u.email
       WHERE d.day IN (${allDays.map(() => "?").join(", ")})
       ORDER BY u.lastName, u.firstName`,
      allDays
    );

    const [userRows] = await connection.execute(
      `SELECT u.email,
              u.firstName,
              u.lastName,
              COALESCE(id.domesticId, f.fcId) AS userId,
              id.domesticId IS NOT NULL       AS isDomestic
       FROM users u
                LEFT JOIN isDomestic id ON u.email = id.email
                LEFT JOIN isForeign f ON u.email = f.email
       WHERE u.isActive = 1
       ORDER BY u.lastName, u.firstName`
    );

    await connection.end();

    const daysByEmail: Record<string, Record<string, string>> = {};
    (dayRows as any[]).forEach((row) => {
      if (!daysByEmail[row.userEmail]) daysByEmail[row.userEmail] = {};
      daysByEmail[row.userEmail][row.day] = row.ship;
    });

    const users = (userRows as any[]).map((user) => {
      const userDays: Record<string, string> = {};
      allDays.forEach((day) => {
        userDays[day] = daysByEmail[user.email]?.[day] ?? "";
      });
      return {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user.userId ?? null,
        isDomestic: Boolean(user.isDomestic),
        days: userDays,
      };
    });

    return NextResponse.json({
      success: true,
      resp: {weeks, users}
    }, {status: 200});

  } catch (error) {
    await connection.end();
    return NextResponse.json(
      {success: false, error: (error as Error).message},
      {status: 500}
    );
  }
};

export const dynamic = "force-dynamic";