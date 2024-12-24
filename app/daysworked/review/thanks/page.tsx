'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchBoth } from "@/utils/fetchboth";

const Thanks = () => {

    const [session, setSession] = useState<{[key:string]:string | boolean}>({userId:'loading/loading'})
    const [loaded, setLoaded] = useState<boolean>(false)
    const router = useRouter();

    useEffect(()=>{
        const getsesh = async ()=>{
            const getthingy = await (await fetchBoth(`/api/sessionforclient`)).json();
            setSession(getthingy.resp);
            setLoaded(true)
        }

        getsesh();
    },[])

    if (!session['isLoggedIn'] && loaded) {
        router.push("/login");
    }

    let name = `${session['userId']}`.split("/");
    return (
        <main className="flex min-h-screen flex-col items-center">
            <p>
                <strong> {`THANK YOU ${name[0]} ${name[1]}`}</strong>
            </p>
            <p> your time sheet has been submitted! </p>
            <p>
                a copy of your report should appear in your inbox within a few
                minutes.
            </p>
            <p> you are only required to submit one report per pay period </p>
            <p> you may resubmit if you find any issues within your report </p>
            <p> issues/inquiries email parkerseeley@tdi-bi.com </p>
            <button onClick={()=>{router.push('../../../')}}>
                <div className="w-[180px] btnh btn hoverbg">home</div>
            </button>
        </main>
    );
};

export default Thanks;
