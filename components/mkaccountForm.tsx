"use client";
import { mkAccount } from "@/actions";
import { useEffect, useState, useActionState } from "react";
import { flashDiv } from "@/utils/flashDiv";
import { FormLine } from "./formLine";

//icons
import { Contact, Lock, Mail, Ship, User } from "lucide-react";

const MkaccountForm = () => {
    const [crew, setCrew] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction] = useActionState<any, FormData>(
        mkAccount,
        undefined
    );

    useEffect(() => {
        if (state?.error) {
            flashDiv(document.getElementById("error") as HTMLElement);
        }
    });

    return (
        <div className="">
            <form action={formAction} className="space-y-[10px]">
                <FormLine
                    name="firstname"
                    type="text"
                    placeholder="first name"
                    icon={<Contact />}
                />
                <FormLine
                    name="lastname"
                    type="text"
                    placeholder="last name"
                    icon={<Contact />}
                />
                <FormLine
                    name="nusername"
                    type="text"
                    placeholder="username"
                    icon={<User />}
                />
                <FormLine
                    name="email"
                    type="text"
                    placeholder="email"
                    icon={<Mail />}
                />
                <FormLine
                    name="password1"
                    type="password"
                    placeholder="password"
                    icon={<Lock />}
                />
                <FormLine
                    name="password2"
                    type="password"
                    placeholder="repeat password"
                    icon={<Lock />}
                />

                <h1
                    onClick={() => {
                        //this is going to be our dropdown setter
                        setIsOpen(!isOpen);
                    }}
                    className="group bg-primary/0 hover:bg-primary/100 transition-all ease-in-out duration-500 overflow-hidden w-[280px] py-[10px] px-[15px] rounded-md text-primary hover:text-secondary"
                >
                    <input type="hidden" name="crew" value={crew} />
                    <div className="flex flex-row gap-[10px] py-[10px]">
                        <Ship />
                        <div className="w-[216px]">
                            {crew ? crew : "select a crew"}
                        </div>
                    </div>
                    <div className="rounded-md w-[0%] group-hover:w-[100%] h-[3px] bg-secondary transition-all ease-in-out duration-300 delay-100" />
                    <div
                        className={`${isOpen ? 'max-h-[150px]' : 'max-h-[0px]'} overflow-hidden transition-all ease-in-out duration-300 flex-row-reverse flex group/parent`}>
                        <div className="w-[216px] py-[1px]">
                            <div
                                className="h-[40px] group/item"
                                onClick={() => setCrew("domestic")}
                            >
                                <p className="h-[38px] leading-[38px] select-none">
                                    domestic
                                </p>
                                <div className="rounded-md w-[0%] group-hover/item:w-[100%] h-[3px] bg-secondary transition-all ease-in-out duration-300 delay-100" />
                            </div>
                            <div
                                className="h-[40px] group/item"
                                onClick={() => setCrew("foreign")}
                            >
                                <p className="h-[38px] leading-[38px] select-none">
                                    foreign
                                </p>
                                <div className="rounded-md w-[0%] group-hover/item:w-[100%] h-[3px] bg-secondary transition-all ease-in-out duration-300 delay-100" />
                            </div>
                        </div>
                    </div>
                </h1>

                <button className="justify-center">
                    <p className="text-center group w-[280px] rounded-md bg-primary/0 hover:bg-primary/100 text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                        register
                    </p>
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

export default MkaccountForm;
