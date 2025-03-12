"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchBoth } from "@/utils/fetchboth";
import { User, Mail, Ship } from "lucide-react";

const Profile = () => {
    const [pl, setpl] = useState(0); /// tracks initial page load, useful for redirect
    const [session, setSesh] = useState({} as { [key: string]: any });
    const [copied, setCopied] = useState(false);

    const setCrew = async (c: number) => {
        const getme = await fetchBoth(`/api/updatemycrew?c=${c}`);
        const ret = await getme.json();

        if (ret.resp) {
            gsesh();
        }
    };

    const gsesh = async () => {
        const ret = (await (await fetchBoth(`/api/sessionforclient`)).json())
            .resp;

        setSesh(ret);
        setpl(1);
    };

    useEffect(() => {
        gsesh();
    }, []);

    if (!session.isLoggedIn && pl) redirect("../../../"); // block viewing the page in some cases

    return (
        <main className="flex min-h-screen flex-col items-center pt-[10px] px-[10px]">
            <div className="text-center font-semibold text-lg py-[10px]">
                Welcome{" "}
                {session.userId
                    ? session.userId.split("/")[0] +
                      " " +
                      session.userId.split("/")[0]
                    : ""}
            </div>

            <div className="rounded-md w-full max-w-[600px] h-[3px] bg-white" />
            <div className=" w-full max-w-[600px] h-[10px] " />

            <div className="flex gap-5 ">
                <User />
                <p> {session.username ? session.username : ""} </p>
            </div>

            <div className="flex gap-5 ">
                <Mail />
                <p> {session.username ? session.username : ""} </p>
            </div>

            <div className=" w-full max-w-[600px] h-[10px] " />

            <div className="flex py-[10px] gap-5" id="target">
                <button
                    className="group max-w-[180px] min-w-[150px] rounded-md bg-white/0 hover:bg-white/100 text-white hover:text-black transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]"
                    onClick={() => setCrew(1)}
                >
                    <div>domestic</div>
                    <div
                        className={`rounded-md ${
                            session.isDomestic
                                ? "w-[100%]"
                                : "w-[0%] group-hover:w-[100%]"
                        } h-[3px] bg-white group-hover:bg-black transition-all ease-in-out duration-300 delay-100`}
                    />
                </button>
                <button
                    className="group max-w-[180px] min-w-[150px] rounded-md bg-white/0 hover:bg-white/100 text-white hover:text-black transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]"
                    onClick={() => setCrew(0)}
                >
                    <div>foreign</div>
                    <div
                        className={`rounded-md ${
                            !session.isDomestic
                                ? "w-[100%]"
                                : "w-[0%] group-hover:w-[100%]"
                        } h-[3px] bg-white group-hover:bg-black transition-all ease-in-out duration-300 delay-100`}
                    />
                </button>
            </div>

            <div className=" w-full max-w-[600px] h-[10px] " />

            <Link href="https://forms.gle/EKyxpDDTSZknZYpe8">
                <div
                    className="text-center group max-w-[180px] min-w-[150px] rounded-md bg-white/0 hover:bg-white/100 text-white hover:text-black transition-all ease-in-out duration-300 py-[15px] px-[20px] "
                    onClick={() => setCrew(1)}
                >
                    <div>feedback?</div>
                </div>
            </Link>

            <div className=" w-full max-w-[600px] h-[10px] " />

            <div className='space-y-[5px] text-center'>
                <p>pressing issues, email: </p>
                <div
                    className="cursor-pointer text-center group max-w-[300px] min-w-[150px] rounded-md bg-white/0 hover:bg-white/100 text-white hover:text-black transition-all ease-in-out duration-300 py-[15px] px-[20px] "
                    onClick={async () => {
                        navigator.clipboard.writeText("parkerseeley@tdi-bi.com")
                        setCopied(true)
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        setCopied(false)

                    }}
                >
                    <div className='select-none'>parkerseeley@tdi-bi.com</div> 
                </div>
                <p className={`${copied ? 'opacity-100' : 'opacity-0'} duration-300 transition-all ease-in-out `}>copied to clipboard</p>
            </div>
        </main>
    );
};

export default Profile;
