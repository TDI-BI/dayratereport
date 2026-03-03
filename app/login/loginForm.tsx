'use client';
import {login} from '@/actions';
import {useActionState} from 'react';
import {useRouter} from 'next/navigation';
import {User, Lock} from 'lucide-react';
import {FormLine} from '@/components/formLine';
import {Button} from '@/components/button';
import {FormWrapper} from "@/components/formwrapper";

const LoginForm = () => {
  const router = useRouter();
  const [state, formAction] = useActionState<any, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4 max-w-[400px]">
      <FormWrapper errorMessage={state.error || ''}>
        <FormLine
          name="username"
          type="text"
          placeholder="username"
          icon={<User/>}
        />
        <FormLine
          name="password"
          type="password"
          placeholder="password"
          icon={<Lock/>}
        />
      </FormWrapper>

      <div className="flex gap-[5px]">
        <Button type="submit" className="flex-1">
          login
        </Button>
        <Button
          onClick={() => router.push('/login/recover')}
          className="flex-1"
        >
          recover
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
