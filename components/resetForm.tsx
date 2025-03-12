"use client";
import { resetPassword } from "@/actions";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { flashDiv } from "@/utils/flashDiv";
import { FormLine } from "./formLine";

//icons
import { Lock } from "lucide-react";

const ResetForm = () => {
    const searchParams = useSearchParams();
    const oldHash = searchParams.get("acc") as string;
    const [state, formAction] = useFormState<any, FormData>(
        resetPassword,
        undefined
    );

    useEffect(() => {
        if (state?.error) {
            flashDiv(document.getElementById("error") as HTMLElement);
        }
    });

    return (
        <div className="">
            <form action={formAction} className="space-y-[5px]">
                <input
                    className="hidden"
                    name="acc"
                    type="password"
                    value={oldHash}
                />

                <FormLine
                    name="password1"
                    type="password"
                    placeholder="new password"
                    icon={<Lock />}
                />
                <FormLine
                    name="password2"
                    type="password"
                    placeholder="repeat password"
                    icon={<Lock />}
                />

                <button className="group w-[280px] rounded-md bg-white/0 hover:bg-white/100 text-white hover:text-black transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                    <div>recover</div>
                </button>

                <h1 className="flex-col text-center justify-center h-[40px]">
                    <div className="py-[10px]">
                        {state?.error && <p>{state.error}</p>}
                    </div>
                    <div id="error" className={"rounded-xl w-[100%] h-[3px]"} />
                </h1>
            </form>
        </div>
    );
};

export default ResetForm;
