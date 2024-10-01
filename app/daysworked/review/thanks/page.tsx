import { getSession } from "@/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

const profile = async () => {
    const session = await getSession();
    if (!session.isLoggedIn) {
        redirect("/login");
    }
    let name = session.userId!.split("/");
    return (
        <main className="flex min-h-screen flex-col items-center">
            <p>
                <strong> THANK YOU {name[0] + " " + name[1]}</strong>
            </p>
            <p> your time sheet has been submitted! </p>
            <p>
                a copy of your report should appear in your inbox within a few
                minutes.
            </p>
            <p> you are only required to submit one report per pay period </p>
            <p> you may resubmit if you find any issues within your report </p>
            <p> issues/inquiries email parkerseeley@tdi-bi.com </p>
            <Link href="../../../">
                <div className="w-[180px] btnh btn hoverbg">home</div>
            </Link>
        </main>
    );
};

export default profile;
