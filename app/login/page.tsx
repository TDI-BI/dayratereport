import LoginForm from './loginForm';
import { getSession } from '@/actions';
import { redirect } from 'next/navigation';

const LoginPage = async () => {
  const session = await getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 bg-secondary">
      {session.isLoggedIn ? redirect('/daysworked') : <LoginForm />}
    </main>
  );
};

export default LoginPage;
