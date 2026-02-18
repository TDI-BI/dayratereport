'use client';
import {mkAccount} from '@/actions';
import {useEffect, useState, useActionState} from 'react';
import {flashDiv} from '@/utils/flashDiv';
import {FormLine} from '@/components/formLine';
import {Button} from '@/components/button';

/*
* ultimately, i want most of this handled by administrators, they should be able to send registration emails to users
* they should only be allowed to handle their login name and password
* */

//icons
import {Contact, Lock, Mail, Briefcase, User, Ship} from 'lucide-react';
import {FormWrapper} from '@/components/formwrapper';

const RegistrationForm = () => {
  const [workType, setWorkType] = useState('');
  const [crew, setCrew] = useState('');
  const [crewOpen, setCrewOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState<any, FormData>(
    mkAccount,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormWrapper errorMessage={state.error}>
        <FormLine
          name="firstname"
          type="text"
          placeholder="first name"
          icon={<Contact/>}
        />
        <FormLine
          name="lastname"
          type="text"
          placeholder="last name"
          icon={<Contact/>}
        />
        <FormLine
          name="nusername"
          type="text"
          placeholder="username"
          icon={<User/>}
        />
        <FormLine
          name="email"
          type="email"
          placeholder="email"
          icon={<Mail/>}
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
          className="group bg-secondary/0 hover:bg-secondary/100 transition-all ease-in-out duration-500 overflow-hidden w-full w-[280px] px-[40px] text-secondary hover:text-tdi-blue cursor-pointer"
        >
          <input type="hidden" name="worktype" value={workType}/>
          <div className="flex flex-row gap-[10px] py-[10px]">
            <Briefcase/>
            <div className="flex-1">
              {workType ? workType : 'select work type 1'}
              <div
                className=" w-[0%] group-hover:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100"/>
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
                  className=" w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100"/>
              </div>
              <div
                className="h-[40px] group/item"
                onClick={() => setWorkType('tech')}
              >
                <p className="h-[38px] leading-[38px] select-none">tech</p>
                <div
                  className=" w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100"/>
              </div>
              <div
                className="h-[40px] group/item"
                onClick={() => setWorkType('admin')}
              >
                <p className="h-[38px] leading-[38px] select-none">admin</p>
                <div
                  className=" w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100"/>
              </div>
            </div>
          </div>
        </h1>

        {/* Crew Dropdown */}
        <h1
          onClick={() => setCrewOpen(!crewOpen)}
          className="group bg-secondary/0 hover:bg-secondary/100 transition-all ease-in-out duration-500 overflow-hidden w-full w-[280px] px-[40px]  text-secondary hover:text-tdi-blue cursor-pointer"
        >
          <input type="hidden" name="crew" value={crew}/>

          <div className="flex flex-row gap-[10px] py-[10px]">
            <Ship/>
            <div className="flex-1">
              {crew ? crew : 'select crew type'}
              <div
                className=" w-[0%] group-hover:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100"/>
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
                <div
                  className=" w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100"/>
              </div>

              <div
                className="h-[40px] group/item"
                onClick={() => {
                  setCrew('foreign');
                  setCrewOpen(false);
                }}
              >
                <p className="h-[38px] leading-[38px] select-none">foreign</p>
                <div
                  className=" w-[0%] group-hover/item:w-[100%] h-[3px] bg-tdi-blue transition-all ease-in-out duration-300 delay-100"/>
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
