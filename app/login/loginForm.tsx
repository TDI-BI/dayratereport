'use client';
import { login } from '@/actions';
import { useEffect, useActionState } from 'react';
import { flashDiv } from '@/utils/flashDiv';
import { useRouter } from 'next/navigation';
import { User, Lock } from 'lucide-react';
import { FormLine } from '@/components/formLine';
import { Button } from '@/components/button';

const LoginForm = () => {
  const router = useRouter();
  const [state, formAction] = useActionState<any, FormData>(login, undefined);

  useEffect(() => {
    if (state?.error) {
      flashDiv(document.getElementById('error') as HTMLElement);
    }
  }, [state?.error]);

  return (
    <div className="w-full max-w-[400px]">
      {/* Card Container */}
      <div className="bg-tdi-blue rounded-xl shadow-lg p-8 space-y-6">
        {/* Header with Logo */}
        <div className="flex items-center justify-between">
          <img
            src="https://www.tdi-bi.com/wp-content/uploads/2025/05/footer-logo.png"
            alt="TDI Logo"
            className="h-[35px] w-auto object-contain"
          />
        </div>

        {/* Divider */}
        <div className="w-full h-[2px] bg-secondary" />

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <FormLine
            name="username"
            type="text"
            placeholder="username"
            icon={<User />}
          />
          <FormLine
            name="password"
            type="password"
            placeholder="password"
            icon={<Lock />}
          />

          {/* Error Message */}
          {state?.error && (
            <div className="space-y-2">
              <p className="text-secondary/90 text-sm text-center py-2">
                {state.error}
              </p>
              <div
                id="error"
                className="rounded-full w-full h-[3px] bg-secondary/30"
              />
            </div>
          )}

          <div className="flex gap-[5px]">
            <Button type="submit" className="flex-1">
              login
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push('/login/register')}
            >
              register
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => router.push('/login/recover')}
              className="w-auto px-6"
            >
              recover account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
