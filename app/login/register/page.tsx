import RegistrationForm from './registrationForm';
import {Suspense} from "react";

const RegisterPage = async () => {
  return (
    <main className="flex justify-center px-5">
      <Suspense fallback={<p>loading...</p>}>
        <RegistrationForm/>
      </Suspense>
    </main>
  );
};

export default RegisterPage;
