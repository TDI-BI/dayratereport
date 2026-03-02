import {NextRequest, NextResponse} from 'next/server';
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  const session = await getSession();
  if (session.isLoggedIn) {
    return NextResponse.json({success: false, error: 'already logged in'}, {status: 400});
  }

  const {searchParams} = request.nextUrl;
  const username = searchParams.get('username');
  const password = searchParams.get('password');
  const workType = searchParams.get('worktype');
  const token = searchParams.get('token');

  if (!username || !password || !workType || !token) {
    return NextResponse.json({success: false, error: 'missing required fields'}, {status: 400});
  }

  if (!['marine', 'tech', 'admin'].includes(workType)) {
    return NextResponse.json({success: false, error: 'invalid work type'}, {status: 400});
  }

  const connection = await connectToDb();

  try {
    const [tokenRows] = await connection.execute(
      `SELECT *
       FROM invited_users
       WHERE token = ?`,
      [token]
    );

    if ((tokenRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({success: false, error: 'invalid or expired token'}, {status: 404});
    }

    const invite = (tokenRows as any[])[0];

    if (invite.expendedAt) {
      await connection.end();
      return NextResponse.json({success: false, error: 'token has already been used'}, {status: 410});
    }

    if (new Date(invite.tokenExpiry) < new Date()) {
      await connection.end();
      return NextResponse.json({success: false, error: 'token has expired'}, {status: 410});
    }

    const [existingUsers] = await connection.execute(
      `SELECT email
       FROM users
       WHERE username = ?
          OR email = ?`,
      [username, invite.email]
    );

    if ((existingUsers as any[]).length > 0) {
      await connection.end();
      return NextResponse.json({success: false, error: 'username or email already exists'}, {status: 409});
    }

    await connection.execute(
      `INSERT INTO users (username, password, firstName, lastName, email, workType, isAdmin, isActive)
       VALUES (?, ?, ?, ?, ?, ?, 0, 1)`,
      [username, password, invite.firstName, invite.lastName, invite.email, workType]
    );

    if (invite.pcid) {
      await connection.execute(
        `INSERT INTO isDomestic (email, domesticId)
         VALUES (?, ?)`,
        [invite.email, invite.pcid]
      );
    }

    await connection.execute(
      `UPDATE invited_users
       SET expendedAt = CURRENT_TIMESTAMP
       WHERE token = ?`,
      [token]
    );

    await connection.end();
    return NextResponse.json(
      {success: true, email: invite.email, message: 'account created successfully'},
      {status: 201}
    );

  } catch (error) {
    await connection.end();
    return NextResponse.json({success: false, error: (error as Error).message}, {status: 500});
  }
};