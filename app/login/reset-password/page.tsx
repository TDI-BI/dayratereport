import ResetForm from './resetForm';
import {Suspense} from 'react';

const ResetPasswordPage = async () => {
  return (
    <Suspense fallback={<p>loading page...</p>}>

        <ResetForm/>
    </Suspense>
  );
};

export default ResetPasswordPage;
