"use client";
import React, {useState, useEffect, useMemo} from "react";
import {useRouter} from "next/navigation";
import {ChevronLeft, ChevronRight, Search, Download, Ship, User} from "lucide-react";
import {Button} from "@/components/button";

const VESSELS = ["ALL", "BMCC", "EMMA", "PROT", "GYRE", "NAUT", "3RD"];
const CREW = ["ALL", "DOM", "FOR"];
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S",];

interface UserRow {
  email: string;
  firstName: string;
  lastName: string;
  domesticId?: string | null;
  days: Record<string, string>;
}

interface Payload {
  weeks: string[][];
  users: UserRow[];
}

const IslandBtn = ({
                     active,
                     onClick,
                     children,
                   }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="group relative px-3 py-2 flex flex-col items-center"
  >
        <span className={`text-xs font-semibold uppercase tracking-tight transition-colors duration-200 select-none ${
          active ? "text-secondary" : "text-secondary/40 group-hover:text-secondary"
        }`}>
            {children}
        </span>
    <div className={`h-[2px] bg-secondary transition-all duration-300 ease-in-out mt-1 ${
      active ? "w-full" : "w-0 group-hover:w-full"
    }`}/>
  </button>
);

const Divider = () => (
  <div className="w-[2px] h-[16px] bg-secondary/20 self-center mx-1"/>
);

const HDivider = () => (
  <div className="h-[2px] w-full bg-secondary/20 my-1"/>
);

