"use client";
import { getPort } from "@/utils/getPort";
const por = getPort();
import { getPeriod } from "@/utils/payperiod";

import { useRouter } from "next/navigation";
import { flashDiv } from "@/utils/flashDiv";
import { useState, useEffect, useRef } from "react";
import { fetchBoth } from "@/utils/fetchboth";

import { MoveDown, MoveLeft, MoveRight } from "lucide-react";

export default function Home() {
    const router = useRouter();

    // i know there is a better way to handle this but like whatever
    const [period, setPeriod] = useState(getPeriod()); // init period
    const [vessels, setVessels] = useState({} as { [key: string]: any });
    const [jobs, setJobs] = useState({} as { [key: string]: any });
    const [crew, setCrew] = useState(true);
    const [saving, setsaving] = useState(0);
    const [umsg, setUmsg] = useState("");
    const [prev, setprev] = useState(0);
    const [month, setmonth] = useState(0);

    const ex = "prev=" + prev;

    //save then redirect
    const review = async () => {
        const rlink = "/daysworked/review?" + ex;
        if (await save()) router.push(rlink);
    };

    //save table entrys
    const save = async () => {
        setsaving(1);
        setUmsg("saving...");
        let strdict = "";
        let derrors: HTMLElement[] = []; // stack of elements to flash

        period.map((day) => {
            if (
                // make sure we are properly filled out
                (!vessels[day] && jobs[day]) ||
                (vessels[day] && !jobs[day])
            ) {
                derrors.push(
                    document.getElementById(day + "flash") as HTMLElement
                );
                return; //skip the rest of this since it errors anyway
            }

            //read our saved values
            var cship = "";
            var cjob = "";

            vessels[day] ? (cship = vessels[day]) : "";
            jobs[day] ? (cjob = jobs[day]) : "";

            //append to output
            strdict += day + ":" + cship + ":" + cjob + ";";
        });

        //if we have any errors inform the user they need to make changes before they can save
        if (derrors.length != 0) {
            derrors.forEach((itm) => {
                flashDiv(itm);
            });
            setUmsg("failure");
            setsaving(0);
            return false;
        }

        crew ? (strdict += "&dom=1") : (strdict += "&dom=0"); // flags if you are a domestic or foreign worker
        await fetchBoth(`/api/mkday?days=${strdict}&${ex}`); // fetch query
        setUmsg("saved");
        setsaving(0);
        return true; // returns true on success
    };

    const checkBounds = async (t: boolean) => {
        // incoming 1 for next 0 for last, also needs to be async for verification
        const nweek = (
            await (
                await fetchBoth(
                    `/api/verifydate?prev=${t ? prev - 1 : prev + 1}`
                )
            ).json()
        ).resp; // get next week in intended direction
        if (crew) {
            const thisp = (
                await (await fetchBoth("/api/getlatestdomesticperiod")).json()
            ).resp;
            const checkday = t ? nweek[0] : nweek[6];
            return thisp.includes(checkday);
        } else {
            const fweek = nweek.filter(
                (e: any) => Number(e.slice(5, 7)) == month + 1
            );
            return fweek.length > 0;
        }
    };

    useEffect(() => {
        //query database
        async function getPeriodInf() {
            const response = await fetchBoth(`/api/getperiodinf?${ex}`);
            const res = await response.json();

            let ves: { [id: string]: string } = {};
            let job: { [id: string]: string } = {};
            try {
                res.resp.forEach((item: any) => {
                    // for some reason i need to :any to compile, annoying!
                    if (item["day"] == "-1") {
                        return;
                    }
                    ves[item["day"]] = item["ship"];
                    job[item["day"]] = item["type"];
                });
            } catch (e) {
                router.push("../../");
            } // make sure page doesnt crash

            const perResp = await fetchBoth(`/api/verifydate?${ex}`);
            const serverPeriod = (await perResp.json()).resp;

            const thing = await fetchBoth("/api/verifydate"); // why do i do this...
            const thingy = (await thing.json()).resp;

            const session = (
                await (await fetchBoth("/api/sessionforclient")).json()
            ).resp;

            setCrew(session.isDomestic ? true : false); // error thrown bc could maybe be empty (lie)
            setPeriod(serverPeriod);
            setmonth(new Date(thingy[0]).getMonth()); // better bound checking sys.
            setVessels(ves);
            setJobs(job);
        }
        getPeriodInf();
    }, [ex, router]);

    interface inputProps {
        day: string;
    }
    const DateLine = (ins: inputProps) => {
        const [isOpen, setIsOpen] = useState(false);
        const ships = [
            "BMCC",
            "EMMA",
            "PROT",
            "GYRE",
            "NAUT",
            "TOOL",
            "3RD",
        ];
        const type = [
            'MARINE',
            'TECH'
        ];
        const day = ins.day;
        return (
            <div key={day}>
                <div
                    id={day + "_item"}
                    className="isolate group p-[5px] bg-white/0 hover:bg-white/100 transition-all ease-in-out duration-500 overflow-hidden w-full max-w-[500px] rounded-md text-white hover:text-black"
                >
                    <div onClick={()=>{
                        //this is going to be our dropdown setter
                        setIsOpen(!isOpen);
                    }}>
                        <div className="flex py-[10px]">
                            <div className="py-[5px]">
                                <MoveDown className={`transform text-inherit transition-all ease-in-out duration-300 ${isOpen ? '-rotate-180' : 'rotate-0'}`} />
                            </div>
                            <div className=" text-inherit ease-in-out duration-300 transition-all w-[107px] text-center select-none p-[5px]">
                                {day}
                            </div>

                            <div className=" text-inherit ease-in-out duration-300 transition-all w-[107px] text-center select-none p-[5px]">
                                {vessels[day as keyof {}]
                                    ? vessels[day as keyof {}]
                                    : ""}
                            </div>

                            <div className=" text-inherit ease-in-out duration-300 transition-all w-[107px] text-center select-none p-[5px]">
                                {jobs[day as keyof {}]
                                    ? jobs[day as keyof {}]
                                    : ""}
                            </div>
                        </div>
                        <div className="rounded-md w-[0%] group-hover:w-[100%] h-[3px] bg-black transition-all ease-in-out duration-300 delay-100" />
                    </div>


                    <div className={`${isOpen ? 'max-h-[100px]' : 'max-h-[0px]'} overflow-hidden transition-all ease-in-out duration-300 flex-row-reverse flex`}>
                        <div className={`p-[5px]`}>
                            {['','TECH','MARINE'].map((e:string)=>(
                                <div key={e}>
                                    {e}
                                </div>)
                            )}
                        </div>
                    </div>


                </div>
            </div>
        );
    };

    return (
        <main className="flex min-h-screen flex-col items-center px-5 space-y-[10px]">
            <div className="flex gap-10" id="buttons">
                <button
                    className="group flex items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden max-w-[50px] hover:max-w-[150px] p-5"
                    onClick={async () => {
                        if (!(await checkBounds(false))) {
                            //need to create some visual indication that we are maximally backed
                            const flashme = document.getElementById(
                                "buttons"
                            ) as HTMLElement;
                            flashDiv(flashme);
                            return;
                        }
                        setprev(prev + 1);
                    }}
                >
                    <MoveLeft size={24} className="flex-shrink-0" />
                    <p className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                        last week
                    </p>
                </button>

                <button
                    className="group flex flex-row-reverse items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden max-w-[50px] hover:max-w-[150px] p-5"
                    onClick={async () => {
                        if (!(await checkBounds(true))) {
                            const flashme = document.getElementById(
                                "buttons"
                            ) as HTMLElement;
                            flashDiv(flashme);
                            return;
                        }
                        setprev(prev - 1);
                    }}
                >
                    <MoveRight size={24} className="flex-shrink-0" />
                    <p className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                        next week
                    </p>
                </button>
            </div>

            <div className="rounded-md w-full max-w-[600px] h-[3px] bg-white" />

            <div className="" id="pgtbl">
                <div className="p-[10px] inline-flex">
                    <div className="w-[24px]"></div>
                    <div className="w-full min-w-[107px] max-w-[200px] text-center ">
                        <strong className="select-none">DATE</strong>
                    </div>
                    <div className="w-full min-w-[107px] max-w-[200px] text-center">
                        <strong className="select-none">VESSEL</strong>
                    </div>
                    <div className="w-full min-w-[107px] max-w-[200px] text-center">
                        <strong className="select-none">DEPT</strong>
                    </div>
                </div>
                <div>
                    {period.map((day: string) => (
                        <DateLine day={day} key={day} />
                    ))}
                </div>
            </div>

            <div className="rounded-md w-full max-w-[600px] h-[3px] bg-white" />

            <div className="tblFoot">
                <button className="w-[185.5px] btnh btn hoverbg" onClick={save}>
                    save
                </button>
                <button
                    className="w-[185.5px] btnh btn hoverbg"
                    onClick={review}
                >
                    next
                </button>
            </div>
            <div>
                <p className={saving ? "savemsg1" : "savemsg0"}>{umsg}</p>
            </div>
        </main>
    );
}
