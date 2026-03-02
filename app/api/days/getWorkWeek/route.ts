// /api/days/getWorkWeek/route.ts
// Returns saved day entries for the current user for a given week

import {NextRequest, NextResponse} from 'next/server';
import {getSession} from '@/actions';
import {getPeriod} from '@/utils/payperiod';
import {connectToDb} from '@/utils/connectToDb';

export const GET = async (request: NextRequest) => {
  const session = await getSession();

  if (!session.isLoggedIn || !session.email) {
    return NextResponse.json(
      {success: false, error: 'not logged in'},
      {status: 401}
    );
  }

  const {searchParams} = request.nextUrl;
  const prev = Number(searchParams.get('prev') ?? 0);

  const period = getPeriod(prev); // e.g. ['2025-01-06', ..., '2025-01-12']

  const connection = await connectToDb();

  try {
    const query = `
        SELECT day, ship
        FROM days
        WHERE userEmail = ?
          AND day IN (${period.map(() => '?').join(', ')})
    `;

    const [results] = await connection.execute(query, [session.email, ...period]);
    await connection.end();

    return NextResponse.json({success: true, resp: results}, {status: 200});
  } catch (error) {
    await connection.end();
    console.error(error);
    return NextResponse.json(
      {success: false, error: (error as Error).message},
      {status: 500}
    );
  }
};

export const dynamic = 'force-dynamic';