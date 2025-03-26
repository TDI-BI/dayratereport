"use client";
import { JSX, useEffect, useState } from "react";
import { getPeriod } from "@/utils/payperiod";
import { flashDiv } from "@/utils/flashDiv";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { fetchBoth } from "@/utils/fetchboth";
import { Circle, CircleCheckBig, Ship, User } from "lucide-react";


// handle suspense
const SearchParamsWrapper = ({ children }: { children: (prev: number) => JSX.Element }) => {
	const searchParams = useSearchParams();
	if (!searchParams) return null;
	const prev = Number(searchParams.get("prev")) || 0;
	return children(prev);
}

//i have to do this for react19 for some reason idk
export default function Page() {
	return (
    	<Suspense fallback={<div>Loading...</div>}>
        	<SearchParamsWrapper>
            	{(prev) => <Content prev={prev} />}
        	</SearchParamsWrapper>
    	</Suspense>
	);
}

const Content = ({ prev }: { prev: number }) => {
    const ex = "prev=" + prev;

    //needs to be called from within a function (ugh)
    const router = useRouter();

    //states
    const [period, setPeriod] = useState(getPeriod(prev));
    const [saving, setsaving] = useState(0);
    const [dataResponse, setdataResponse] = useState([]);
    const [umsg, setUmsg] = useState("");
    const [affirm, setAffirmed] = useState(false);

    const submit = async () => {
        // im sure this function is due for a re-write at some point
        //makes logic cleaner
        const target = document.getElementById("target") as HTMLElement;

        //flashes our confirm if its not clicked
        if (!affirm) {
            flashDiv(target);
            return;
        }
        setUmsg("preparing email...");
        setsaving(1);

        // client pdf generation removed
        let strdict = "";
        period.map(
            (day) =>
                (strdict +=
                    day + ":" + vesselDict[day] + ":" + crewDict[day] + ";")
        );

        //send email
        const apiUrlEndpoint =
            "/api/sendperiodinf?day=" +
            period[0] +
            "&pdf=" +
            strdict +
            "&type=" +
            type +
            "&" +
            ex;
        await fetchBoth(apiUrlEndpoint);
        setUmsg("email sent!");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        //redirect :p
        router.push("review/thanks");
    };

    //database queries
    useEffect(() => {
        async function getPeriodInf() {
            const response = await fetchBoth(`/api/getperiodinf?${ex}`);
            const res = await response.json();

            const perResp = await fetchBoth(`/api/verifydate?${ex}`);
            const serverPeriod = (await perResp.json()).resp;

            setPeriod(serverPeriod);
            setdataResponse(res.resp);
        }
        getPeriodInf();
    }, [ex]);

    // type declarations
    let name: string = "";
    let type: string = "";
    var vesselDict: { [id: string]: string } = {};
    var crewDict: { [id: string]: string } = {};

    let daysworked = 0;

    try {
        dataResponse.forEach((item) => {
            // build dictionaries for page
            if (item["day"] == -1) {
                item["ship"] == "1" ? (type = "domestic") : (type = "foreign");
                return;
            }
            if (!name) name = item["uid"];
            if (item["ship"]) daysworked += 1;
            vesselDict[item["day"]] = item["ship"];
            crewDict[item["day"]] = item["type"];
        });
    } catch {
        // dataresponse will be null in the case of our user not being logged in
        router.push("../../");
    }
    let names: string[] = name.split("/");

    return (
            <main className="flex min-h-screen flex-col items-center px-5 py-5">
                <div className="text-center font-semibold text-lg py-[10px]">
                    CONFIRM YOUR REPORT
                </div>

                <div className="rounded-md w-full max-w-[600px] h-[3px] bg-primary" />
                <div className=" w-full max-w-[600px] h-[10px] " />
                <div
                    className={`${
                        saving ? "max-h-[0px]" : "max-h-[3000px]"
                    } overflow-hidden ease-in-out duration-300`}
                >
                    <div className="text-center w-[345px] rounded-xl bg-primary text-secondary py-[10px] space-y-[5px]">
                        <div className="flex flex-row items-center justify-center gap-[10px] px-[10px]">
                            <User />{" "}
                            <p className="text-wrap">
                                name: {names[0] + " " + names[1]}
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-center gap-[10px] px-[10px]">
                            <Ship /> <p>crew: {type}</p>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableColumn>day</TableColumn>
                                <TableColumn>vessel</TableColumn>
                                <TableColumn>job</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {
                                    period.map((day) => (
                                        <TableRow
                                            key={day}
                                            className="h-[40px] leading-[40px]"
                                        >
                                            <TableCell
                                                className="w-[115px]"
                                                key={day + "date"}
                                            >
                                                {day}
                                            </TableCell>
                                            <TableCell
                                                className="w-[115px]"
                                                key={day + "ship"}
                                            >
                                                {vesselDict[day]
                                                    ? vesselDict[day]
                                                    : ""}
                                            </TableCell>
                                            <TableCell
                                                className="w-[115px]"
                                                key={day + "job"}
                                            >
                                                {crewDict[day]
                                                    ? crewDict[day]
                                                    : ""}
                                            </TableCell>
                                        </TableRow>
                                    )) // for now we are jtus gonna try to pull 1 line
                                }
                            </TableBody>
                        </Table>
                        <p> TOTAL DAYS: {daysworked}</p>
                        {prev ? (
                            <p className="prev"> {"NOT THIS WEEK'S REPORT"} </p>
                        ) : (
                            ""
                        )}
                    </div>

                    <div className=" w-full max-w-[600px] h-[10px] " />
                    {/* i want to make this less ugly later */}
                    <div className="w-[345px] pt-[10px] pb-[10px] rounded-2xl">
                        <div
                            className="flex gap-[10px] justify-center items-center space-between cursor-pointer"
                            onClick={() => setAffirmed(!affirm)}
                        >
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <div
                                    className={`absolute transition-all duration-300 ease-in-out ${
                                        affirm
                                            ? "opacity-0 rotate-90 transform scale-0"
                                            : "opacity-100 rotate-0 trasnform scale-100"
                                    }`}
                                >
                                    <Circle size={24} />
                                </div>
                                <div
                                    className={`absolute transition-all duration-300 ease-in-out ${
                                        affirm
                                            ? "opacity-100 rotate-0 transform scale-100"
                                            : "opacity-0 -rotate-90 transform scale-0"
                                    }`}
                                >
                                    <CircleCheckBig size={24} />
                                </div>
                            </div>
                            <p className="select-none py-[5px] w-[300px]">
                                I acknowledge and certify that the information
                                on this document is true and accurate
                            </p>
                        </div>
                        <div
                            id="target"
                            className={"rounded-xl w-[100%] h-[3px]"}
                        />
                    </div>
                </div>
                <div
                    className={`${
                        saving
                            ? "max-h-[100px] duration-300"
                            : "max-h-[0px] duration-100"
                    } overflow-hidden ease-in-out w-[365px] px-[30px]`}
                >
                    <div className={"text-center py-[5px]"}>{umsg}</div>
                    <div
                        className={`rounded-md w-full ${
                            saving ? "max-w-[100%]" : "max-w-[0%]"
                        } h-[3px] bg-gradient-to-tr from-sky-300 to-indigo-500 overflow-hidden ease-in-out duration-500 delay-300`}
                    />
                </div>

                <div className=" w-full max-w-[600px] h-[10px] " />
                <div className="rounded-md w-full max-w-[600px] h-[3px] bg-primary" />
                <div className="rounded-md w-full max-w-[600px] h-[10px]" />

                <div className="inline-flex flex-row gap-[5px]">
                    <button
                        className="justify-center"
                        onClick={() => {
                            router.push("../");
                        }}
                    >
                        <p className="text-center group w-[170px] rounded-md bg-primary/0 hover:bg-primary/100 text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                            back
                        </p>
                    </button>
                    <button className="justify-center" onClick={submit}>
                        <p className="text-center group w-[170px] rounded-md bg-primary/0 hover:bg-primary/100 text-primary hover:text-secondary transition-all ease-in-out duration-300 py-[10px] px-[20px] space-y-[5px]">
                            confirm & submit
                        </p>
                    </button>
                </div>
            </main>
    );
}
