"use client";
import { login } from "@/actions";
import { useEffect, useActionState } from "react";
import { flashDiv } from "@/utils/flashDiv";
import Link from "next/link";
import { User, Lock } from "lucide-react";
import { FormLine } from "./formLine";



const LoginForm = () => {
    const [state, formAction] = useActionState<any, FormData>(login, undefined);

    useEffect(() => {
        if (state?.error) {
            flashDiv(document.getElementById("error") as HTMLElement);
        }
    });
    return (
        <div className="flex-col items-center">
            <form action={formAction} className="space-y-[10px]">

                <FormLine
                    name="username"
                    type="text"
                    placeholder="username"
                    icon={<User/>}
                />

                <FormLine 
                    name="password"
                    type="password"
                    placeholder="password"
                    icon={<Lock />}
                />

                <h1 className="flex gap-[5px]">
                    <button className="group max-w-[180px] min-w-[150px] rounded-md bg-primary/0 hover:bg-primary/100 text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                        <div>login</div>
                    </button>
                    <Link href="login/mkaccount">
                        <p className="text-center group max-w-[180px] min-w-[150px] rounded-md bg-primary/0 hover:bg-primary/100 text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                            register
                        </p>
                    </Link>
                </h1>

                <h1 className="flex-col text-center justify-center h-[40px]">
                    <div className="py-[10px]">
                        {state?.error && <p>{state.error}</p>}
                    </div>
                    <div id="error" className={"rounded-xl w-[100%] h-[3px]"} />
                </h1>

                <h1 className="flex-row text-center justify-center">
                    <Link href="login/rcvaccount " className="justify-center">
                        <p className="text-center group w-[100%] rounded-md bg-primary/0 hover:bg-primary/100 text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                            recover account
                        </p>
                    </Link>
                </h1>
            </form>
        </div>
    );
};

export default LoginForm;
