// /api/admin/getPeriodCsv/route.ts
// Generates and streams a CSV of period data directly from the server.
// Accepts same params as getDomesticPeriods/getIntlPeriods plus ship/crew filters.
// Columns: upid, name, crew, vessel (most-worked), then one per date in range.

import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";
import {getPeriod} from "@/utils/payperiod";

const getDaysInMonth = (year: number, month: number): string[] => {
  const days: string[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    days.push(date.toISOString().substring(0, 10));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const getMostWorkedVessel = (days: Record<string, string>): string => {
  const counts: Record<string, number> = {};
  Object.values(days).forEach((ship) => {
    if (ship) counts[ship] = (counts[ship] ?? 0) + 1;
  });
  if (!Object.keys(counts).length) return "";
  return Object.entries(counts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
};

const escapeCsv = (val: string): string => {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
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
    const mode = searchParams.get("mode") ?? "domestic"; // "domestic" | "intl"
    const add = Math.max(0, Number(searchParams.get("add") ?? 0));
    const shipFilter = searchParams.get("ship") ?? "ALL";
    const crewFilter = searchParams.get("crew") ?? "ALL"; // "ALL" | "DOM" | "FOR"

    // --- Build date range ---
    let allDays: string[] = [];

    if (mode === "domestic") {
      const [periodRows] = await connection.execute(
        "SELECT date FROM periodstarts ORDER BY id DESC LIMIT 1"
      );
      const latestStart = (periodRows as any[])[0]?.date as string;
      if (!latestStart) {
        await connection.end();
        return NextResponse.json({success: false, error: "no period found"}, {status: 500});
      }

      for (let pair = 0; pair < 1 + add; pair++) {
        const week1 = getPeriod(pair * 2);
        const week2 = getPeriod(pair * 2 + 1);
        if (week1.includes(latestStart)) {
          allDays.push(...week1, ...week2);
        } else {
          allDays.push(...week2, ...week1);
        }
      }
    } else {
      const nowCST = new Date(new Date().toLocaleDateString("en-US", {timeZone: "America/Chicago"}));
      const currentYear = nowCST.getFullYear();
      const currentMonth = nowCST.getMonth() + 1;

      for (let i = add; i >= 0; i--) {
        let month = currentMonth - i;
        let year = currentYear;
        while (month <= 0) {
          month += 12;
          year -= 1;
        }
        allDays.push(...getDaysInMonth(year, month));
      }
    }

    // --- Fetch days + users ---
    const [dayRows] = await connection.execute(
      `SELECT d.upid, d.day, d.ship
       FROM days d
       WHERE d.day IN (${allDays.map(() => "?").join(", ")})`,
      allDays
    );

    const crewWhere =
      crewFilter === "DOM" ? "AND isDomestic = 1" :
        crewFilter === "FOR" ? "AND isDomestic = 0" : "";

    const [userRows] = await connection.execute(
      `SELECT upid, firstName, lastName, email, isDomestic
       FROM users
       WHERE isActive = 1 ${crewWhere}
       ORDER BY lastName, firstName`
    );

    await connection.end();

    // Build lookup
    const daysByUpid: Record<string, Record<string, string>> = {};
    (dayRows as any[]).forEach((row) => {
      if (!daysByUpid[row.upid]) daysByUpid[row.upid] = {};
      daysByUpid[row.upid][row.day] = row.ship;
    });

    // --- Build CSV ---
    const headers = [
      "upid",
      "name",
      "crew",
      "vessel",
      ...allDays,
    ];

    const rows: string[][] = [];

    (userRows as any[]).forEach((user) => {
      const userDays: Record<string, string> = {};
      allDays.forEach((day) => {
        userDays[day] = daysByUpid[user.upid]?.[day] ?? "";
      });

      // Ship filter — skip user if they have no days on that ship
      if (shipFilter !== "ALL") {
        const hasShip = Object.values(userDays).some((s) => s === shipFilter);
        if (!hasShip) return;
      }

      // Skip users with no days worked at all
      const daysWorked = Object.values(userDays).filter(Boolean).length;
      if (!daysWorked) return;

      const vessel = getMostWorkedVessel(
        shipFilter === "ALL"
          ? userDays
          : Object.fromEntries(Object.entries(userDays).filter(([, v]) => v === shipFilter))
      );

      rows.push([
        user.upid,
        `${user.firstName} ${user.lastName}`,
        user.isDomestic ? "DOM" : "FOR",
        vessel,
        ...allDays.map((day) => userDays[day]),
      ]);
    });

    const csvLines = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const dateRange = `${allDays[0]}_TO_${allDays[allDays.length - 1]}`;
    const filename = `${mode.toUpperCase()}_${shipFilter}_${crewFilter}_${dateRange}.csv`.toUpperCase();

    return new Response(csvLines, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    await connection.end();
    return NextResponse.json(
      {success: false, error: (error as Error).message},
      {status: 500}
    );
  }
};

export const dynamic = "force-dynamic";