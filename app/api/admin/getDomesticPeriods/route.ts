// /api/admin/getDomesticPeriods/route.ts
// Returns assembled period data for the current domestic biweekly period
// plus any additional past weeks requested via the `add` param.
// Navigation of the payload is handled client-side.

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/actions";
import { connectToDb } from "@/utils/connectToDb";
import { getPeriod } from "@/utils/payperiod";

export const GET = async (request: NextRequest) => {
  const session = await getSession();

  if (!session.isLoggedIn || !session.upid) {
    return NextResponse.json({ success: false, error: "not logged in" }, { status: 401 });
  }

  // Verify admin
  const connection = await connectToDb();
  try {
    const [adminCheck] = await connection.execute(
      "SELECT isAdmin FROM users WHERE upid = ?",
      [session.upid]
    );
    if (!(adminCheck as any[])[0]?.isAdmin) {
      await connection.end();
      return NextResponse.json({ success: false, error: "unauthorized" }, { status: 403 });
    }

    // `add` = number of extra week-pairs to include going back in time (default 0 = just current period)
    const { searchParams } = request.nextUrl;
    const add = Math.max(0, Number(searchParams.get("add") ?? 0));

    // Get the current domestic period anchor from periodstarts
    const [periodRows] = await connection.execute(
      "SELECT date FROM periodstarts ORDER BY id DESC LIMIT 1"
    );
    const latestStart = (periodRows as any[])[0]?.date as string;
    if (!latestStart) {
      await connection.end();
      return NextResponse.json({ success: false, error: "no period found" }, { status: 500 });
    }

    // Build the full list of weeks to include.
    // Domestic period = 2 weeks. We always include the current period (weeks 0 and 1),
    // then add `add` more pairs going back.
    const totalWeekPairs = 1 + add; // 1 = current period, + however many past periods
    const allDays: string[] = [];
    const weeks: string[][] = [];

    for (let pair = 0; pair < totalWeekPairs; pair++) {
      // Each pair = 2 weeks further back
      const week1 = getPeriod(pair * 2);
      const week2 = getPeriod(pair * 2 + 1);
      // Determine order relative to period anchor
      if (week1.includes(latestStart)) {
        weeks.push(week1, week2);
        allDays.push(...week1, ...week2);
      } else {
        weeks.push(week2, week1);
        allDays.push(...week2, ...week1);
      }
    }

    // Pull all days records for this range
    const [dayRows] = await connection.execute(
      `SELECT d.upid, d.day, d.ship, u.firstName, u.lastName, u.email, u.isDomestic, u.lastConfirm
             FROM days d
             JOIN users u ON d.upid = u.upid
             WHERE d.day IN (${allDays.map(() => "?").join(", ")})
             ORDER BY u.lastName, u.firstName`,
      allDays
    );

    // Pull all users so we can show people who haven't reported too
    const [userRows] = await connection.execute(
      `SELECT upid, firstName, lastName, email, isDomestic, lastConfirm
             FROM users
             WHERE isActive = 1
             ORDER BY lastName, firstName`
    );

    await connection.end();

    // Build a lookup: upid -> { day -> ship }
    const daysByUpid: Record<string, Record<string, string>> = {};
    (dayRows as any[]).forEach((row) => {
      if (!daysByUpid[row.upid]) daysByUpid[row.upid] = {};
      daysByUpid[row.upid][row.day] = row.ship;
    });

    // Assemble final payload — one entry per user, days scaffolded
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
        weeks,   // string[][] — array of week arrays in chronological order, for frontend nav
        users,   // assembled user+days objects
      }
    }, { status: 200 });

  } catch (error) {
    await connection.end();
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
};

export const dynamic = "force-dynamic";