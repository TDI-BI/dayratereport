import ResetForm from './resetForm';
import { Suspense } from 'react';

const ResetPasswordPage = async () => {
  return (
    <Suspense fallback={<p>loading page...</p>}>
      <main className="flex min-h-screen flex-col items-center justify-center px-5 bg-secondary">
        <ResetForm />
      </main>
    </Suspense>
  );
};

export default ResetPasswordPage;
