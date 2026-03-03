// /login/reset-password/resetForm.tsx
'use client';
import {resetPassword} from '@/actions';
import {useSearchParams} from 'next/navigation';
import {useEffect, useActionState} from 'react';
import {flashDiv} from '@/utils/flashDiv';
import {FormLine} from '@/components/formLine';
import {Button} from '@/components/button';
//icons
import {Lock} from 'lucide-react';
import {FormWrapper} from "@/components/formwrapper";

const ResetForm = () => {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token') as string;

  const [state, formAction] = useActionState<any, FormData>(
    resetPassword,
    undefined
  );

  useEffect(() => {
    if (state?.error) {
      flashDiv(document.getElementById('error') as HTMLElement);
    }
  }, [state?.error]);

  return (
    <form action={formAction} className="space-y-4">
      <FormWrapper errorMessage={state.error || ''}>
        <input
          className="hidden"
          name="token"
          type="hidden"
          value={resetToken || ''}
          readOnly
        />
        <FormLine
          name="password1"
          type="password"
          placeholder="new password"
          icon={<Lock/>}
        />
        <FormLine
          name="password2"
          type="password"
          placeholder="repeat password"
          icon={<Lock/>}
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

        <Button type="submit" className="w-full">
          reset password
        </Button>
      </FormWrapper>
    </form>
  );
};

export default ResetForm;
