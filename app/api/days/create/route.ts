// /api/days/create/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {getSession} from '@/actions';
import {connectToDb} from '@/utils/connectToDb';
import {getPeriod} from '@/utils/payperiod';

export const GET = async (request: NextRequest) => {
  const session = await getSession();

  if (!session.isLoggedIn || !session.email) {
    return NextResponse.json({success: false, error: 'not logged in'}, {status: 401});
  }

  const {searchParams} = request.nextUrl;
  const prev = Number(searchParams.get('prev') ?? 0);
  const daysParam = searchParams.get('days') || '';

  const period = getPeriod(prev);

  const connection = await connectToDb();

  try {
    const [rows] = await connection.execute(
      `SELECT u.isActive, id.domesticId
       FROM users u
       LEFT JOIN isDomestic id ON u.email = id.email
       WHERE u.email = ?`,
      [session.email]
    );
    const account = (rows as any[])[0];
    if (!account || !account.isActive) {
      await connection.end();
      return NextResponse.json({success: false, error: 'account inactive or not found'}, {status: 403});
    }

    const isDomestic = account.domesticId !== null && account.domesticId !== undefined;

    if (isDomestic) {
      const existsQuery = "SELECT id, date FROM periodstarts ORDER BY id DESC LIMIT 1;";
      const dateret = JSON.parse(
        JSON.stringify(await connection.execute(existsQuery))
      )[0][0]["date"];
      const thingy = getPeriod().includes(dateret)
        ? (prev == -1 || prev == 0)
        : prev == 1 || prev == 0;
      if (!thingy) return new Response(JSON.stringify({error: 'youre oob'}), {status: 400});
    } else {
      const thism = Number(getPeriod()[0].slice(5, 7)) - 1;
      const list = period.filter((e) => {
        return Number(e.slice(5, 7)) - 1 == thism;
      });
      if (!list.length) return new Response(JSON.stringify({error: 'youre oob'}), {status: 400});
    }

    const workedDays: { day: string; ship: string }[] = [];
    daysParam.split(';').forEach(entry => {
      if (!entry) return;
      const [day, ship] = entry.split(':');
      if (day && ship && period.includes(day)) {
        workedDays.push({day, ship});
      }
    });

    await connection.execute(
      `DELETE
       FROM days
       WHERE userEmail = ? AND day IN (${period.map(() => '?').join(', ')})`,
      [session.email, ...period]
    );

    if (workedDays.length > 0) {
      const placeholders = workedDays.map(() => '(?, ?, ?)').join(', ');
      const values = workedDays.flatMap(({day, ship}) => [session.email, day, ship]);
      await connection.execute(
        `INSERT INTO days (userEmail, day, ship)
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