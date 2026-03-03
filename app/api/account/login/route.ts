// /api/account/login/route.ts
// Find and return a user for authentication

import { getSession } from '@/actions';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDb } from '@/utils/connectToDb';

export const GET = async (request: NextRequest) => {
  // Block if already logged in
  const session = await getSession();
  if (session.isLoggedIn) {
    return NextResponse.json(
      { success: false, error: 'already logged in' },
      { status: 400 }
    );
  }

  // Get and validate parameters
  const { searchParams } = request.nextUrl;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { success: false, error: 'username required' },
      { status: 400 }
    );
  }

  // Initiate DB connection
  const connection = await connectToDb();

  try {
    // Build query - now selecting from new schema
    const query = `
      SELECT email, password, isActive
      FROM users
      WHERE username = ?
    `;

    // Execute query
    const [results] = await connection.execute(query, [username]);
    await connection.end();

    const users = results as any[];

    // Check if user exists
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'user not found' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!users[0].isActive) {
      return NextResponse.json(
        { success: false, error: 'account inactive' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, resp: users }, { status: 200 });
  } catch (error) {
    await connection.end();
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
};
