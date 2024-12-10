"use client";
import { getPort } from "@/utils/getPort";
const port = getPort();
import { fetchBoth } from "@/utils/fetchBoth";
import { getPeriod } from "@/utils/payperiod";
import { useState, useEffect, useMemo } from "react";
import { RadioGroup, Radio } from "@nextui-org/react";
import { mkConfig, generateCsv, download } from "export-to-csv";

interface User {
    username: string;
    uid: string;
    isDomestic: boolean;
}

const Admin = () => {
    const [shipEh, setShipEh] = useState("ALL");
    const [periodEh, setPeriodEh] = useState(0);
    const period = getPeriod(periodEh);
    const [userFilter, setUserFilter] = useState("");
    const [inc, setInc] = useState<{ [key: string]: string }[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [crewEh, setCrewEh] = useState("all");
    const [weeks, setWeeks] = useState(1);

    useEffect(() => {
        const getDays = async () => {
            const response = await fetchBoth(port + "/api/gigaquery");
            const res = await response.json();
            setInc(res.resp);
        };
        const getUsers = async () => {
            let resp = await fetchBoth(port + "/api/getusers");
            const users = (await resp.json()).resp;
            setUsers(users);
        };
        getDays();
        getUsers();
    }, []);

    // Memoized filtered data processing
    const filteredData = useMemo(() => {
        // Group days by username and filter by period
        const daysByUser = inc.reduce<Record<string, any[]>>((acc, day) => {
            // Check if the day is within the current period
            if (!period.includes(day["day"])) return acc;

            // Ship filter
            if (shipEh !== "ALL" && day["ship"] !== shipEh) return acc;

            if (!acc[day["username"]]) {
                acc[day["username"]] = [];
            }
            acc[day["username"]].push(day);
            return acc;
        }, {});

        // Process and filter users
        return users
            .filter((user) => {
                // Username filter
                const usernameMatched =
                    !userFilter ||
                    String(user["uid"])
                        .replace("/", " ")
                        .toLowerCase()
                        .includes(userFilter.toLowerCase());

                // Check if user has days in the filtered set
                const userDays = daysByUser[user["username"]] || [];

                return usernameMatched && userDays.length > 0;
            })
            .map((user) => {
                // Get user's days
                const userDays = daysByUser[user["username"]] || [];

                // Create a map of worker types by date
                const workerTypeByDate: Record<string, string> = {};
                userDays.forEach((day) => {
                    workerTypeByDate[day.day] = day.type;
                });

                return {
                    ...user,
                    workerTypes: workerTypeByDate,
                };
            });
    }, [inc, users, shipEh, userFilter, period]);

    const expcsv = () => {
        let experiod: string[] = [];


        for (var i = Number(weeks) - 1; i >= 0; i--) {
            const nperiod = getPeriod(i + periodEh);
            let day: string[] = [];
            nperiod.map((p) => {
                day.push(p);
            });

            experiod = [ ...experiod, ...day ];
        }

        const expme:{[key:string]:string}[] = []

        //something annoying happening here, i only flags for users within the last 6 days because of how i have this set up rn...
        filteredData.map((user)=>{
            var pushme:{[key:string]:string} = {}
            const name = user.uid.split('/')[0] + ' ' + user.uid.split('/')[0] 
            pushme['name'] = name
            pushme['crew'] = user.isDomestic ? 'DOMESTIC' : 'FOREIGN'
            var sum=0
            experiod.map((day)=>{
                if(user.workerTypes[day]!='-') sum+=1;
                pushme[day] = user.workerTypes[day];
            })
            if(sum) expme.push(pushme);
        })

        const csvConfig = mkConfig({
            useKeysAsHeaders: true,
            filename:
                shipEh + "_" + period[0] + "_TO_" + period[6] + "_" + crewEh,
        });
        const csv = generateCsv(csvConfig)(expme);
        download(csvConfig)(csv);
        
    }

    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className="inline-flex flex-wrap justify-center gap-4 pb-[10px]">
                <div className="rounded-xl border-black border-[2px] border-solid p-[10px]">
                    <div className="inline-flex h-[50px] space-x-[10px] leading-[50px] align-middle w-[802px] justify-between">
                        <div>
                            <input
                                type="text"
                                className="bg-white h-[30px] w-[240px] rounded-xl p-[2px] pl-[10px] pr-[10px] overflow-hidden text-black focus:outline-none"
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                placeholder="search users..."
                            ></input>
                        </div>

                        <button
                            className="px-[10px] h-[50px] hoverbg rounded-xl"
                            key="back"
                            onClick={() => {
                                setPeriodEh(periodEh + 1);
                            }}
                        >
                            {"< "} back
                        </button>
                        <p className="">
                            {period[0]} to {period[6]}
                        </p>
                        <button
                            className="px-[10px] h-[50px] hoverbg rounded-xl"
                            key="forward"
                            onClick={() => {
                                setPeriodEh(periodEh - 1);
                            }}
                        >
                            forward {" >"}
                        </button>

                        <select
                            className="bg-black/0 focus:outline-none border-b-black/0 border-b-2 hover:border-b-black/100 ease-in-out transition-all select-none text-center w-[70px] leading-[50px]"
                            value={shipEh}
                            onChange={(e) => {
                                setShipEh(e.target.value);
                            }}
                        >
                            {[
                                "ALL",
                                "BMCC",
                                "EMMA",
                                "PROT",
                                "GYRE",
                                "NAUT",
                                "3RD",
                                "????",
                            ].map((e) => (
                                <option value={e} label={e} key={e} />
                            ))}
                        </select>
                    </div>
                    <div />
                    <div className="inline-flex">
                        <div className="inline-flex">
                            <p className="w-[140px] text-center">name</p>
                            <p className="w-[46px] text-center">crew</p>
                        </div>
                        {period.map((e) => (
                            <p key={e} className="w-[88px] text-center">
                                {e.slice(5, 10)}
                            </p>
                        ))}
                    </div>
                    <div className="h-[2px] w-[100%] bg-gray-500" />
                    <div className="flex-col pt-[5px] space-x-[5px] w-[802px]">
                        <div>
                            {filteredData.map((user) => (
                                <div
                                    key={user.username}
                                    className="inline-flex h-[50px] hoverbg rounded-xl"
                                >
                                    <div className="inline-flex">
                                        <div className="w-[140px] text-center">
                                            <div>{user.uid.split("/")[0]}</div>
                                            <div>{user.uid.split("/")[1]}</div>
                                        </div>
                                        <p className="w-[46px] text-center leading-[50px]">
                                            {user.isDomestic ? "DOM" : "FOR"}
                                        </p>
                                    </div>
                                    {period.map((date) => (
                                        <p
                                            key={date}
                                            className="w-[88px] text-center leading-[50px]"
                                        >
                                            {user.workerTypes[date] || "-"}
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                <div>
                <div className="rounded-xl border-black border-[2px] border-solid p-[10px] space-y-[5px]">
                    <div className='inline-flex w-[245px] h-[50px] justify-between transition-all ease-in-out'>
                        <p className='leading-[50px] px-[10px] text-center'>last</p>
                        <button
                                className="w-[50px] h-[50px] hoverbg rounded-xl"
                                key="forward"
                                onClick={() => {
                                    if(weeks>1) setWeeks(weeks-1);
                                }}
                            >
                                {"-"}
                        </button>
                        <p className='leading-[50px] px-[10px] text-center'>{weeks}</p>
                        <button
                                className="w-[50px] h-[50px] hoverbg rounded-xl"
                                key="forward"
                                onClick={() => {
                                    if(weeks<100)setWeeks(weeks+1);
                                }}
                            >
                                {"+"}
                        </button>
                        <p className='leading-[50px] px-[10px] text-center'>weeks</p>
                    </div>
                    <div/>

                    <div className='inline-flex w-[245px] h-[50px] justify-between transition-all ease-in-out'>
                        <p className='leading-[50px] px-[10px] text-center'>for</p>
                        <select
                            className="bg-black/0 focus:outline-none border-b-black/0 border-b-2 hover:border-b-black/100 ease-in-out transition-all select-none text-center w-[120px] leading-[50px]"
                            value={crewEh}
                            onChange={(e) => {
                                setCrewEh(e.target.value);
                            }}
                        >
                            {[
                                "all",
                                "domestic",
                                "foreign",
                            ].map((e) => (
                                <option value={e} label={(e=='all' ? '' : 'the ') + e} key={e} />
                            ))}

                        </select>
                        <p className='leading-[50px] px-[10px] text-center transition-all ease-in-out'>crew{crewEh=='all' ? 's' : ''}</p>


                    </div>
                    <div/>
                <button
                    className="w-[245px] h-[50px] btn hoverbg"
                    onClick={()=>expcsv()}
                >
                    export
                </button>
                </div>
                </div>
            </div>
        </main>
    );
};

export default Admin;