export default function Admin() {
  const router = useRouter();
  const [mode, setMode] = useState<"weeks" | "months">("weeks");
  const [add, setAdd] = useState(0);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [weekIndex, setWeekIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [shipFilter, setShipFilter] = useState("ALL");
  const [crewFilter, setCrewFilter] = useState("ALL");
  const [nameFilter, setNameFilter] = useState("");

  console.log(payload);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const route = mode === "weeks"
        ? `/api/admin/getDomesticPeriods?add=${add}`
        : `/api/admin/getIntlPeriods?add=${add}`;

      const res = await fetch(route);
      if (res.status === 401 || res.status === 403) {
        router.push("/");
        return;
      }
      const data = await res.json();
      if (data.resp) {
        setPayload(data.resp);
        setWeekIndex(data.resp.weeks.length - 1);
      }
      setLoading(false);
    }

    load();
  }, [mode, add, router]);

  const currentWeek = payload?.weeks[weekIndex] ?? [];


  const filteredUsers = useMemo(() => {
    if (!payload) return [];
    return payload.users.filter((user) => {
      if (nameFilter) {
        const full = `${user.firstName} ${user.lastName}`.toLowerCase();
        if (!full.includes(nameFilter.toLowerCase())) return false;
      }
      if (crewFilter === "DOM" && !user.domesticId) return false;
      if (crewFilter === "FC" && user.domesticId) return false;
      if (shipFilter !== "ALL") {
        const hasShip = currentWeek.some((day) => user.days[day] === shipFilter);
        if (!hasShip) return false;
      }
      return true;
    });
  }, [payload, nameFilter, crewFilter, shipFilter, currentWeek]);

  const exportCsv = () => {
    const params = new URLSearchParams({
      mode, add: String(add), ship: shipFilter, crew: crewFilter,
    });
    window.location.href = `/api/admin/getPeriodCsv?${params}`;
  };

  const weekLabel = currentWeek.length
    ? `${currentWeek[0].slice(5)} — ${currentWeek[currentWeek.length - 1].slice(5)}`
    : "—";

  return (
    <main className="min-h-screen flex flex-col gap-4 p-6">

      {/* ── TOP BAR ──────────────────────────────────────────── */}
      <div className="flex items-start gap-4">

        {/* Island 1 — filters, stacked vertically */}
        <div className="bg-tdi-blue shadow flex flex-col px-4 py-3 gap-3 w-full">

          {/* Vessel filter row */}
          <div className="flex items-center gap-1">
            <Ship size={14} className="text-secondary/50 flex-shrink-0 mr-2"/>
            {VESSELS.map((v, i) => (
              <span key={v} className="flex items-center">
                                {i > 0 && <Divider/>}
                <IslandBtn active={shipFilter === v} onClick={() => setShipFilter(v)}>
                                    {v}
                                </IslandBtn>
                            </span>
            ))}
          </div>

          <HDivider/>

          {/* Crew filter row */}
          <div className="flex items-center gap-1">
            <User size={14} className="text-secondary/50 flex-shrink-0 mr-2"/>
            {CREW.map((c, i) => (
              <span key={c} className="flex items-center">
                                {i > 0 && <Divider/>}
                <IslandBtn active={crewFilter === c} onClick={() => setCrewFilter(c)}>
                                    {c}
                                </IslandBtn>
                            </span>
            ))}
          </div>

          <HDivider/>

          {/* Search row */}
          <div className="flex items-center gap-2 px-1 group/search w-full">
            <Search size={14} className="text-secondary/50 flex-shrink-0"/>
            <div className="w-full">
              <input
                type="text"
                placeholder="user search..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="peer bg-transparent text-secondary text-xs font-semibold uppercase tracking-tight placeholder:text-secondary/30 outline-none w-full"
              />
              <div
                className="h-[2px] w-full bg-secondary/20 mt-1 peer-focus:bg-secondary transition-colors duration-300 ease-in-out"/>
            </div>
          </div>
        </div>

        {/* Island 2 — mode + weeks + export, stacked vertically */}
        <div className="bg-tdi-blue shadow flex flex-col px-4 py-3 gap-3 ml-auto w-160">

          {/* DOM / FC */}
          <div className="flex items-center justify-between gap-1">
            {(["weeks", "months"] as const).map((m, i) => (
              <span key={m} className="flex items-center">
                {i > 0 && <Divider/>}
                <IslandBtn
                  active={mode === m}
                  onClick={() => {
                    setMode(m);
                    setAdd(0);
                  }}
                >
                  {m}
                </IslandBtn>
              </span>
            ))}
          </div>

          <HDivider/>

          {/* Weeks +/- */}
          <div className="flex items-center justify-between px-1">
                        <span className="text-secondary/40 text-xs uppercase tracking-widest font-semibold select-none">
                            periods
                        </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAdd((a) => Math.max(0, a - 1))}
                className="text-secondary/50 hover:text-secondary transition-colors duration-200 font-bold text-sm w-4 text-center"
              >−
              </button>
              <span className="text-secondary text-xs font-semibold w-5 text-center select-none">
                                {add + 1}
                            </span>
              <button
                onClick={() => setAdd((a) => Math.min(50, a + 1))}
                className="text-secondary/50 hover:text-secondary transition-colors duration-200 font-bold text-sm w-4 text-center"
              >+
              </button>
            </div>
          </div>

          <HDivider/>

          {/* Export button */}
          <Button onClick={exportCsv} className="justify-center gap-2 w-full" noshadow={true}>
            <div className={'flex items-center justify-between w-full'}>
              <Download size={30}/>
              CSV
            </div>
          </Button>
        </div>
      </div>

      {/* ── SPREADSHEET PANEL ────────────────────────────────── */}
      <div className="bg-tdi-blue shadow flex flex-col flex-1">

        {/* Panel header — week nav lives here */}
        <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-4">
          <button
            onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
            disabled={weekIndex === 0}
            className="text-secondary/40 hover:text-secondary disabled:opacity-20 transition-colors duration-200"
          >
            <ChevronLeft size={15}/>
          </button>
          <span className="text-secondary font-semibold uppercase tracking-tight text-sm min-w-[160px] text-center">
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekIndex((i) => Math.min((payload?.weeks.length ?? 1) - 1, i + 1))}
            disabled={weekIndex === (payload?.weeks.length ?? 1) - 1}
            className="text-secondary/40 hover:text-secondary disabled:opacity-20 transition-colors duration-200"
          >
            <ChevronRight size={15}/>
          </button>

          <div className="ml-auto flex items-center gap-6">
            <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">
              {filteredUsers.filter(u => currentWeek.some(d => u.days[d])).length} reported
            </span>
            <span className="text-secondary/30 text-xs uppercase tracking-widest font-semibold">
              {filteredUsers.filter(u => !currentWeek.some(d => u.days[d])).length} pending
            </span>
          </div>
        </div>

        {/* White inset table */}
        <div className="bg-secondary shadow mx-4 my-4 overflow-auto">
          {loading ? (
            <div className="text-primary/30 text-xs uppercase tracking-widest font-semibold p-6">
              loading...
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
              <tr className="border-b border-primary/10">
                <th
                  className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary w-[180px]">Name
                </th>
                <th
                  className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-widest text-primary w-[50px]">ID
                </th>
                {currentWeek.map((day, i) => (
                  <th key={day} className="text-center px-1 py-2 w-[64px]">
                    <div
                      className="text-xs font-semibold uppercase tracking-widest text-primary">{DAYS_SHORT[i % 7]}</div>
                    <div className="text-xs text-primary font-medium">{day.slice(8)}</div>
                  </th>
                ))}
                <th
                  className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-widest text-primary w-[40px]">Σ
                </th>
              </tr>
              </thead>
              <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4 + currentWeek.length}
                      className="py-8 text-center text-xs uppercase tracking-widest text-primary/30 font-semibold">
                    no results
                  </td>
                </tr>
              ) : filteredUsers.map((user, idx) => {
                const weekDaysWorked = currentWeek.filter((d) => user.days[d]).length;
                const hasReported = weekDaysWorked > 0;
                return (
                  <tr
                    key={user.email}
                    className={`border-b border-primary/5 transition-colors duration-150 hover:bg-tdi-blue/5 ${
                      idx % 2 === 0 ? "" : "bg-primary/[0.02]"
                    }`}
                  >
                    <td className="px-4 py-2">
                      <div
                        className={`text-xs font-semibold uppercase tracking-tight ${hasReported ? "text-primary" : "text-primary/25"}`}>
                        {user.lastName}, {user.firstName}
                      </div>
                      <div className="text-xs text-primary/25 tracking-tight">{user.email}</div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {user.domesticId ? (
                        <span className="text-xs font-semibold uppercase tracking-tight text-primary">
                          {user.domesticId}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-tight text-primary/40">
                          FC
                        </span>
                      )}
                    </td>
                    {currentWeek.map((day) => {
                      const ship = user.days[day];
                      return (
                        <td key={day} className="px-1 py-2 text-center">
                          {ship ? (
                            <span
                              className="text-xs font-semibold uppercase tracking-tight text-tdi-blue bg-tdi-blue/10 px-1.5 py-0.5">
                              {ship}
                            </span>
                          ) : (
                            <span className="text-primary/15 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`text-xs font-semibold ${weekDaysWorked > 0 ? "text-primary" : "text-primary/20"}`}>
                        {weekDaysWorked || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}