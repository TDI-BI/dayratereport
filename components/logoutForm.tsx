import { logout } from "@/actions";
const LogoutForm = () => {
    return (
        <form action={logout}>
            <button className="w-[calc(100vw/3)] h-[50px] line-h-[50px] btn hoverbg">
                logout
            </button>
        </form>
    );
};

export default LogoutForm;
