import {getSession} from '@/actions';
import {NextResponse} from 'next/server';
import {connectToDb} from '@/utils/connectToDb';

export const GET = async () => {
  const session = await getSession();

  if (!session.isLoggedIn || !session.email) {
    return NextResponse.json(
      {success: false, error: 'not logged in'},
      {status: 401}
    );
  }

  const connection = await connectToDb();

  try {
    const [results] = await connection.execute(
      'SELECT isAdmin FROM users WHERE email = ?',
      [session.email]
    );
    await connection.end();

    const users = results as any[];

    if (users.length === 0) {
      return NextResponse.json(
        {success: false, error: 'user not found'},
        {status: 404}
      );
    }

    const redirect = users[0].isAdmin ? '/admin' : '/daysworked';
    return NextResponse.json({success: true, redirect}, {status: 200});

  } catch (error) {
    await connection.end();
    return NextResponse.json(
      {success: false, error: (error as Error).message},
      {status: 500}
    );
  }
};