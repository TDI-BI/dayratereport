// /api/admin/getUsersCsv/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

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
    const activeOnly = searchParams.get("active") !== "0"; // default: active only

    const whereClause = activeOnly ? "WHERE u.isActive = 1" : "";

    const [userRows] = await connection.execute(
      `SELECT u.email,
              u.firstName,
              u.lastName,
              u.username,
              u.workType,
              u.isAdmin,
              u.isActive,
              COALESCE(id.domesticId, f.fcId) AS userId,
              id.domesticId IS NOT NULL       AS isDomestic
       FROM users u
                LEFT JOIN isDomestic id ON u.email = id.email
                LEFT JOIN isForeign f ON u.email = f.email
           ${whereClause}
       ORDER BY u.lastName, u.firstName`
    );

    await connection.end();

    const headers = [
      "email",
      "firstName",
      "lastName",
      "username",
      "dept",
      "isAdmin",
      "isActive",
      "id",
      "crew",
    ];

    const rows = (userRows as any[]).map((user) => [
      user.email ?? "",
      user.firstName ?? "",
      user.lastName ?? "",
      user.username ?? "",
      user.workType ?? "",
      user.isAdmin ? "1" : "0",
      user.isActive ? "1" : "0",
      user.userId ?? "",
      Boolean(user.isDomestic) ? "Domestic" : "Foreign",
    ]);

    const csvLines = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const timestamp = new Date().toISOString().substring(0, 10);
    const scope = activeOnly ? "ACTIVE" : "ALL";
    const filename = `USERS_${scope}_${timestamp}.csv`;

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