import ResetForm from './resetForm';
import {Suspense} from 'react';
import {FormWrapper} from "@/components/formwrapper";

const ResetPasswordPage = async () => {
  return (
    <Suspense fallback={<p>loading page...</p>}>
      <FormWrapper>
        <ResetForm/>
      </FormWrapper>
    </Suspense>
  );
};

export default ResetPasswordPage;
