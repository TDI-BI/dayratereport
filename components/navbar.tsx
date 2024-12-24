import Link from "next/link";
import LogoutForm from "./logoutForm";
import { getSession } from "@/actions";

const Navbar = async () => {
    const session = await getSession();

    if (!session.isLoggedIn) return <div className="padding" data-testid='logout padding'/>;
    return (
        <nav className="head">
            {session.isLoggedIn && <LogoutForm />}
            {!session.isLoggedIn && (
                <Link href="/login">
                    <div className="w-[calc(100vw/3)] h-[50px] line-h-[50px] btn hoverbg">
                        login
                    </div>
                </Link>
            )}

            <Link href={"/daysworked"}>
                <button className="w-[calc(100vw/3)] h-[50px] line-h-[50px] btn hoverbg">
                    Days Worked
                </button>
            </Link>

            <Link href={"/info"}>
                <button className="w-[calc(100vw/3)] h-[50px] line-h-[50px] btn hoverbg">
                    info
                </button>
            </Link>
        </nav>
    );
};

export default Navbar;
