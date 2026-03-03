// /api/account/myAccountInfo/route.ts
import { getSession } from '@/actions';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDb } from '@/utils/connectToDb';

export const GET = async (request: NextRequest) => {
  const session = await getSession();

  if (!session.isLoggedIn || !session.email) {
    return NextResponse.json(
      { success: false, error: 'not logged in' },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const fieldsParam = searchParams.get('fields');

  // Removed upid and isDomestic from direct column list
  const ALLOWED_FIELDS = [
    'username',
    'isActive',
    'isAdmin',
    'firstName',
    'lastName',
    'email',
    'isDomestic'
  ];

  let selectedFields: string[];

  if (fieldsParam) {
    selectedFields = fieldsParam
      .split(',')
      .map(f => f.trim())
      .filter(f => ALLOWED_FIELDS.includes(f));

    if (selectedFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'no valid fields requested' },
        { status: 400 }
      );
    }
  } else {
    selectedFields = ALLOWED_FIELDS;
  }

  const connection = await connectToDb();

  try {
    // Build SELECT list
    const userFields = selectedFields.filter(f => f !== 'isDomestic');
    const includeDomestic = selectedFields.includes('isDomestic');

    const selectParts = [
      ...userFields.map(f => `u.${f}`)
    ];

    if (includeDomestic) {
      selectParts.push(`
        CASE 
          WHEN d.email IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS isDomestic
      `);
    }

    const query = `
      SELECT ${selectParts.join(', ')}
      FROM users u
      LEFT JOIN isDomestic d ON u.email = d.email
      WHERE u.email = ?
    `;

    const [results] = await connection.execute(query, [session.email]);
    await connection.end();

    const users = results as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, resp: users[0] },
      { status: 200 }
    );

  } catch (error) {
    await connection.end();
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
};
