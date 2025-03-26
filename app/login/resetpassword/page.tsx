import ResetForm from "@/components/resetForm"; //U TOTALLY CAN FIND IT U LIAR U RENDER JUST FINE
import { Suspense } from "react";
const ResetPass = async () => {
    return (
        <Suspense fallback={<p>loading page...</p>}>
            <main className="flex min-h-screen flex-col items-center px-5">
                {/* we are gonna convert this to a form at some point i thinkge */}
                <ResetForm />
            </main>
        </Suspense>
    );
};

export default ResetPass;
