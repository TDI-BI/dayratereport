// /api/admin/getPeriodCsv/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";
import {getPeriod} from "@/utils/payperiod";
import {getMask} from "@/utils/getMask";

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
    const mode = searchParams.get("mode") ?? "weeks"; // "domestic" | "intl"
    const shipFilter = searchParams.get("ship") ?? "ALL";
    const crewFilter = searchParams.get("crew") ?? "ALL"; // "ALL" | "DOM" | "INT"
    const ind = Math.max(1, Number(searchParams.get("ind") ?? 1));
    const amount = Math.max(1, Number(searchParams.get("amount") ?? 1));
    const allDays = (await getMask(ind, amount, mode === "weeks"));


    // --- Fetch days + users ---
    const [dayRows] = await connection.execute(
      `SELECT d.userEmail, d.day, d.ship
       FROM days d
       WHERE d.day IN (${allDays.map(() => "?").join(", ")})`,
      allDays
    );

    const crewWhere =
      crewFilter === "DOM" ? "AND id.domesticId IS NOT NULL" : crewFilter === "FC" ? "AND id.domesticId IS NULL" : "";

    const [userRows] = await connection.execute(
      `SELECT u.email,
              u.firstName,
              u.lastName,
              u.workType,
              COALESCE(id.domesticId, f.fcId) AS userId,
              id.domesticId IS NOT NULL       AS isDomestic
       FROM users u
                LEFT JOIN isDomestic id ON u.email = id.email
                LEFT JOIN isForeign f ON u.email = f.email
       WHERE u.isActive = 1 ${crewWhere}
       ORDER BY u.lastName, u.firstName`
    );

    await connection.end();

    // Build lookup
    const daysByEmail: Record<string, Record<string, string>> = {};
    (dayRows as any[]).forEach((row) => {
      if (!daysByEmail[row.userEmail]) daysByEmail[row.userEmail] = {};
      daysByEmail[row.userEmail][row.day] = row.ship;
    });

    // --- Build CSV ---
    const headers = [
      "id",
      "name",
      "crew",
      "boat",
      "dept",
      "days",      // <-- add this
      ...allDays,
    ];

    const rows: string[][] = [];

    (userRows as any[]).forEach((user) => {
      const userDays: Record<string, string> = {};
      allDays.forEach((day) => {
        userDays[day] = daysByEmail[user.email]?.[day] ?? "";
      });

      if (shipFilter !== "ALL") {
        const hasShip = Object.values(userDays).some((s) => s === shipFilter);
        if (!hasShip) return;
      }

      const daysWorked = Object.values(userDays).filter(Boolean).length;
      if (!daysWorked) return;

      const relevantDays = shipFilter === "ALL"
        ? userDays
        : Object.fromEntries(Object.entries(userDays).filter(([, v]) => v === shipFilter));

      const boat = getMostWorkedVessel(relevantDays);
      const crew = Boolean(user.isDomestic) ? "DOM" : "FC";
      const total = Object.values(userDays).filter(Boolean).length;
      rows.push([
        user.userId ?? "",
        `${user.firstName} ${user.lastName}`,
        crew,
        boat,
        user.workType ?? "",
        String(total),
        ...allDays.map((day) => userDays[day]),
      ]);
    });

    const csvLines = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const dateRange = `${allDays[0]}_THRU_${allDays[allDays.length - 1]}`;
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