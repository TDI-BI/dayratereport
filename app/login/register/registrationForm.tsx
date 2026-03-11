'use client';

import {mkAccount} from '@/actions';
import {useEffect, useState, useActionState} from 'react';
import {useSearchParams} from 'next/navigation';
import {FormLine} from '@/components/formLine';
import {Button} from '@/components/button';
import {Briefcase, Lock, User} from 'lucide-react';
import {FormWrapper} from '@/components/formwrapper';

const RegistrationForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [invitedUser, setInvitedUser] = useState<any>(null);
  const [state, formAction] = useActionState<any, FormData>(mkAccount, {});

  useEffect(() => {
    if (!token) return;

    const fetchTokenInfo = async () => {
      const res = await fetch(
        `/api/account/create/tokenInfo?token=${token}`
      );

      const data = await res.json();

      if (res.ok) {
        setInvitedUser(data.user);
      }
    };

    fetchTokenInfo();
  }, [token]);

  console.log(invitedUser);

  const fullName = invitedUser
    ? `${invitedUser.firstName} ${invitedUser.lastName}`
    : '—';

  return (
    <form action={formAction} className="space-y-4">
      {/* Only send token */}
      <input type="hidden" name="token" value={token || ''}/>
      <FormWrapper errorMessage={state.error}>
        <input type="hidden" name="token" value={token || ''}/>
        <div className="flex flex-col">
          {/* Name */}
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center justify-between">
            <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">
              Name
            </span>
            <span className="text-secondary font-semibold uppercase tracking-tight text-sm">
              {fullName}
            </span>
          </div>

          {/* Email */}
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center justify-between">
            <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">
              Email
            </span>
            <span className="text-secondary text-xs font-semibold tracking-tight">
              {invitedUser?.email || '—'}
            </span>
          </div>
        </div>

        <FormLine
          name="nusername"
          type="text"
          placeholder="username"
          icon={<User/>}
        />
        <FormLine
          name="password1"
          type="password"
          placeholder="password"
          icon={<Lock/>}
        />
        <FormLine
          name="password2"
          type="password"
          placeholder="repeat password"
          icon={<Lock/>}
        />

      </FormWrapper>

      <Button type="submit" className="w-full">
        register
      </Button>
    </form>
  );
};

export default RegistrationForm;
