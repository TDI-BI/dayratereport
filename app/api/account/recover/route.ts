// /api/account/recover/route.ts
import { getPort } from '@/utils/getPort';
const por = getPort();
import { getSession } from '@/actions';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDb } from '@/utils/connectToDb';
import { dispatchEmail } from '@/utils/dispatchEmail';
import crypto from 'crypto';

export const GET = async (request: NextRequest) => {
  // Simplified: Only block non-admins if logged in
  const session = await getSession();
  if (session.isLoggedIn && session.upid) {
    return NextResponse.json(
      { success: false, error: 'please log out first' },
      { status: 400 }
    );
  }

  // Get and validate URL parameters
  const { searchParams } = request.nextUrl;
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { success: false, error: 'email required' },
      { status: 400 }
    );
  }

  // Init DB connection
  let connection;
  try {
    connection = await connectToDb();
  } catch (error) {
    console.error('DB connection failed:', error);
    return NextResponse.json(
      { success: false, error: 'database connection failed' },
      { status: 500 }
    );
  }

  try {
    // Build query - using new schema
    const query = `
      SELECT upid, username, firstName, lastName, email, isActive
      FROM users
      WHERE email = ?
    `;

    // Execute query
    const [results] = await connection.execute(query, [email]);
    const users = results as any[];

    // Check if account exists
    if (users.length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, error: 'no account found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Check if account is active
    if (!user.isActive) {
      await connection.end();
      return NextResponse.json(
        { success: false, error: 'account is inactive' },
        { status: 403 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await connection.execute(
      `UPDATE users
       SET resetToken = ?, resetTokenExpiry = ?
       WHERE upid = ?`,
      [resetToken, resetTokenExpiry, user.upid]
    );

    // Send recovery email with token
    const htmlContent = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Recovery</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
            <h2 style="color: #0066cc;">Account Recovery</h2>
            <p style="font-size: 16px;">Hello ${user.firstName} ${user.lastName},</p>
            <p style="font-size: 16px;">A recovery link for your account '${user.username}' is below.</p>
            <p style="font-size: 14px; color: #666;">This link is for one-time use only and will expire in 1 hour. Do not share this email with anyone.</p>

            <a href="${process.env.NEXT_PUBLIC_TYPE}${por}/login/reset-password?token=${resetToken}"
               style="display: block; margin: 20px 0; text-decoration: none;">
                <div style="background-color: #0066cc; padding: 20px; border-radius: 10px; text-align: center;">
                    <p style="font-size: 16px; font-weight: 600; color: white; margin: 0;">Recover Account</p>
                </div>
            </a>

            <p style="font-size: 14px; color: #666;">If you didn't request this recovery email, please ignore it. The link will expire automatically.</p>
        </div>
    </body>
</html>
`;

    await dispatchEmail(
      'Account Recovery - Action Required',
      'HTML',
      htmlContent,
      [user.email]
    );

    await connection.end();

    return NextResponse.json(
      { success: true, resp: 'email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Recovery error:', error);
    if (connection) {
      await connection.end();
    }
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
};
