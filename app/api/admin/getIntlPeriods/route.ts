// /api/admin/getIntlPeriods/route.ts
// Returns assembled period data for international (foreign) crew.
// International periods are calendar-month based.
// `add` param adds additional past months to the payload.
// Frontend nav moves through the delivered weeks within the payload.

import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

// Returns all days in a given calendar month as YYYY-MM-DD strings
const getDaysInMonth = (year: number, month: number): string[] => {
  const days: string[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    days.push(date.toISOString().substring(0, 10));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Chunks an array of days into weeks (Mon-Sun) for frontend nav consistency
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
  if (current.length > 0) weeks.push(current); // partial final week
  return weeks;
};

export const GET = async (request: NextRequest) => {
  const session = await getSession();

  if (!session.isLoggedIn || !session.upid) {
    return NextResponse.json({success: false, error: "not logged in"}, {status: 401});
  }

  const connection = await connectToDb();
  try {
    // Verify admin
    const [adminCheck] = await connection.execute(
      "SELECT isAdmin FROM users WHERE upid = ?",
      [session.upid]
    );
    if (!(adminCheck as any[])[0]?.isAdmin) {
      await connection.end();
      return NextResponse.json({success: false, error: "unauthorized"}, {status: 403});
    }

    const {searchParams} = request.nextUrl;
    const add = Math.max(0, Number(searchParams.get("add") ?? 0));

    // Determine current month from server time in CST (matches getPeriod behavior)
    const nowCST = new Date(new Date().toLocaleDateString("en-US", {timeZone: "America/Chicago"}));
    const currentYear = nowCST.getFullYear();
    const currentMonth = nowCST.getMonth() + 1; // 1-indexed

    // Build list of months to include: current month + `add` past months
    const allDays: string[] = [];
    const weeks: string[][] = [];

    for (let i = 0; i <= add; i++) {
      // Go back i months from current
      let month = currentMonth - i;
      let year = currentYear;
      while (month <= 0) {
        month += 12;
        year -= 1;
      }

      const monthDays = getDaysInMonth(year, month);
      // Prepend so payload is chronological (oldest first)
      allDays.unshift(...monthDays);
    }

    // Chunk into Mon-Sun weeks for frontend nav
    // We need to align to week boundaries — find the first Monday
    const weekChunks = chunkIntoWeeks(allDays);
    weeks.push(...weekChunks);

    // Pull all day records for this range
    const [dayRows] = await connection.execute(
      `SELECT d.upid, d.day, d.ship
       FROM days d
       WHERE d.day IN (${allDays.map(() => "?").join(", ")})`,
      allDays
    );

    // Pull all active users
    const [userRows] = await connection.execute(
      `SELECT upid, firstName, lastName, email, isDomestic, lastConfirm
       FROM users
       WHERE isActive = 1
       ORDER BY lastName, firstName`
    );

    await connection.end();

    // Build lookup: upid -> { day -> ship }
    const daysByUpid: Record<string, Record<string, string>> = {};
    (dayRows as any[]).forEach((row) => {
      if (!daysByUpid[row.upid]) daysByUpid[row.upid] = {};
      daysByUpid[row.upid][row.day] = row.ship;
    });

    // Assemble payload — scaffold all days for every user
    const users = (userRows as any[]).map((user) => {
      const userDays: Record<string, string> = {};
      allDays.forEach((day) => {
        userDays[day] = daysByUpid[user.upid]?.[day] ?? "";
      });
      return {
        upid: user.upid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isDomestic: !!user.isDomestic,
        lastConfirm: user.lastConfirm ?? null,
        days: userDays,
      };
    });

    return NextResponse.json({
      success: true,
      resp: {
        weeks,   // string[][] chunked Mon-Sun, for frontend nav
        users,
      }
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