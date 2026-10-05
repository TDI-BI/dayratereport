import { NextRequest, NextResponse } from "next/server";
// import { getSession } from "@/actions";
import { connectToDb } from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  try {
    /* TODO: re-enable before prod — auth + admin gate
    const session = await getSession();
    if (!session.isLoggedIn || !session.email) {
      return NextResponse.json(
        { success: false, error: "not logged in" },
        { status: 401 },
      );
    }

    const connection = await connectToDb();
    try {
      const [adminCheck] = await connection.execute(
        "SELECT isAdmin FROM users WHERE email = ?",
        [session.email],
      );
      if (!(adminCheck as any[])[0]?.isAdmin) {
        return NextResponse.json(
          { success: false, error: "unauthorized" },
          { status: 403 },
        );
      }
    } finally {
      await connection.end();
    }
    */

    //process.env.SP_SECRET <- secret token for our api
    //process.env.SP_APP_ID <- app id token
    //process.env.TENANT_ID <- tenant id
    const site = "https://tdibrooks.sharepoint.com/sites/ShipDash"; // will eventually have a table to handle these, hard coded for now
    const listName = "Crew";

    // 1. app-only token (client credentials) for Microsoft Graph
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.SP_APP_ID as string,
          client_secret: process.env.SP_SECRET as string,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
      },
    );
    const { access_token } = await tokenRes.json();
    if (!access_token) {
      return NextResponse.json(
        { success: false, error: "could not acquire graph token" },
        { status: 502 },
      );
    }
    const gfetch = (url: string) =>
      fetch(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          // needed to filter on a (likely) non-indexed date column
          Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly",
        },
      }).then((r) => r.json());

    // resolve the site id from the host + server-relative path
    const { host, pathname } = new URL(site);
    const siteData = await gfetch(
      `https://graph.microsoft.com/v1.0/sites/${host}:${pathname}`,
    );
    const siteId = siteData.id;

    // resolve the list id from its display name
    const listData = await gfetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists?$filter=displayName eq '${listName}'&$select=id,displayName`,
    );
    const listId = listData.value?.[0]?.id;
    if (!listId) {
      return NextResponse.json(
        { success: false, error: `list '${listName}' not found` },
        { status: 404 },
      );
    }

    // calculate date window: the DAYS full days ending yesterday, counting back
    const DAY_MS = 24 * 60 * 60 * 1000;
    const DAYS = 4;
    // DEV: pinned so the window always covers the seeded fake data
    // (2026-08-27 .. 2026-08-30). PROD: const now = new Date();
    const now = new Date("2026-08-31T00:00:00Z");
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const from = new Date(startOfToday.getTime() - DAYS * DAY_MS).toISOString(); // (DAYS days ago) 00:00 UTC
    const to = startOfToday.toISOString(); // exclusive end -> through end of yesterday
    const itemsUrl =
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items` +
      `?$expand=fields` +
      `&$filter=fields/Date ge '${from}' and fields/Date lt '${to}'`;

    let items: any[] = [];
    let next: string | undefined = itemsUrl;
    while (next) {
      const page = await gfetch(next);
      items = items.concat(page.value ?? []);
      next = page["@odata.nextLink"];
    }

    const people = items.map((i) => i.fields);

    // group into { "YYYY-MM-DD": [names] }, ordered yesterday -> further back
    const byDate: Record<string, string[]> = {};
    for (let d = 1; d <= DAYS; d++) {
      const key = new Date(startOfToday.getTime() - d * DAY_MS)
        .toISOString()
        .slice(0, 10);
      byDate[key] = [];
    }
    for (const f of people) {
      const key = String(f.Date ?? "").slice(0, 10); // "2026-08-30T17:54:50Z" -> "2026-08-30"
      (byDate[key] ??= []).push(String(f.Name ?? "").trim());
    }

    // app side: crew who logged a day on this ship in the same window
    const SHIP = "BMCC"; // starting with the one vessel
    const connection = await connectToDb();
    const appByDate: Record<string, string[]> = {};
    for (const key of Object.keys(byDate)) appByDate[key] = [];
    try {
      const [rows] = await connection.execute(
        `SELECT d.day, CONCAT(u.firstName, ' ', u.lastName) AS name
           FROM days d
           JOIN users u ON u.email = d.userEmail
          WHERE d.ship = ?
            AND d.day >= ? AND d.day < ?`,
        [SHIP, from.slice(0, 10), to.slice(0, 10)],
      );
      for (const r of rows as { day: string; name: string }[]) {
        (appByDate[r.day] ??= []).push(r.name.trim());
      }
    } finally {
      await connection.end();
    }

    // reconcile: on the crew list but no day logged in the app
    const missing: Record<string, string[]> = {};
    for (const [day, names] of Object.entries(byDate)) {
      const logged = new Set(
        (appByDate[day] ?? []).map((n) => n.toLowerCase()),
      );
      missing[day] = names.filter((n) => !logged.has(n.toLowerCase()));
    }

    return NextResponse.json(
      {
        success: true,
        window: { from, to, ship: SHIP },
        sharepoint: byDate,
        app: appByDate,
        missing,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
};
