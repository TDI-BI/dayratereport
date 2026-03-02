// /api/sendPeriodinf/route.ts
import {getSession} from "@/actions";
import {NextRequest} from "next/server";
import {getPeriod} from "@/utils/payperiod";
import {connectToDb} from "@/utils/connectToDb";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {dispatchEmail} from "@/utils/dispatchEmail";

export const GET = async (request: NextRequest) => {
  const {searchParams} = request.nextUrl;
  const prev = Number(searchParams.get("prev") ?? 0);

  const session = await getSession();
  if (!session.isLoggedIn || !session.email) {
    return Response.json({error: "not logged in"}, {status: 401});
  }

  const connection = await connectToDb();

  try {
    const [userRows] = await connection.execute(
      `SELECT u.firstName, u.lastName, u.isActive, id.domesticId
       FROM users u
                LEFT JOIN isDomestic id ON u.email = id.email
       WHERE u.email = ?`,
      [session.email]
    );
    const user = (userRows as any[])[0];

    if (!user) return Response.json({error: "user not found"}, {status: 404});
    if (!user.isActive) return Response.json({error: "account inactive"}, {status: 403});

    const fullName = `${user.firstName} ${user.lastName}`;
    const isDomestic = user.domesticId !== null && user.domesticId !== undefined;
    const crewType = isDomestic ? "domestic" : "international";
    const period = getPeriod(prev);

    const [dayRows] = await connection.execute(
      `SELECT day, ship
       FROM days
       WHERE userEmail = ? AND day IN (${period.map(() => "?").join(", ")})`,
      [session.email, ...period]
    );
    const dayMap: Record<string, string> = {};
    (dayRows as any[]).forEach((row) => {
      dayMap[row.day] = row.ship;
    });

    let daysWorked = 0;
    const tableData: string[][] = period.map((day) => {
      const ship = dayMap[day] ?? "";
      if (ship) daysWorked++;
      return [day, ship ? "[X]" : "[  ]", ship];
    });

    const doc = new jsPDF();
    doc.text(`Report for: ${fullName}`, 100, 10, {align: "center"});
    autoTable(doc, {
      head: [["Date", "Worked?", "Vessel"]],
      body: tableData,
    });
    doc.text(`Days worked: ${daysWorked}`, 100, 100, {align: "center"});
    doc.text(`Crew type: ${crewType}`, 100, 120, {align: "center"});
    doc.text(
      `I, ${fullName}, acknowledge and certify that the information\non this document is true and accurate`,
      100, 170, {align: "center"}
    );

    const pdfOutput = doc.output();

    await connection.end();

    const fileName = `report_for_${user.firstName}_${user.lastName}_${period[0]}.pdf`;

    // Replace the old lastConfirm update with this
    if (!prev) {
      await connection.execute(
        `INSERT INTO userSubmission (email, dayFor)
         VALUES (?, ?) ON DUPLICATE KEY
        UPDATE dayMade = CURRENT_TIMESTAMP`,
        [session.email, period[1]]
      );
    }

    dispatchEmail(
      `Travel report for ${fullName} from period starting ${period[0]}`,
      "Text",
      `The attached file is a travel report for ${fullName} @ ${session.email} for the pay period starting ${period[0]}.\nWith issues email parkerseeley@tdi-bi.com. Do not reply to this email.`,
      [session.email, "dayrate@tdi-bi.com"],
      [{name: fileName, contentType: "application/pdf", base64content: btoa(pdfOutput)}]
    );

    return Response.json({success: true}, {status: 200});
  } catch (error) {
    await connection.end();
    return Response.json({error: (error as Error).message}, {status: 500});
  }
};