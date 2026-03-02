// /api/account/reset-password/route.ts
import {getSession} from '@/actions';
import {NextRequest, NextResponse} from 'next/server';
import {connectToDb} from '@/utils/connectToDb';

export const GET = async (request: NextRequest) => {
  // Block if already logged in
  const session = await getSession();
  if (session.isLoggedIn) {
    return NextResponse.json(
      {success: false, error: 'already logged in'},
      {status: 400}
    );
  }

  // Get and validate URL parameters
  const {searchParams} = request.nextUrl;
  const password = searchParams.get('password');
  const resetToken = searchParams.get('token'); // Changed from 'oldhash'

  if (!resetToken || !password) {
    return NextResponse.json(
      {success: false, error: 'missing required parameters'},
      {status: 400}
    );
  }

  // Establish DB connection
  const connection = await connectToDb();

  try {
    // Verify token exists and hasn't expired
    const verifyQuery = `
        SELECT email, username, isActive, resetTokenExpiry
        FROM users
        WHERE resetToken = ?
          AND resetTokenExpiry > NOW()
    `;
    const [verifyResults] = await connection.execute(verifyQuery, [resetToken]);
    const users = verifyResults as any[];

    if (users.length === 0) {
      await connection.end();
      return NextResponse.json(
        {success: false, error: 'invalid or expired reset link'},
        {status: 404}
      );
    }

    const user = users[0];

    // Check if account is active
    if (!user.isActive) {
      await connection.end();
      return NextResponse.json(
        {success: false, error: 'account is inactive'},
        {status: 403}
      );
    }

    // Update password and clear reset token
    const updateQuery = `
        UPDATE users
        SET password         = ?,
            resetToken       = NULL,
            resetTokenExpiry = NULL
        WHERE email = ?
    `;

    const [results] = await connection.execute(updateQuery, [
      password,
      user.email,
    ]);

    await connection.end();

    const affectedRows = (results as any).affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'password reset failed',
        },
        {status: 400}
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'password updated successfully',
        username: user.username,
      },
      {status: 200}
    );
  } catch (error) {
    await connection.end();
    return NextResponse.json(
      {success: false, error: (error as Error).message},
      {status: 500}
    );
  }
};
