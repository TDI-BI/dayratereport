'use client';
import {recover} from '@/actions';
import {useEffect, useActionState} from 'react';
import {FormLine} from '@/components/formLine';
import {Button} from '@/components/button';
import {useRouter} from 'next/navigation';

//icons
import {Mail} from 'lucide-react';
import {FormWrapper} from "@/components/formwrapper";

const RecoverForm = () => {
  const [state, formAction] = useActionState<any, FormData>(recover, {});
  const router = useRouter();


  return (
    <form action={formAction} className="space-y-4">
      <FormWrapper errorMessage={state.error}>
        <FormLine
          name="email"
          type="email"
          placeholder="email"
          icon={<Mail/>}
        />
      </FormWrapper>

      <div className="flex gap-[5px]">
        <Button
          className="flex-1"
          onClick={() => router.push('/login')}
        >
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Recover
        </Button>
      </div>
    </form>
  );
};

export default RecoverForm;
