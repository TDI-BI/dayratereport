"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPort } from "@/utils/getPort";
const port = getPort();


const Profile = () => {
    const [pl, setpl] = useState(0); /// tracks initial page load, useful for redirect
    const [session, setSesh] = useState({} as { [key: string]: any });

    const setCrew = async (c: number) => {
        const query = port + "/api/updatemycrew?c=" + c;
        const ret = await (await fetch(query)).json();

        if (ret.resp) {
            //console.log(ret)
            gsesh();
        }
    };

    const gsesh = async () => {
        const ret = (
            await (await fetch(port + "/api/sessionforclient")).json()
        ).resp;
        setSesh(ret);
        setpl(1);
    };

    useEffect(() => {
        gsesh();
    }, []);

    if (!session.isLoggedIn && pl) redirect("../../../"); // block viewing the page in some cases

    return (
        <main className="flex min-h-screen flex-col items-center">
            <div id="bweh">
                <p> username: {session.username ? session.username : ""}</p>
                <p> email: {session.userEmail ? session.userEmail : ""} </p>
                <p>
                    full name:
                    {session.userId
                        ? session.userId.split("/")[0] +
                          " " +
                          session.userId.split("/")[0]
                        : ""}
                </p>
            </div>
            <div className="crewtype" id="target">
                CREW:
                <button
                    onClick={() => setCrew(1)}
                    className={
                        "hoverbg crew " + (session.isDomestic ? "select" : "")
                    }
                >
                    domestic
                </button>
                <button
                    onClick={() => setCrew(0)}
                    className={
                        "hoverbg crew " + (!session.isDomestic ? "select" : "")
                    }
                >
                    foreign
                </button>
            </div>
            <p className="text-center w-[300px]">
                <br></br>
                comments or complaints please email
                 parkerseeley@tdi-bi.com or fill out our feedback
                form:
            </p>

            <Link href="https://forms.gle/EKyxpDDTSZknZYpe8">
                <p className="w-[180px] btnh btn hoverbg">feedback</p>
            </Link>
        </main>
    );
};

export default Profile;
