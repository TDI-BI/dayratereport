// /api/days/create/route.ts
// Upserts the user's worked days for a given week

import {NextRequest, NextResponse} from 'next/server';
import {getSession} from '@/actions';
import {connectToDb} from '@/utils/connectToDb';
import {getPeriod} from '@/utils/payperiod';

export const GET = async (request: NextRequest) => {
  const session = await getSession();

  if (!session.isLoggedIn || !session.upid) {
    return NextResponse.json({success: false, error: 'not logged in'}, {status: 401});
  }

  const {searchParams} = request.nextUrl;
  const prev = Number(searchParams.get('prev') ?? 0);
  const daysParam = searchParams.get('days') || '';

  const period = getPeriod(prev);

  // --- Bounds check ---
  const connection = await connectToDb();

  try {
    // Verify account is active
    const [rows] = await connection.execute(
      'SELECT isActive, isDomestic FROM users WHERE upid = ?',
      [session.upid]
    );
    const account = (rows as any[])[0];
    if (!account || !account.isActive) {
      await connection.end();
      return NextResponse.json({success: false, error: 'account inactive or not found'}, {status: 403});
    }

    // Bounds check - make sure they aren't writing to an out of range period
    //i need to set up some protection here to make sure you arent doing illegal stuff
    if (account.isDomestic) {
      const existsQuery =
        "SELECT id, date FROM periodstarts ORDER BY id DESC LIMIT 1;";
      const dateret = JSON.parse(
        JSON.stringify(await connection.execute(existsQuery))
      )[0][0]["date"];
      const thingy = getPeriod().includes(dateret)
        ? (prev == -1 || prev == 0)
        : prev == 1 || prev == 0;
      if (!thingy) return new Response(JSON.stringify({error: 'youre oob'}), {status: 400});
    } else {
      const thism = Number(getPeriod()[0].slice(5, 7)) - 1; // keeps us zero indexed to mimic getMonth
      const list = period.filter((e) => {
        return Number(e.slice(5, 7)) - 1 == thism
      })
      if (!list.length) return new Response(JSON.stringify({error: 'youre oob'}), {status: 400});
    }
    // --- Parse incoming days ---
    // Format: "2025-01-06:EMMA;2025-01-07:BMCC;2025-01-08:;"
    // Only include days that actually have a ship assigned
    const workedDays: { day: string; ship: string }[] = [];

    daysParam.split(';').forEach(entry => {
      if (!entry) return;
      const [day, ship] = entry.split(':');
      if (day && ship && period.includes(day)) {
        workedDays.push({day, ship});
      }
    });

    // --- Upsert: delete this week's entries then reinsert only worked days ---
    await connection.execute(
      `DELETE
       FROM days
       WHERE upid = ? AND day IN (${period.map(() => '?').join(', ')})`,
      [session.upid, ...period]
    );
    if (workedDays.length > 0) {
      const placeholders = workedDays.map(() => '(?, ?, ?)').join(', ');
      const values = workedDays.flatMap(({day, ship}) => [session.upid, day, ship]);
      await connection.execute(
        `INSERT INTO days (upid, day, ship)
         VALUES ${placeholders}`,
        values
      );

    }

    await connection.end();
    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    await connection.end();
    return NextResponse.json(
      {success: false, error: (error as Error).message},
      {status: 500}
    );
  }
};

export const dynamic = 'force-dynamic';