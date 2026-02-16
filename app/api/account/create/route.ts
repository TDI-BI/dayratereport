import { NextRequest, NextResponse } from 'next/server';
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  // Block if already logged in
  const session = await getSession();
  if (session.isLoggedIn) {
    return NextResponse.json(
      { success: false, error: 'already logged in' },
      { status: 400 }
    );
  }

  // Get and validate URL parameters
  const { searchParams } = request.nextUrl;
  const username = searchParams.get('username');
  const password = searchParams.get('password');
  const firstName = searchParams.get('firstname');
  const lastName = searchParams.get('lastname');
  const email = searchParams.get('email');
  const workType = searchParams.get('worktype');
  const crew = searchParams.get('crew'); // 'domestic' or 'foreign'

  console.log('hi');

  // Validate required fields
  if (!username || !password || !firstName || !lastName || !workType || !crew) {
    return NextResponse.json(
      { success: false, error: 'missing required fields' },
      { status: 400 }
    );
  }

  // Validate workType is valid
  if (!['marine', 'tech', 'admin'].includes(workType)) {
    return NextResponse.json(
      { success: false, error: 'invalid work type' },
      { status: 400 }
    );
  }

  // Validate crew is valid
  if (!['domestic', 'foreign'].includes(crew)) {
    return NextResponse.json(
      { success: false, error: 'invalid crew type' },
      { status: 400 }
    );
  }

  // Establish connection
  const connection = await connectToDb();

  try {
    // Check if similar account exists (username or email)
    const checkQuery = `
      SELECT upid FROM users
      WHERE username = ? OR email = ?
    `;
    const [existingUsers] = await connection.execute(checkQuery, [
      username,
      email || null,
    ]);

    // Block if account exists
    if ((existingUsers as any[]).length > 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, error: 'username or email already exists' },
        { status: 409 }
      );
    }

    // Generate upid
    const upid = `UP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Determine isDomestic: 1 if crew is 'domestic', 0 if 'foreign'
    const isDomestic = crew === 'domestic' ? 1 : 0;

    // Build insert query with new schema
    const insertQuery = `
      INSERT INTO users (
        upid, username, password, firstName, lastName,
        email, workType, isAdmin, isDomestic, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
    `;

    // Execute query
    const [results] = await connection.execute(insertQuery, [
      upid,
      username,
      password,
      firstName,
      lastName,
      email || null,
      workType,
      isDomestic,
    ]);

    await connection.end();

    return NextResponse.json(
      {
        success: true,
        upid: upid,
        message: 'account created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    await connection.end();
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
};
