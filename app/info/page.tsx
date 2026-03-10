"use client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {fetchBoth} from "@/utils/fetchboth";
import {Button} from "@/components/button";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DayCard = ({day, index, ship}: { day: string; index: number; ship: string | undefined }) => (
  <div className={`bg-secondary shadow flex flex-col px-3 py-2 ${ship ? "" : "opacity-50"}`}>
    <div className="text-xs font-semibold uppercase tracking-tight text-primary">
      {DAYS[index % 7]}
    </div>
    <div className="text-xs font-semibold uppercase tracking-tight text-primary/50">
      {day.slice(5, 10)}
    </div>
    <div className="mt-1 h-[1px] w-full bg-primary/10"/>
    <div
      className={`mt-1 text-xs font-semibold uppercase tracking-tight text-primary`}>
      {ship || "—"}
    </div>
  </div>
);

const Profile = () => {
  const router = useRouter();
  const [account, setAccount] = useState<Record<string, any>>({});
  const [weekOne, setWeekOne] = useState<string[]>([]);
  const [weekTwo, setWeekTwo] = useState<string[]>([]);
  const [vessels, setVessels] = useState<Record<string, string>>({});
  const [daysWorked, setDaysWorked] = useState(0);

  useEffect(() => {
    async function load() {
      const authRes = await fetchBoth("/api/account/myAccountInfo?fields=firstName,lastName,email,isDomestic");
      if (authRes.status === 401) {
        router.push("/");
        return;
      }
      const authData = await authRes.json();
      setAccount(authData.resp);

      if (authData.resp?.isDomestic) {
        // Domestic: fetch both weeks of the biweekly period
        const [domRes, p1Res, p2Res, w1Res, w2Res] = await Promise.all([
          fetchBoth("/api/period/getLatestDomesticPeriod"),
          fetchBoth("/api/days/verifyDate?prev=0"),
          fetchBoth("/api/days/verifyDate?prev=1"),
          fetchBoth("/api/days/getWorkWeek?prev=0"),
          fetchBoth("/api/days/getWorkWeek?prev=1"),
        ]);

        const domData = await domRes.json();
        const fullPeriod: string[] = domData.resp ?? [];

        const p1Data = await p1Res.json();
        const p2Data = await p2Res.json();
        const w1 = p1Data.resp ?? [];
        const w2 = p2Data.resp ?? [];

        // Figure out which week is first in the period
        if (fullPeriod.includes(w1[0])) {
          setWeekOne(w1);
          setWeekTwo(w2);
        } else {
          setWeekOne(w2);
          setWeekTwo(w1);
        }

        const dict: Record<string, string> = {};
        let worked = 0;
        for (const res of [w1Res, w2Res]) {
          const data = await res.json();
          data.resp?.forEach((entry: { day: string; ship: string }) => {
            if (entry.ship) {
              dict[entry.day] = entry.ship;
              worked++;
            }
          });
        }
        setVessels(dict);
        setDaysWorked(worked);
      } else {
        // Foreign: just current week
        const [periodRes, weekRes] = await Promise.all([
          fetchBoth("/api/days/verifyDate?prev=0"),
          fetchBoth("/api/days/getWorkWeek?prev=0"),
        ]);
        const periodData = await periodRes.json();
        setWeekOne(periodData.resp ?? []);

        const weekData = await weekRes.json();
        const dict: Record<string, string> = {};
        let worked = 0;
        weekData.resp?.forEach((entry: { day: string; ship: string }) => {
          if (entry.ship) {
            dict[entry.day] = entry.ship;
            worked++;
          }
        });
        setVessels(dict);
        setDaysWorked(worked);
      }
    }

    load();
  }, [router]);

  const allDays = [...weekOne, ...weekTwo];

  return (
    <main className="flex justify-center px-5 min-h-screen">
      <div className="w-full max-w-[360px] py-8 flex flex-col gap-6">

        {/* Account info card — header has name left, INFO right */}
        <div className="bg-tdi-blue shadow flex flex-col">
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center justify-between">
            <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">
              Name
            </span>
            <span className="text-secondary font-semibold uppercase tracking-tight text-sm">
              {account.firstName ? `${account.firstName} ${account.lastName}` : "—"}
            </span>

          </div>
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center justify-between">
            <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">Email</span>
            <span className="text-secondary text-xs font-semibold tracking-tight">{account.email || "—"}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">Crew Type</span>
            <span className="text-secondary text-xs font-semibold uppercase tracking-tight">
              {account.isDomestic !== undefined ? (account.isDomestic ? "Domestic" : "Foreign") : "—"}
            </span>
          </div>
        </div>

        {/* Period card */}
        <div className="bg-tdi-blue shadow flex flex-col">
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center justify-between">
                        <span className="text-secondary font-semibold uppercase tracking-tight text-sm">
                            {account.isDomestic ? "Current Period" : "This Week"}
                        </span>
            <span className="text-secondary/50 text-xs font-semibold uppercase tracking-widest">
                            {daysWorked} days worked
                        </span>
          </div>

          {/* Two-column grid of day cards */}
          <div className={`p-3 grid gap-2 ${weekTwo.length > 0 ? "grid-cols-2" : "grid-cols-2"}`}>
            {/* Week 1 */}
            <div className="flex flex-col gap-3">
              {weekOne.map((day, i) => (
                <DayCard key={day} day={day} index={i} ship={vessels[day]}/>
              ))}
            </div>
            {/* Week 2 (domestic only) */}
            {weekTwo.length > 0 && (
              <div className="flex flex-col gap-3">
                {weekTwo.map((day, i) => (
                  <DayCard key={day} day={day} index={i} ship={vessels[day]}/>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Issues button */}
        <a href="mailto:parkerseeley@tdi-bi.com" className="flex">
          <Button className="w-full justify-center">
            ISSUES?
          </Button>
        </a>

      </div>
    </main>
  );
};

export default Profile;