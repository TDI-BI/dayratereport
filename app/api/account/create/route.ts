import {NextRequest, NextResponse} from 'next/server';
import {getSession} from "@/actions";
import {connectToDb} from "@/utils/connectToDb";

export const GET = async (request: NextRequest) => {
  // Block if already logged in
  const session = await getSession();
  if (session.isLoggedIn) {
    return NextResponse.json(
      {success: false, error: 'already logged in'},
      {status: 400}
    );
  }

  const {searchParams} = request.nextUrl;
  const username = searchParams.get('username');
  const password = searchParams.get('password');
  const workType = searchParams.get('worktype');
  const token = searchParams.get('token');

  if (!username || !password || !workType || !token) {
    return NextResponse.json(
      {success: false, error: 'missing required fields'},
      {status: 400}
    );
  }

  if (!['marine', 'tech', 'admin'].includes(workType)) {
    return NextResponse.json(
      {success: false, error: 'invalid work type'},
      {status: 400}
    );
  }

  const connection = await connectToDb();

  try {
    // Fetch invite token info
    const [tokenRows] = await connection.execute(
      `SELECT *
       FROM invited_users
       WHERE token = ?`,
      [token]
    );

    if ((tokenRows as any[]).length === 0) {
      return NextResponse.json(
        {success: false, error: 'invalid or expired token'},
        {status: 404}
      );
    }

    const invite = (tokenRows as any[])[0];

    if (new Date(invite.tokenExpiry) < new Date()) {
      return NextResponse.json(
        {success: false, error: 'token has expired'},
        {status: 410}
      );
    }

    // Check if username or email already exists
    const [existingUsers] = await connection.execute(
      `SELECT upid
       FROM users
       WHERE username = ?
          OR email = ?`,
      [username, invite.email]
    );

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        {success: false, error: 'username or email already exists'},
        {status: 409}
      );
    }

    const isDomestic = invite.pcid ? 1 : 0;

    await connection.execute(
      `INSERT INTO users (username, password, firstName, lastName,
                          email, workType, isAdmin, isDomestic, isActive)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, 1)`,
      [
        username,
        password,
        invite.firstName,
        invite.lastName,
        invite.email,
        workType,
        isDomestic,
      ]
    );

    const acct = await connection.execute(`SELECT *
                                           FROM users
                                           WHERE email = ?`, [invite.email]);
    const usr = (acct as any[])[0][0];
    console.log(usr);
    console.log(invite.pcid, usr.id);
    const pcidSetter = invite.pcid ? invite.pcid : usr.id;
    console.log(pcidSetter);
    await connection.execute(`UPDATE users
                              SET upid=?
                              WHERE email = ?`, [pcidSetter, invite.email])


    // Invalidate the token so it can't be reused
    await connection.execute(
      `DELETE
       FROM invited_users
       WHERE token = ?`,
      [token]
    );

    return NextResponse.json(
      {success: true, upid:pcidSetter, message: 'account created successfully'},
      {status: 201}
    );

  } catch (error) {
    return NextResponse.json(
      {success: false, error: (error as Error).message},
      {status: 500}
    );
  } finally {
    connection.end();
  }
};