"use client";
import { recover } from "@/actions";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useEffect } from "react";
import { flashDiv } from "@/utils/flashDiv";
import { FormLine } from "./formLine";

//icons
import { Mail } from "lucide-react";

const RecoverForm = () => {
    const [state, formAction] = useFormState<any, FormData>(recover, undefined);

    useEffect(() => {
        if (state?.error) {
            flashDiv(document.getElementById("error") as HTMLElement);
        }
    });

    return (
        <div className="">
            <form action={formAction}>
                <FormLine
                    name="email"
                    type="text"
                    placeholder="email"
                    icon={<Mail/>}
                />
                <h1 className="flex gap-[5px]">
                    <button className="group max-w-[180px] min-w-[150px] rounded-md bg-white/0 hover:bg-white/100 text-white hover:text-black transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                        <div>recover</div>
                    </button>
                    <Link href="../login">
                        <p className="text-center group max-w-[180px] min-w-[150px] rounded-md bg-white/0 hover:bg-white/100 text-white hover:text-black transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                        back
                        </p>
                    </Link>
                </h1> 

                <h1 className="flex-col text-center justify-center h-[40px]">
                    <div className="py-[10px] w-[305px]">
                        {state?.error && <p className='text-wrap'>{state.error}</p>}
                    </div>
                    <div id="error" className={"rounded-xl w-[100%] h-[3px]"} />
                </h1>
            </form>
        </div>
    );
};

export default RecoverForm;
