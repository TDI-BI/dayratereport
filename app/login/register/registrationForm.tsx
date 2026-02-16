'use client';
import { mkAccount } from '@/actions';
import { useEffect, useState, useActionState } from 'react';
import { flashDiv } from '@/utils/flashDiv';
import { FormLine } from '@/components/formLine';
import { Button } from '@/components/button';

//icons
import { Contact, Lock, Mail, Briefcase, User, Ship } from 'lucide-react';

const RegistrationForm = () => {
  const [workType, setWorkType] = useState('');
  const [crew, setCrew] = useState('');
  const [crewOpen, setCrewOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState<any, FormData>(
    mkAccount,
    undefined
  );

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
        <div className="flex items-center">
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
            name="firstname"
            type="text"
            placeholder="first name"
            icon={<Contact />}
          />
          <FormLine
            name="lastname"
            type="text"
            placeholder="last name"
            icon={<Contact />}
          />
          <FormLine
            name="nusername"
            type="text"
            placeholder="username"
            icon={<User />}
          />
          <FormLine
            name="email"
            type="email"
            placeholder="email"
            icon={<Mail />}
          />
          <FormLine
            name="password1"
            type="password"
            placeholder="password"
            icon={<Lock />}
          />
          <FormLine
            name="password2"
            type="password"
            placeholder="repeat password"
            icon={<Lock />}
          />

          {/* Work Type Dropdown */}
          <h1
            onClick={() => setIsOpen(!isOpen)}
            className="group bg-secondary/0 hover:bg-secondary/100 transition-all ease-in-out duration-500 overflow-hidden w-full w-[280px] px-[40px] rounded-lg text-secondary hover:text-tdi-blue cursor-pointer"
          >
            <input type="hidden" name="worktype" value={workType} />
            <div className="flex flex-row gap-[10px] py-[10px]">
              <Briefcase />
              <div className="flex-1">
                {workType ? workType : 'select work type 1'}
                <div className="rounded-md w-[0%] group-hover:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100" />
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
                  <div className="rounded-md w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100" />
                </div>
                <div
                  className="h-[40px] group/item"
                  onClick={() => setWorkType('tech')}
                >
                  <p className="h-[38px] leading-[38px] select-none">tech</p>
                  <div className="rounded-md w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100" />
                </div>
                <div
                  className="h-[40px] group/item"
                  onClick={() => setWorkType('admin')}
                >
                  <p className="h-[38px] leading-[38px] select-none">admin</p>
                  <div className="rounded-md w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100" />
                </div>
              </div>
            </div>
          </h1>

          {/* Crew Dropdown */}
          <h1
            onClick={() => setCrewOpen(!crewOpen)}
            className="group bg-secondary/0 hover:bg-secondary/100 transition-all ease-in-out duration-500 overflow-hidden w-full w-[280px] px-[40px] rounded-lg text-secondary hover:text-tdi-blue cursor-pointer"
          >
            <input type="hidden" name="crew" value={crew} />

            <div className="flex flex-row gap-[10px] py-[10px]">
              <Ship />
              <div className="flex-1">
                {crew ? crew : 'select crew type'}
                <div className="rounded-md w-[0%] group-hover:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100" />
              </div>
            </div>

            <div
              className={`${
                crewOpen ? 'h-[90px]' : 'h-[0px]'
              } overflow-hidden transition-all ease-in-out duration-300 flex`}
            >
              <div className="flex-1 py-[1px]">
                <div
                  className="h-[40px] group/item"
                  onClick={() => {
                    setCrew('domestic');
                    setCrewOpen(false);
                  }}
                >
                  <p className="h-[38px] leading-[38px] select-none">
                    domestic
                  </p>
                  <div className="rounded-md w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100" />
                </div>

                <div
                  className="h-[40px] group/item"
                  onClick={() => {
                    setCrew('foreign');
                    setCrewOpen(false);
                  }}
                >
                  <p className="h-[38px] leading-[38px] select-none">foreign</p>
                  <div className="rounded-md w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100" />
                </div>
              </div>
            </div>
          </h1>

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

          <Button type="submit" className="w-full">
            register
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
