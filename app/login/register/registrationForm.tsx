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
  const [workType, setWorkType] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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

          {/* Crew Type */}
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">
              Crew Type
            </span>
            <span className="text-secondary text-xs font-semibold uppercase tracking-tight">
              {invitedUser?.pcid ? 'Domestic' : 'International'}
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
        {/* Work Type Dropdown */}
        <h1
          onClick={() => setIsOpen(!isOpen)}
          className="group bg-secondary/0 hover:bg-secondary/100 transition-all ease-in-out duration-500 overflow-hidden w-full w-[280px] px-[40px] text-secondary hover:text-primary
   cursor-pointer"
        >

          <input type="hidden" name="worktype" value={workType}/>
          <div className="flex flex-row gap-[10px] py-[10px]">
            <Briefcase/>
            <div className="flex-1">
              {workType ? workType : 'select work type 1'}
              <div
                className=" w-[0%] group-hover:w-[100%] h-[3px] bg-primary transition-all ease-in-out duration-300 delay-100"/>
            </div>
          </div>

          <div
            className={`${isOpen ? 'h-[130px]' : 'h-[0px]'} overflow-hidden transition-all ease-in-out duration-300 flex-row-reverse flex group/parent`}
          >
            <div className="flex-1 py-[1px]">
              <div
                className="h-[40px] group/item"
                onClick={() => setWorkType('marine')}
              >
                <p className="h-[38px] leading-[38px] select-none">marine</p>
                <div
                  className=" w-[0%] group-hover/item:w-[100%] h-[3px] bg-primary transition-all ease-in-out duration-300 delay-100"/>
              </div>
              <div
                className="h-[40px] group/item"
                onClick={() => setWorkType('tech')}
              >
                <p className="h-[38px] leading-[38px] select-none">tech</p>
                <div
                  className=" w-[0%] group-hover/item:w-[100%] h-[3px] bg-primary transition-all ease-in-out duration-300 delay-100"/>
              </div>
              <div
                className="h-[40px] group/item"
                onClick={() => setWorkType('admin')}
              >
                <p className="h-[38px] leading-[38px] select-none">admin</p>
                <div
                  className=" w-[0%] group-hover/item:w-[100%] h-[3px] bg-primary transition-all ease-in-out duration-300 delay-100"/>
              </div>
            </div>
          </div>
        </h1>

      </FormWrapper>

      <Button type="submit" className="w-full">
        register
      </Button>
    </form>
  );
};

export default RegistrationForm;
