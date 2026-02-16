'use client';
import { recover } from '@/actions';
import Link from 'next/link';
import { useEffect, useActionState } from 'react';
import { flashDiv } from '@/utils/flashDiv';
import { FormLine } from '@/components/formLine';

//icons
import { Mail } from 'lucide-react';

const RecoverForm = () => {
  const [state, formAction] = useActionState<any, FormData>(recover, undefined);

  useEffect(() => {
    if (state?.error) {
      flashDiv(document.getElementById('error') as HTMLElement);
    }
  }, [state?.error]);

  return (
    <div className="">
      <form action={formAction} className="space-y-[10px]">
        <FormLine
          name="email"
          type="email"
          placeholder="email"
          icon={<Mail />}
        />

        <div className="flex gap-[5px]">
          <button
            type="submit"
            className="group max-w-[180px] min-w-[150px] rounded-md bg-primary/0 hover:bg-primary/100 text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px] px-[20px]"
          >
            recover
          </button>
          <Link href="/login">
            <p className="text-center group max-w-[180px] min-w-[150px] rounded-md bg-primary/0 hover:bg-primary/100 text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px] px-[20px]">
              back
            </p>
          </Link>
        </div>

        <div className="flex-col text-center justify-center h-[40px]">
          <div className="py-[10px] w-[305px]">
            {state?.error && <p className="text-wrap">{state.error}</p>}
          </div>
          <div id="error" className="rounded-xl w-[100%] h-[3px]" />
        </div>
      </form>
    </div>
  );
};

export default RecoverForm;
