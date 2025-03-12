import LoginForm from "@/components/loginForm";
import { getSession } from "@/actions";
import { redirect } from "next/navigation";
const logpage = async () => {
    const session = await getSession();
    return (
        <main className="flex min-h-screen flex-col items-center px-5">
            {session.isLoggedIn ? redirect("/daysworked") : <LoginForm />}
        </main>
    );
};

export default logpage;
