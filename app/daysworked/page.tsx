"use client";
import { getPort } from "@/utils/getPort";
const por = getPort();
import { getPeriod } from "@/utils/payperiod";
import { fetchBoth } from "@/utils/fetchBoth";
import { useRouter } from "next/navigation";
import { flashDiv } from "@/utils/flashDiv";
import { useState, useEffect } from "react";
import DropDown from "@/components/reportDropDown";

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
            if ( // make sure we are properly filled out
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
        const apiUrlEndpoint = por + "/api/mkday?days=" + strdict + "&" + ex;
        await fetchBoth(apiUrlEndpoint); // fetch query
        setUmsg("saved");
        setsaving(0);
        return true; // returns true on success
    };

    const checkBounds = async (t: boolean) => {
        // incoming 1 for next 0 for last, also needs to be async for verification
        const nweek = (
            await (
                await fetchBoth(
                    por + "/api/verifydate?prev=" + (t ? prev - 1 : prev + 1)
                )
            ).json()
        ).resp; // get next week in intended direction
        if (crew) {
            const thisp = (
                await (
                    await fetchBoth(por + "/api/getlatestdomesticperiod")
                ).json()
            ).resp;
            const checkday = t ? nweek[0] : nweek[6];
            return thisp.includes(checkday);
        } else {
            const thismonth = new Date(
                (await (await fetchBoth(por + "/api/getday")).json()).resp
            ).getMonth(); // zero indexed so +1 this is really stupid
            const fweek = nweek.filter(
                (e: any) => Number(e.slice(5, 7)) == thismonth + 1
            );
            return fweek.length > 0;
        }
    };

    useEffect(() => {
        //query database
        async function getPeriodInf() {
            const apiUrlEndpoint = por + "/api/getperiodinf?" + ex;
            const response = await fetchBoth(apiUrlEndpoint);
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
                router.push("../../")
            } // make sure page doesnt crash

            const perResp = await fetchBoth(por + "/api/verifydate?" + ex);
            const serverPeriod = (await perResp.json()).resp;

            const session = (
                await (await fetchBoth(por + "/api/sessionforclient")).json()
            ).resp;

            setCrew(session.isDomestic ? true : false); // error thrown bc could maybe be empty (lie)
            setPeriod(serverPeriod);
            setVessels(ves);
            setJobs(job);
        }
        getPeriodInf();
    }, [ex, router]);

    return (
        <main className="flex min-h-screen flex-col items-center px-1 space-y-[10px]">
            <div className="inline-flex h-[44px]" id="buttons">
                <button
                    className="w-[150px] btnh btn hoverbg"
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
                    {"< back a week"}
                </button>

                <button
                    id="forbutton"
                    className="w-[150px] btnh btn hoverbg"
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
                    {"forward a week >"}
                </button>
            </div>
            <div className="tblWrapper" id="pgtbl">
                <div className="pt-[10px] inline-flex">
                    <div className="tblHeadItm">
                        <strong>DATE</strong>
                    </div>
                    <div className="tblHeadItm">
                        <strong>VESSEL</strong>
                    </div>
                    <div className="tblHeadItm">
                        <strong>DEPT</strong>
                    </div>
                </div>
                <div>
                    {period.map((day: string) => (
                        <div key={day} id={day + "flash"}>
                            <div
                                key={day}
                                id={day + "_item"}
                                className="pt-[15px] h-[60px] hoverbg"
                            >
                                {/*each of these are 345 wide as its the perfect width for mobile. do everything to maintain that*/}
                                <div className="tblBodyDate">{day}</div>
                                {/* shuold popthese into a componnent */}
                                <DropDown
                                    val={
                                        vessels[day as keyof {}]
                                            ? vessels[day as keyof {}]
                                            : ""
                                    }
                                    inid={day + "_ship"}
                                    setter={(e: any) => {
                                        //this is extremely ugly but it works, so thats whats important-est imo
                                        let ndict: {
                                            [id: string]: string;
                                        } = structuredClone(vessels);
                                        ndict[day] = e.target.value;
                                        setVessels(ndict);
                                    }}
                                    options={["BMCC",
                                        "EMMA",
                                        "PROT",
                                        "GYRE",
                                        "NAUT",
                                        "3RD",
                                    ]}
                                />
                                <DropDown
                                    val={
                                        jobs[day as keyof {}]
                                            ? jobs[day as keyof {}]
                                            : ""
                                    }
                                    inid={day + "_job"}
                                    setter={(e: any) => {
                                        //this is extremely ugly but it works, so thats whats important-est imo
                                        let ndict: {
                                            [id: string]: string;
                                        } = structuredClone(jobs);
                                        ndict[day] = e.target.value;
                                        setJobs(ndict);
                                    }}
                                    options={["TECH", "MARINE"]}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
