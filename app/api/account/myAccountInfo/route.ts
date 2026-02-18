// /api/account/myAccountInfo/route.ts
// Returns account info for the currently logged-in user

import {getSession} from '@/actions';
import {NextRequest, NextResponse} from 'next/server';
import {connectToDb} from '@/utils/connectToDb';

export const GET = async (request: NextRequest) => {
  const session = await getSession();

  if (!session.isLoggedIn || !session.upid) {
    return NextResponse.json(
      {success: false, error: 'not logged in'},
      {status: 401}
    );
  }

  // Optional ?fields=isDomestic,username,etc
  const {searchParams} = request.nextUrl;
  const fieldsParam = searchParams.get('fields');

  // Allowlist of columns to prevent injection via field names
  const ALLOWED_FIELDS = ['upid', 'username', 'isDomestic', 'isActive', 'isAdmin', 'firstName', 'lastName', 'email'];

  let selectedFields: string[];
  if (fieldsParam) {
    selectedFields = fieldsParam
      .split(',')
      .map(f => f.trim())
      .filter(f => ALLOWED_FIELDS.includes(f));

    if (selectedFields.length === 0) {
      return NextResponse.json(
        {success: false, error: 'no valid fields requested'},
        {status: 400}
      );
    }
  } else {
    // Default: return everything except password
    selectedFields = ALLOWED_FIELDS;
  }

  const connection = await connectToDb();

  try {
    const query = `
        SELECT ${selectedFields.join(', ')}
        FROM users
        WHERE upid = ?
    `;

    const [results] = await connection.execute(query, [session.upid]);
    await connection.end();

    const users = results as any[];

    if (users.length === 0) {
      return NextResponse.json(
        {success: false, error: 'user not found'},
        {status: 404}
      );
    }

    return NextResponse.json({success: true, resp: users[0]}, {status: 200});
  } catch (error) {
    await connection.end();
    return NextResponse.json(
      {success: false, error: (error as Error).message},
      {status: 500}
    );
  }
};