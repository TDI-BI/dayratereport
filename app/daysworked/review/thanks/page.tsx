"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchBoth } from "@/utils/fetchboth";

const Thanks = () => {
    const [session, setSession] = useState<{ [key: string]: string | boolean }>(
        { userId: "loading/loading" }
    );
    const [loaded, setLoaded] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const getsesh = async () => {
            const getthingy = await (
                await fetchBoth(`/api/sessionforclient`)
            ).json();
            setSession(getthingy.resp);
            setLoaded(true);
        };

        getsesh();
    }, []);

    if (!session["isLoggedIn"] && loaded) {
        router.push("/login");
    }

    let name = `${session["userId"]}`.split("/");
    return (
        <main className="flex min-h-screen flex-col items-center space-y-[5px] px-[10px]">
            <div className="text-center font-semibold text-lg py-[10px]">
                {`THANK YOU ${name[0]} ${name[1]}`}
            </div>

            <div className="rounded-md w-full max-w-[600px] h-[3px] bg-white" />
            <div className=" w-full max-w-[600px] h-[10px] " />

            <p className="text-center"> your time sheet has been submitted! </p>
            <p className="text-center">
                a copy of your report should appear in your inbox within a few
                minutes.
            </p>
            <p className="text-center">
                {" "}
                you are only required to submit one report per pay period{" "}
            </p>
            <p className="text-center">
                {" "}
                you may resubmit if you find any issues within your report{" "}
            </p>
            <p className="text-center">
                {" "}
                issues/inquiries email parkerseeley@tdi-bi.com{" "}
            </p>

            <button
                className="justify-center"
                onClick={() => {
                    router.push("../../../");
                }}
            >
                <p className="text-center group w-[160px] rounded-md bg-white/0 hover:bg-white/100 text-white hover:text-black transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                    home
                </p>
            </button>
        </main>
    );
};

export default Thanks;
