// build a PDF and email it as an attachment to the user and dayrate
// theres probably a bug somewhere in this script, check logs in teh database for what im trcking to hunt it
import {getSession} from "@/actions";
import {NextRequest} from "next/server";
import {getPeriod} from "@/utils/payperiod";
import {connectToDb} from "@/utils/connectToDb";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {dispatchEmail} from "@/utils/dispatchEmail"; // this is so gas actually

export const GET = async (request: NextRequest) => {
    //URL parameters
    const {searchParams} = request.nextUrl;
    const dayL = searchParams.get("day") || "";
    const pdf = searchParams.get("pdf") || "";
    const type = searchParams.get("type") || "";
    var prev = Number(searchParams.get("prev"));

    //block if not logged in
    const session = await getSession();
    if (session.isLoggedIn == false || pdf == "")
        return new Response(JSON.stringify({error: "issue with request"}), {
            status: 500,
        });

    //get session info
    let names: string[] = session.userId!.split("/");

    //datatype declarations
    let vesseldict: { [id: string]: string } = {};
    let jobdict: { [id: string]: string } = {};
    const doc = new jsPDF();
    let data: string[][] = [];
    let workedEh: string;
    let vesselinf: string;
    let jobinf: string;

    // var setup
    let list = pdf.split(";");
    let daysworked = 0;

    list.map((item) => {
        // process input into dictionaries
        let line = item.split(":");
        vesseldict[line[0]] = line[1];
        jobdict[line[0]] = line[2];
        if (line[1]) daysworked += 1;
    });

    const period = getPeriod(prev);

    //setup data for autotable
    period.map((day) => {
        vesseldict[day] ? (vesselinf = vesseldict[day]) : (vesselinf = "");
        jobdict[day] ? (jobinf = jobdict[day]) : (jobinf = "");
        vesseldict[day] ? (workedEh = "[X]") : (workedEh = "[  ]");
        data.push([day, workedEh, vesselinf, jobinf]);
    });

    // build our pdf
    doc.text("report for: " + names[0] + " " + names[1], 100, 10, {
        align: "center",
    });
    autoTable(doc, {
        head: [["date", "worked?", "vessel", "job"]],
        body: data,
    });
    doc.text("days worked: " + daysworked, 100, 100, {align: "center"});
    doc.text("crew type: " + type, 100, 120, {align: "center"});
    doc.setFontSize(12);
    doc.text(
        "I, " +
        names[0] +
        " " +
        names[1] +
        ", acknowledge and certify that the information \non this document is true and accurate",
        100,
        170,
        {align: "center"}
    );
    //get PDF as raw text string
    let pds = doc.output();

    //init connection
    const connection = await connectToDb();
    try {
        if (!prev) {
            //only want to log for current period
            const query =
                'UPDATE users set lastConfirm="' +
                new Date().toISOString().substring(0, 10) +
                '" where uid="' +
                session.userId +
                '";';
            await connection.execute(query);
        }

        const bleh = dispatchEmail(
            `travel report for ${names[0]} ${names[1]} from period starting ${dayL}`,
            'Text',
            `the following attached file is a travel report for ${names[0]} ${names[1]} @ ${session.userEmail} for pay period starting on ${period[0]}. \nWith issues email parkerseeley@tdi-bi.com. do not reply to this email.`,
            [`${session.userEmail}`, "parkerseeley@tdi-bi.com"], //TODO make this right again
            [{
                name: `report_for_${session.username}_${period[0]}.pdf`,
                contentType: 'application/pdf',
                base64content: btoa(pds)
            }]
        )

        return Response.json({bleh}, {status: 200});
    } catch (error: any) {
        connection.end();
        return new Response(
            JSON.stringify({error: (error as Error).message}),
            {status: 500}
        );
    }
};
