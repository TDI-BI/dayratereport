"use client";
import {getPeriod} from "@/utils/payperiod";

import {useRouter} from "next/navigation";
import {flashDiv} from "@/utils/flashDiv";
import {useEffect, useState} from "react";
import {fetchBoth} from "@/utils/fetchboth";

import {MoveDown, MoveLeft, MoveRight} from "lucide-react";

export default function Home() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',]
    const router = useRouter();

    // i know there is a better way to handle this but like whatever
    const [period, setPeriod] = useState(getPeriod()); // init period
    const [vessels, setVessels] = useState<Record<string, string>>({});
    const [jobs, setJobs] = useState<Record<string, string>>({});
    const [crew, setCrew] = useState(true);
    const [saving, setsaving] = useState(0);
    const [umsg, setUmsg] = useState("saving");
    const [prev, setprev] = useState(0);
    const [month, setmonth] = useState(0);
    const [opens, setOpens] = useState<Record<string, boolean>>({});

    const ex = "prev=" + prev;

    //save then redirect
    const review = async () => {
        if (await save(false)) router.push(`/daysworked/review?${ex}`);
    };

    //save table entrys
    const save = async (standalone = true) => {
        setOpens({});
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
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setUmsg("error");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setsaving(0);
            await new Promise((resolve) => setTimeout(resolve, 300)); // wait out animation

            for (let itm of derrors) {
                await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay betwen flash
                flashDiv(itm);
            }

            return false;
        }

        crew ? (strdict += "&dom=1") : (strdict += "&dom=0"); // flags if you are a domestic or foreign worker
        const ret = await fetchBoth(`/api/mkday?days=${strdict}&${ex}`); // fetch query

        if (ret.status === 200) {

            await new Promise((resolve) => setTimeout(resolve, 1000));
            setUmsg("success!");
            await new Promise((resolve) => setTimeout(resolve, 500));

            if (standalone) {
                setsaving(0);
            } else {
                setUmsg("redirecting...");
            }
            return true; // returns true on success
        } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const msg = await ret.json();
            setUmsg(`error: ${msg.error}`);
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    };

    const checkBounds = async (t: boolean) => {
        // incoming 1 for next 0 for last, also needs to be async for verification
        const nweek = (
            await (
                await fetchBoth(`/api/verifydate?prev=${t ? prev - 1 : prev + 1}`)
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
                (e: any) => Number(e.slice(5, 7)) == month+1
            );
            console.log(fweek);
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

            const thing = await fetchBoth("/api/verifydate"); // why do i do this... // erm
            const thingy = (await thing.json()).resp;

            const session = (
                await (await fetchBoth("/api/sessionforclient")).json()
            ).resp;

            setCrew(!!session.isDomestic); // error thrown bc could maybe be empty (lie)
            setPeriod(serverPeriod);
            console.log('thingy', thingy[0]);
            setmonth(Number(thingy[0].slice(5, 7)) - 1); // keeping us zero indexed
            setVessels(ves);
            setJobs(job);
        }

        getPeriodInf();
    }, [ex, router]);

    return (
        <main className="flex min-h-screen flex-col items-center px-5 space-y-[10px] py-5">
            <div
                id={'buttons'}
                className={`rounded-xl flex gap-10 transition-all duration-300 ease-in-out ${saving === 0 ? 'opacity-100' : 'opacity-0'}`}>
                <button
                    className="group flex items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden max-w-[50px] hover:max-w-[150px] py-[10px] h-[44px] px-5 rounded-md text-primary bg-primary/0 hover:bg-primary/100 hover:text-secondary"
                    onClick={async () => {
                        if (saving === 1) return;
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
                    <MoveLeft size={24} className="flex-shrink-0"/>
                    <p className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out text-inherit">
                        last week
                    </p>
                </button>

                <button
                    className="group flex flex-row-reverse items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden max-w-[50px] hover:max-w-[150px] py-[10px] h-[44px] px-5 rounded-md text-primary bg-primary/0 hover:bg-primary/100 hover:text-secondary"
                    onClick={async () => {
                        if (saving === 1) return;
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
                    <MoveRight size={24} className="flex-shrink-0"/>
                    <p className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                        next week
                    </p>
                </button>
            </div>

            <div className="rounded-md w-full max-w-[600px] h-[3px] bg-primary"/>

            <div>
                <div
                    className={`relative min-h-[53px] transition-all ease-in-out duration-300`}>
                    <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden`}
                    >
                        <div
                            className={`${
                                saving ? "max-h-[0px] opacity-0" : "max-h-[4000px] opacity-100"
                            } overflow-hidden ease-in-out duration-300`}
                            id="pgtbl"
                        >
                            <div className="p-[10px] inline-flex">
                                <div className="w-[24px] select-none opacity-0">h</div>
                                <div className="w-[107px] text-center ">
                                    <strong className="select-none">DATE</strong>
                                </div>
                                <div className="w-[107px] text-center">
                                    <strong className="select-none">VESSEL</strong>
                                </div>
                                <div className="min-w-[107px] text-center">
                                    <strong className="select-none">DEPT</strong>
                                </div>
                            </div>
                            <div className={"flex-col gap-y-5"}>
                                {period.map((day: string) => (
                                    // THIS WAS ORIGINALLY A COMPONNENT BUT THERE WERE STATE REFRESH ISSUES WITH OPEN & ANIMATIONS. IM SORRY TO WHOEVER HAS TO MAINTAIN THIS -PARKER
                                    <div key={day} test-id={`${day}_full`}>
                                        <div
                                            id={day + "_item"}
                                            className="group bg-primary/0 hover:bg-primary/100 transition-all ease-in-out duration-300 overflow-hidden w-full w-365 p-[10px] rounded-md text-primary hover:text-secondary"
                                            onClick={() => {
                                                //this is going to be our dropdown setter
                                                setOpens((prev) => ({
                                                    ...prev,
                                                    [day]: !opens[day],
                                                }));
                                            }}
                                        >
                                            <div>
                                                <div className="flex py-[10px]">
                                                    <div className="py-[5px]">
                                                        <MoveDown
                                                            className={`transform text-inherit transition-all ease-in-out duration-300 ${
                                                                opens[day]
                                                                    ? "-rotate-180"
                                                                    : "rotate-0"
                                                            }`}
                                                        />
                                                    </div>
                                                    <div
                                                        className=" text-inherit ease-in-out duration-300 transition-all w-[107px] text-center select-none p-[5px]"
                                                        test-id={`${day}_day`}
                                                    >
                                                        {days[period.indexOf(day)]}, {day.slice(5, 10)}
                                                    </div>

                                                    <div
                                                        className=" text-inherit ease-in-out duration-300 transition-all w-[107px] text-center select-none p-[5px]"
                                                        test-id={`${day}_ship`}
                                                    >
                                                        {vessels[day] || ""}
                                                    </div>

                                                    <div
                                                        className=" text-inherit ease-in-out duration-300 transition-all w-[107px] text-center select-none p-[5px]"
                                                        test-id={`${day}_job`}
                                                    >
                                                        {jobs[day] || ""}
                                                    </div>
                                                </div>
                                                <div
                                                    className="rounded-md w-[0%] group-hover:w-[100%] h-[3px] bg-secondary transition-all ease-in-out duration-300 delay-100"/>
                                            </div>

                                            <div
                                                className={`${
                                                    opens[day]
                                                        ? "max-h-[400px]"
                                                        : "max-h-[0px]"
                                                } overflow-hidden transition-all ease-in-out duration-300 flex-row-reverse flex group/parent`}
                                            >
                                                <div className="p-[10px] w-[107px] text-center gap-y-[10px]">
                                                    {["NONE", "MARINE", "TECH"].map(
                                                        (e: string) => (
                                                            <div
                                                                key={e}
                                                                className="h-[40px] group/item"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setJobs(
                                                                        (prevJobs) => ({
                                                                            ...prevJobs,
                                                                            [day]:
                                                                                e ==
                                                                                "NONE"
                                                                                    ? ""
                                                                                    : e,
                                                                        })
                                                                    );
                                                                }}
                                                            >
                                                                <p className="h-[38px] leading-[38px] select-none">
                                                                    {e}
                                                                </p>
                                                                <div
                                                                    className={`rounded-md ${
                                                                        (e == "NONE" &&
                                                                            !jobs[
                                                                                day
                                                                                ]) ||
                                                                        e == jobs[day]
                                                                            ? "w-100%"
                                                                            : "w-[0%] group-hover/item:w-[100%]"
                                                                    } h-[3px] bg-primary group-hover:bg-secondary transition-all ease-in-out duration-200 delay-100`}
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <div className="p-[10px] w-[107px] text-center gap-y-[10px]">
                                                    {[
                                                        "NONE",
                                                        "BMCC",
                                                        "EMMA",
                                                        "PROT",
                                                        "GYRE",
                                                        "NAUT",
                                                        "TOOL",
                                                        "3RD",
                                                        "ADMN",
                                                    ].map((e: string) => (
                                                        <div
                                                            key={e}
                                                            className="h-[40px] group/item"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setVessels(
                                                                    (prevVessels) => ({
                                                                        ...prevVessels,
                                                                        [day]:
                                                                            e == "NONE"
                                                                                ? ""
                                                                                : e,
                                                                    })
                                                                );
                                                            }}
                                                        >
                                                            <p className="h-[38px] leading-[38px] select-none">
                                                                {e}
                                                            </p>
                                                            <div
                                                                className={`rounded-md ${
                                                                    (e == "NONE" &&
                                                                        !vessels[
                                                                            day
                                                                            ]) ||
                                                                    e == vessels[day]
                                                                        ? "w-100%"
                                                                        : "w-[0%] group-hover/item:w-[100%]"
                                                                } h-[3px] bg-primary group-hover:bg-secondary transition-all ease-in-out duration-200 delay-100`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div
                                                className={`rounded-md w-[100%] h-[3px] bg-primary transition-all ease-in-out duration-300 ${
                                                    opens[day]
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                }`}
                                            />
                                        </div>
                                        <div
                                            id={day + "flash"}
                                            className={"rounded-xl w-[100%] h-[3px]"}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div
                        className={`${
                            saving
                                ? "opacity-100"
                                : "opacity-0"
                        } ease-in-out w-[365px] px-[30px] absolute top-0 left-0 bg-primary rounded-xl p-2 transition-all duration-300 ease-in-out"`}
                    >
                        <div className={"text-center py-[5px] text-secondary"}>{umsg}</div>
                        <div
                            className={`rounded-md w-full ${
                                saving && umsg ? "max-w-[100%]" : "max-w-[0%]"
                            } h-[3px] ${
                                umsg == "error"
                                    ? "bg-red-500"
                                    : "bg-gradient-to-tr from-sky-300 to-indigo-500"
                            } overflow-hidden ease-in-out duration-500 delay-300 shadow-black`}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-md w-full max-w-[600px] h-[3px] bg-primary"/>

            <div
                className={`flex gap-10 transition-all duration-300 ease-in-out ${saving === 0 ? 'opacity-100' : 'opacity-0'}`}>
                <button
                    className="max-w-[180px] min-w-[150px] rounded-md bg-primary/0 hover:bg-primary/100 
                    text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px]"
                    onClick={() => {
                        if (saving === 1) return;
                        save();
                    }}
                >
                    save
                </button>
                <button
                    className="max-w-[180px] min-w-[150px] rounded-md bg-primary/0 hover:bg-primary/100 text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px]"
                    onClick={() => {
                        if (saving === 1) return;
                        review();
                    }}
                >
                    next
                </button>
            </div>
        </main>
    );
}
