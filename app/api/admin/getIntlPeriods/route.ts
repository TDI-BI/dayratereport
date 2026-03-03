// /api/admin/getIntlPeriods/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

const getDaysInMonth = (year: number, month: number): string[] => {
  const days: string[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    days.push(date.toISOString().substring(0, 10));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const chunkIntoWeeks = (days: string[]): string[][] => {
  const weeks: string[][] = [];
  let current: string[] = [];
  days.forEach((day) => {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  });
  if (current.length > 0) weeks.push(current);
  return weeks;
};

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

    const nowCST = new Date(new Date().toLocaleDateString("en-US", {timeZone: "America/Chicago"}));
    const currentYear = nowCST.getFullYear();
    const currentMonth = nowCST.getMonth() + 1;

    const allDays: string[] = [];

    for (let i = 0; i <= add; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      while (month <= 0) {
        month += 12;
        year -= 1;
      }
      allDays.unshift(...getDaysInMonth(year, month));
    }

    const weeks = chunkIntoWeeks(allDays);

    const [dayRows] = await connection.execute(
      `SELECT d.userEmail, d.day, d.ship
       FROM days d
       WHERE d.day IN (${allDays.map(() => "?").join(", ")})`,
      allDays
    );

    const [userRows] = await connection.execute(
      `SELECT u.email, u.firstName, u.lastName
       FROM users u
                LEFT JOIN isDomestic id ON u.email = id.email
       WHERE u.isActive = 1
         AND id.email IS NULL
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