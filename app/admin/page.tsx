"use client";

import { getPeriod } from "@/utils/payperiod";
import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchBoth } from "@/utils/fetchboth";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useRouter } from "next/navigation";

import {
    Calendar,
    Earth,
    Mail,
    MoveDown,
    MoveLeft,
    MoveRight,
    Search,
    Ship,
} from "lucide-react";

interface User {
    username: string;
    uid: string;
    email:string;
    isDomestic: boolean;
    lastConfirm: string;
}

const Admin = () => {
    const router = useRouter();

    const [shipEh, setShipEh] = useState("ALL");
    const [periodEh, setPeriodEh] = useState(0);
    const period = getPeriod(periodEh);
    const [userFilter, setUserFilter] = useState("");
    const [inc, setInc] = useState<{ [key: string]: string }[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [crewEh, setCrewEh] = useState("ALL");
    const [weeks, setWeeks] = useState(1);
    const [refresh, setRefresh] = useState(true);
    const [pageErr, setPageErr] = useState(false);
    const [open, isOpen] = useState(false);

    // Split the effects to prevent unnecessary re-renders

    const getDaysCallable = async () => {
        setRefresh(true);
        const response = await fetchBoth(
            `/api/admingetdays?prev=${periodEh}&tot=${weeks}`
        );
        const res = await response.json();
        setInc(res.resp);
        setRefresh(false);
    };

    useEffect(() => {
        const getDays = async () => {
            try {
                setRefresh(true);
                const response = await fetchBoth(
                    `/api/admingetdays?prev=${periodEh}&tot=${weeks}`
                );
                const res = await response.json();
                if (!res.resp) throw { error: "no input" };
                setInc(res.resp);
                setRefresh(false);
            } catch (e) {
                setInc([]);
                setPageErr(true);
            }
        };
        const getUsers = async () => {
            try {
                let resp = await fetchBoth("/api/getusers");
                const users = await resp.json();
                if (!users.resp) throw { error: "no input" };
                setUsers(users.resp);
            } catch (e) {
                setUsers([]);
                setPageErr(true);
            }
        };

        

        const getstuff = async () => {
            setRefresh(true);

            await getUsers();
            await getDays();

            setRefresh(false);
        };

        getstuff();
    }, [periodEh, weeks]); // Only re-fetch when period changes

    if(pageErr) router.push('/daysworked')

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
            }).filter((user)=>{
                if (crewEh=='ALL') return true;
                else if(crewEh=='DOM') return user.isDomestic
                else return !user.isDomestic
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




    const expcsv = async () => {
        // Made async to handle the initial getdays call
        // First, ensure we have fresh data
        await getDaysCallable();

        // Generate periods for the specified number of weeks
        let experiod: string[] = [];
        for (var i = Number(weeks) - 1; i >= 0; i--) {
            const nperiod = getPeriod(i + periodEh);
            let day: string[] = [];
            nperiod.map((p) => {
                day.push(p);
            });
            experiod = [...experiod, ...day];
        }

        const expme: { [key: string]: string }[] = [];

        users.forEach((user) => {
            // Crew filter - note crewEh is lowercase but we're comparing with uppercase
            if (crewEh.toUpperCase() !== "ALL") {
                const isUserDomestic = user.isDomestic;
                if (
                    (crewEh.toUpperCase() === "DOM" && !isUserDomestic) ||
                    (crewEh.toUpperCase() === "FOR" && isUserDomestic)
                ) {
                    return;
                }
            }

            var pushme: { [key: string]: string } = {};
            const name = user.uid.split("/")[1] + " " + user.uid.split("/")[0];
            pushme["name"] = name;
            pushme["crew"] = user.isDomestic ? "DOM" : "FOR";

            var sum = 0;
            experiod.forEach((day) => {
                // Pre-filter inc array once for this user and day
                const filteredInc = inc.filter((e) => {
                    if (!e.ship) return;
                    if (shipEh.toLowerCase() === "all") return true;
                    return e.ship.toUpperCase() === shipEh.toUpperCase();
                });

                const dayWork = filteredInc.find(
                    (d) => d.username === user.username && d.day === day
                );

                const workerType = dayWork ? dayWork.type : "";
                pushme[day] = workerType;

                if (workerType !== "") sum += 1;
            });

            if (sum > 0) {
                expme.push(pushme);
            }
        });

        if (!expme.length) {
            console.log("no records to export");
            return;
        }

        console.log(`Exporting ${expme.length} records`);

        const csvConfig = mkConfig({
            useKeysAsHeaders: true,
            filename:
                `${shipEh}_${period[0]}_TO_${period[6]}_${crewEh}`.toUpperCase(),
        });
        const csv = generateCsv(csvConfig)(expme);
        download(csvConfig)(csv);
    };

    return (
        <main className="flex min-h-screen flex-col items-center pt-[20px]">
            <div className="flex flex-row-reverse flex-wrap justify-center gap-4 pb-[10px]">
            <div>
                    <div className="rounded-xl bg-primary text-secondary p-[10px] space-y-[5px]">
                        <div className="inline-flex w-[245px] h-[50px] justify-between transition-all ease-in-out">
                            <p className="leading-[50px] px-[10px] text-center">
                                last
                            </p>
                            <button
                                className="w-[50px] h-[50px] hover:text-primary hover:bg-secondary duration-300 ease-in-out transition-all rounded-xl"
                                onClick={() => {
                                    if (weeks > 1) setWeeks(weeks - 1);
                                }}
                            >
                                {"-"}
                            </button>
                            <p className="leading-[50px] px-[10px] text-center">
                                {weeks}
                            </p>
                            <button
                                className="w-[50px] h-[50px] hover:text-primary hover:bg-secondary duration-300 ease-in-out transition-all rounded-xl"
                                onClick={() => {
                                    if (weeks < 100) setWeeks(weeks + 1);
                                }}
                            >
                                {"+"}
                            </button>
                            <p className="leading-[50px] px-[10px] text-center">
                                weeks
                            </p>
                        </div>
                        <div />

                        <div />
                        <button
                            className={`w-[245px] h-[50px] rounded-xl duration-300 ease-in-out transition-all ${
                                refresh ? "" : "hover:text-primary hover:bg-secondary"
                            }`}
                            onClick={refresh ? () => {} : () => expcsv()}
                        >
                            {refresh ? "loading ..." : "export"}
                        </button>
                    </div>
                </div>
                {/* Remove the padding from this div */}
                <div className=" space-y-[5px]">
                    {/* filters bar */}
                    <div
                        className={`group rounded-xl bg-secondary hover:bg-primary text-primary hover:text-secondary transition-all ease-in-out duration-300 px-2 pt-2 pb-1 space-y-[10px]`}
                        onClick={() => isOpen(!open)}
                    >
                        {/* first line */}
                        <div className="flex h-auto items-center w-full gap-5 pr-5">
                            <MoveDown
                                className={`transform text-inherit transition-all ease-in-out duration-300 ${
                                    open ? "-rotate-180" : "rotate-0"
                                }`}
                            />
                            {/* Search component */}
                            <div className="flex justify-center gap-[10px] group/search bg-secondary/0 hover:bg-secondary/100 text-inherit hover:text-primary transition-all ease-in-out duration-300 rounded-lg py-[10px] px-[10px]">
                                <Search />
                                <div onClick={(e) => e.stopPropagation()}>
                                    <input
                                        className="text-inherit bg-inherit focus:outline-none peer"
                                        type="text"
                                        placeholder="search users..."
                                        value={userFilter}
                                        onChange={(e) => {
                                            setUserFilter(e.target.value);
                                        }}
                                    />
                                    <div
                                        className={`rounded-md w-[0%] peer-focus:w-[100%] group-hover/search:w-[100%] h-[3px] bg-primary group-hover:bg/secondary group-hover/search:bg-primary transition-all ease-in-out duration-300 delay-100`}
                                    />
                                </div>
                            </div>
                            <p className="w-[255px] text-center select-none">
                                from {period[0]} to {period[6]}
                            </p>
                            <div className="flex gap-5 w-[100px]">
                                <Ship />
                                <p className="select-none">{shipEh}</p>
                            </div>
                            <div className="flex gap-5 w-[100px]">
                                <Earth />
                                <p className="select-none">{crewEh}</p>
                            </div>
                        </div>
                        <div className="rounded-md w-[0%] group-hover:w-[100%] h-[3px] bg-secondary transition-all ease-in-out duration-300 delay-100" />
                        <div
                            className={`${
                                open ? "max-h-[340px]" : "max-h-[0]"
                            } overflow-hidden transition-all ease-in-out duration-300
                            pr-5 flex flex-row-reverse gap-5
                        `}
                        >
                            <div className="p-[10px] w-[100px] text-center gap-y-[10px]">
                                {["ALL", "FOR", "DOM"].map((e: string) => (
                                    <div
                                        key={e}
                                        className="h-[40px] group/item"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setCrewEh(e);
                                        }}
                                    >
                                        <p className="h-[38px] leading-[38px] select-none">
                                            {e}
                                        </p>
                                        <div
                                            className={`rounded-md ${
                                                e == crewEh
                                                    ? "w-100%"
                                                    : "w-[0%] group-hover/item:w-[100%]"
                                            } h-[3px] bg-primary group-hover:bg-secondary transition-all ease-in-out duration-300 delay-100`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="p-[10px] w-[100px] text-center gap-y-[10px]">
                                {[
                                    "ALL",
                                    "BMCC",
                                    "EMMA",
                                    "PROT",
                                    "GYRE",
                                    "NAUT",
                                    "TOOL",
                                    "3RD",
                                ].map((e: string) => (
                                    <div
                                        key={e}
                                        className="h-[40px] group/item"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setShipEh(e);
                                        }}
                                    >
                                        <p className="h-[38px] leading-[38px] select-none">
                                            {e}
                                        </p>
                                        <div
                                            className={`rounded-md ${
                                                e == shipEh
                                                    ? "w-100%"
                                                    : "w-[0%] group-hover/item:w-[100%]"
                                            } h-[3px] bg-primary group-hover:bg-secondary transition-all ease-in-out duration-300 delay-100`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-10 w-[255px] justify-center">
                                <button
                                    className="group/left flex items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden max-w-[50px] hover:max-w-[150px] py-[10px] h-[44px] px-5 rounded-md text-inherit bg-inherit hover:bg-secondary hover:text-primary"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setPeriodEh(periodEh + 1);
                                    }}
                                >
                                    <MoveLeft
                                        size={24}
                                        className="flex-shrink-0"
                                    />
                                    <p className="whitespace-nowrap opacity-0 group-hover/left:opacity-100 transition-all duration-300 ease-in-out text-inherit">
                                        last week
                                    </p>
                                </button>

                                <button
                                    className="group/right flex flex-row-reverse items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden max-w-[50px] hover:max-w-[150px] py-[10px] h-[44px] px-5 rounded-md text-inherit bg-inherit hover:bg-secondary hover:text-primary"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setPeriodEh(periodEh - 1);
                                    }}
                                >
                                    <MoveRight
                                        size={24}
                                        className="flex-shrink-0"
                                    />
                                    <p className="whitespace-nowrap opacity-0 group-hover/right:opacity-100 transition-all duration-300 ease-in-out">
                                        next week
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-md w-[100%] h-[3px] bg-primary" />
                    <div className="flex w-[100%] flex-col items-center">
                        <div className="inline-flex">
                            <div className="inline-flex">
                                <p className="w-[140px] text-center">name</p>
                            </div>
                            {period.map((e) => (
                                <p key={e} className="w-[88px] text-center">
                                    {e.slice(5, 10)}
                                </p>
                            ))}
                        </div>
                        <div className="h-[2px] w-[802px] bg-gray-500" />
                        <div className="flex-col pt-[5px] space-x-[5px] ">
                            <div className="flex flex-col space-y-[5px]">
                                {filteredData.map((user) => (
                                    <div
                                        key={user.username}
                                        className="group px-[10px] flex flex-col text-primary bg-primary/0 hover:bg-primary/100 hover:text-secondary rounded-xl transition-all ease-in-out duration-300 overflow-y-hidden max-h-[50px] hover:max-h-[110px] space-y-[5px] hover:pb-[5px]"
                                    >
                                        <div className="flex">
                                            <div className="inline-flex">
                                                <div className="w-[140px] text-center">
                                                    <div>
                                                        {user.uid.split("/")[0]}
                                                    </div>
                                                    <div>
                                                        {user.uid.split("/")[1]}
                                                    </div>
                                                </div>
                                            </div>
                                            {period.map((date) => (
                                                <p
                                                    key={date}
                                                    className="w-[88px] text-center leading-[50px]"
                                                >
                                                    {user.workerTypes[date] ||
                                                        "-"}
                                                </p>
                                            ))}
                                        </div>
                                        <div className="rounded-md w-[0%] group-hover:w-[100%] h-[3px] bg-secondary transition-all ease-in-out duration-300 delay-100" />
                                        <div className='flex gap-5 justify-center'>
                                            <div className='flex gap-2'>
                                                <Mail/>
                                                <p>{user.email}</p>
                                            </div>
                                            <div className='flex gap-2'>
                                                <Earth/>
                                                <p>{user.isDomestic ? 'domestic' : 'foreign'}</p>
                                            </div>
                                            <div className='flex gap-2'>
                                                <Calendar/>
                                                <p>{user.lastConfirm}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Admin;
