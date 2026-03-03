import LoginForm from './loginForm';
import {getSession} from '@/actions';
import {redirect} from 'next/navigation';
import {FormWrapper} from "@/components/formwrapper";

const LoginPage = async () => {
  const session = await getSession();

  return (<main className="flex justify-center px-5 bg-secondary">
    <div className='flex justify-center'> {session.isLoggedIn ? redirect('/daysworked') : <LoginForm/>}</div>
  </main>);
};

export default LoginPage;
