"use client";
import {JSX, Suspense, useEffect, useState} from "react";
import {useSearchParams, useRouter} from "next/navigation";
import {getPeriod} from "@/utils/payperiod";
import {fetchBoth} from "@/utils/fetchboth";
import {Button} from "@/components/button";
import {Circle, CircleCheckBig} from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SearchParamsWrapper = ({children}: { children: (prev: number) => JSX.Element }) => {
  const searchParams = useSearchParams();
  const prev = Number(searchParams?.get("prev") ?? 0);
  return children(prev);
};

export default function Page() {
  return (
    <Suspense fallback={
      <main className="flex justify-center px-5 bg-secondary min-h-screen">
        <div className="w-full max-w-[360px] py-8 text-primary/40 text-xs uppercase tracking-widest font-semibold">
          loading...
        </div>
      </main>
    }>
      <SearchParamsWrapper>
        {(prev) => <Content prev={prev}/>}
      </SearchParamsWrapper>
    </Suspense>
  );
}

const Content = ({prev}: { prev: number }) => {
  const router = useRouter();
  const [period, setPeriod] = useState<string[]>(getPeriod(prev));
  const [vesselDict, setVesselDict] = useState<Record<string, string>>({});
  const [userName, setUserName] = useState("");
  const [crewType, setCrewType] = useState("");
  const [daysWorked, setDaysWorked] = useState(0);
  const [affirmed, setAffirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function load() {
      const authRes = await fetchBoth("/api/account/myAccountInfo?fields=upid,firstName,lastName,isDomestic");
      if (authRes.status === 401) {
        router.push("/");
        return;
      }
      const authData = await authRes.json();
      const {firstName, lastName, isDomestic} = authData.resp;
      setUserName(`${firstName} ${lastName}`);
      setCrewType(isDomestic ? "domestic" : "foreign");

      const [periodRes, weekRes] = await Promise.all([
        fetchBoth(`/api/days/verifyDate?prev=${prev}`),
        fetchBoth(`/api/days/getWorkWeek?prev=${prev}`),
      ]);

      const periodData = await periodRes.json();
      if (periodData.resp) setPeriod(periodData.resp);

      const weekData = await weekRes.json();
      if (weekData.resp) {
        const dict: Record<string, string> = {};
        let worked = 0;
        weekData.resp.forEach((entry: { day: string; ship: string }) => {
          if (entry.ship) {
            dict[entry.day] = entry.ship;
            worked++;
          }
        });
        setVesselDict(dict);
        setDaysWorked(worked);
      }
    }

    load();
  }, [prev, router]);

  const submit = async () => {
    if (!affirmed) {
      const el = document.getElementById("affirm-flash");
      if (el) {
        el.classList.add("bg-red-400/20");
        setTimeout(() => el.classList.remove("bg-red-400/20"), 600);
      }
      return;
    }
    setSubmitting(true);
    setStatusMsg("preparing report...");

    const res = await fetchBoth(`/api/days/sendPeriodInf?prev=${prev}`);

    if (res.status === 200) {
      setStatusMsg("submitted!");
      await new Promise((r) => setTimeout(r, 800));
      router.push("review/thanks");
    } else {
      const body = await res.json();
      setStatusMsg(`error: ${body.error ?? "unknown"}`);
      setSubmitting(false);
    }
  };

  return (
    <main className="flex justify-center px-5 bg-secondary min-h-screen">
      <div className="w-full max-w-[360px] py-8 flex flex-col gap-6">

        {/* Header */}
        <div
          className="font-semibold uppercase tracking-tight text-secondary text-sm bg-tdi-blue flex justify-center p-5 shadow">
          Confirm your report
        </div>

        {/* Summary Card */}
        <div className="bg-tdi-blue flex flex-col shadow">

          {/* Name + days worked */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-secondary/20">
            <div>
              <div className="text-secondary font-semibold uppercase tracking-tight text-sm">
                {userName || "—"}
              </div>
              <div className="text-secondary/50 text-xs tracking-tight uppercase">
                {crewType}
              </div>
            </div>
            <div className="text-secondary/50 text-xs font-semibold uppercase tracking-widest">
              {daysWorked} days
            </div>
          </div>

          {/* Day rows — inset white ledger sheet */}
          <div className="bg-secondary mx-3 mt-3 shadow">
            {period.map((day, i) => {
              const ship = vesselDict[day];
              return (
                <div
                  key={day}
                  className={`flex items-center justify-between px-4 py-2 ${
                    i !== period.length - 1 ? "border-b border-primary/10" : ""
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-tight text-primary">
                    {DAYS[i]}, {day.slice(5, 10)}
                  </div>
                  <div className={`text-xs font-semibold uppercase tracking-tight text-primary`}>
                    {ship || "—"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Acknowledgement — sign the form */}
          <div
            id="affirm-flash"
            className="mx-3 mt-3 mb-3 px-4 py-3 bg-secondary shadow flex items-start gap-3 cursor-pointer transition-all duration-300 ease-in-out relative overflow-visible group"
            onClick={() => setAffirmed(!affirmed)}
          >
            {/* Corner ticks — top left */}
            <span
              className="absolute top-0 left-0 h-[2px] w-0 bg-primary group-hover:w-3 transition-all duration-300 ease-in-out"/>
            <span
              className="absolute top-0 left-0 w-[2px] h-0 bg-primary group-hover:h-3 transition-all duration-300 ease-in-out"/>
            {/* Corner ticks — top right */}
            <span
              className="absolute top-0 right-0 h-[2px] w-0 bg-primary group-hover:w-3 transition-all duration-300 ease-in-out"/>
            <span
              className="absolute top-0 right-0 w-[2px] h-0 bg-primary group-hover:h-3 transition-all duration-300 ease-in-out"/>

            <div className="relative w-5 h-5 flex-shrink-0 mt-0.5">
              <div className={`absolute transition-all duration-300 ease-in-out ${
                affirmed ? "opacity-0 scale-0 rotate-90" : "opacity-100 scale-100 rotate-0"
              }`}>
                <Circle size={18} className="text-primary"/>
              </div>
              <div className={`absolute transition-all duration-300 ease-in-out ${
                affirmed ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90"
              }`}>
                <CircleCheckBig size={18} className="text-primary"/>
              </div>
            </div>
            <p className="text-xs text-primary leading-relaxed select-none">
              I acknowledge and certify that the information on this document is true and accurate
            </p>
          </div>

          {/* Past week notice */}
          {prev > 0 && (
            <div
              className="px-4 py-2 border-t border-secondary/20 text-secondary/40 text-xs uppercase tracking-widest font-semibold text-center">
              not this weeks report
            </div>
          )}
        </div>

        {/* Status */}
        {statusMsg && (
          <div className={`text-xs font-semibold uppercase tracking-tight text-center ${
            statusMsg.startsWith("error") ? "text-red-500" : "text-tdi-blue"
          }`}>
            {statusMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <Button onClick={() => router.push("../")} className="flex-1 justify-center">
            BACK
          </Button>
          <Button onClick={submit} className="flex-1 justify-center">
            {submitting ? "..." : "SUBMIT"}
          </Button>
        </div>

      </div>
    </main>
  );
};