"use client";
import React, {useState, useEffect, useMemo} from "react";
import {useRouter} from "next/navigation";
import {ChevronLeft, ChevronRight, Search, Download, Ship, User, Calendar1} from "lucide-react";
import {Button} from "@/components/button";
import DayCell from "@/app/admin/DayCell";

const VESSELS = ["ALL", "BMCC", "EMMA", "PROT", "GYRE", "NAUT", "3RD"];
const CREW = ["ALL", "DOM", "FC"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S",];

interface UserRow {
  email: string;
  firstName: string;
  lastName: string;
  userId: string | null;
  isDomestic: boolean;
  days: Record<string, string>;
}

interface Payload {
  allDays: string[];
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

export default function Admin() {
  const router = useRouter();
  const [mode, setMode] = useState<"weeks" | "months">("weeks");
  const [add, setAdd] = useState(1);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [weekIndex, setWeekIndex] = useState(0);
  const [maskInd, setMaskInd] = useState(1);
  const [mask, setMask] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const [shipFilter, setShipFilter] = useState("ALL");
  const [crewFilter, setCrewFilter] = useState("ALL");
  const [nameFilter, setNameFilter] = useState("");

  const week = payload ? payload.allDays : [];

  useEffect(() => { // day fetcher
    const load = async (): Promise<void> => {
      setLoading(true);
      const route = `/api/admin/getWeeks?ind=${weekIndex}`;
      const res = await fetch(route);
      if (res.status === 401 || res.status === 403) {
        router.push("/");
        return;
      }
      const data = await res.json();
      if (data.resp) {
        setPayload(data.resp);
      }
      setLoading(false);
    }
    load().catch(console.error);
  }, [weekIndex, router]);

  useEffect(() => {
    const getMask = async (): Promise<void> => {
      const inMask = await fetch(`api/admin/getMask?amount=${add}&ind=${maskInd}&mode=${mode}`)
      const inJson = await inMask.json();
      const newMask = inJson.mask
      setMask(newMask)
    }
    getMask().catch(console.error);
  }, [maskInd, mode, add])

  const updateDay = async (email: string, day: string, vessel: string): Promise<void> => {
    const params = new URLSearchParams({email, day, ship: vessel});
    const res = await fetch(`/api/admin/setDay?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`setDay failed: ${res.status}`);
    }

    setPayload((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map((u) =>
          u.email === email
            ? {...u, days: {...u.days, [day]: vessel}}
            : u
        ),
      };
    });
  };


  const filteredUsers = useMemo(() => {
    if (!payload) return [];
    return payload.users.filter((user) => {
      if (nameFilter) {
        const full = `${user.firstName} ${user.lastName}`.toLowerCase();
        if (!full.includes(nameFilter.toLowerCase())) return false;
      }
      if (crewFilter === "DOM" && !user.isDomestic) return false;
      if (crewFilter === "FC" && user.isDomestic) return false;
      if (shipFilter !== "ALL") {
        const hasShip = payload.allDays.some((day) => user.days[day] === shipFilter);
        if (!hasShip) return false;
      }
      return true;
    });
  }, [payload, nameFilter, crewFilter, shipFilter]);

  const exportCsv = () => {
    window.location.href = `/api/admin/getPeriodCsv?ship=${shipFilter}&crew=${crewFilter}&amount=${add}&ind=${maskInd}&mode=${mode}`;
  };

  return (
    <main className="min-h-screen flex flex-col gap-4 p-6">

      {/* ── SPREADSHEET PANEL ────────────────────────────────── */}
      <div className="bg-tdi-blue shadow flex flex-col flex-1">

        <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2 px-1 group/search w-full">
            <Search size={14} className="text-secondary/50 flex-shrink-0"/> {/*search section*/}
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

        {/*user filter stuff*/}
        <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-4">
          <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">
              filter:
            </span>
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Ship size={14} className="text-secondary/50 flex-shrink-0 mr-2"/> {/*boat filter*/}
              {VESSELS.map((v, i) => (
                <span key={v} className="flex items-center">
                                {i > 0 && <Divider/>}
                  <IslandBtn active={shipFilter === v} onClick={() => setShipFilter(v)}>
                                    {v}
                                </IslandBtn>
                            </span>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <User size={14} className="text-secondary/50 flex-shrink-0 mr-2"/> {/*crew filter*/}
              {CREW.map((c, i) => (
                <span key={c} className="flex items-center">
                                {i > 0 && <Divider/>}
                  <IslandBtn active={crewFilter === c} onClick={() => setCrewFilter(c)}>
                                    {c}
                                </IslandBtn>
                            </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="px-4 py-3 border-b border-secondary/20 flex items-center gap-4 justify-between"> {/* export info*/}
          <div className="flex items-center gap-1">
            <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">
              export:
            </span>
            <div className='flex gap-4 items-center'>
              <div className='flex flex-row gap-4'> {/*mask area*/}
                <button
                  onClick={() => setMaskInd((i) => i + 1)}
                  className="text-secondary/40 hover:text-secondary disabled:opacity-20 transition-colors duration-200"
                >
                  <ChevronLeft size={15}/>
                </button>
                <span
                  className="text-secondary font-semibold uppercase tracking-tight text-sm min-w-[160px] text-center">
                  {mask.length !== 0 ? `${mask[0].slice(5,)} — ${mask[mask.length - 1].slice(5,)}` : 'loading'}
                </span>
                <button
                  onClick={() => setMaskInd((i) => Math.max(1, i - 1))}
                  className="text-secondary/40 hover:text-secondary disabled:opacity-20 transition-colors duration-200"
                >
                  <ChevronRight size={15}/>
                </button>
              </div>
              <div className="flex items-center gap-3"> {/*range*/}
                <button
                  onClick={() => setAdd((a) => Math.max(1, a - 1))}
                  className="text-secondary/50 hover:text-secondary transition-colors duration-200 font-bold text-sm w-4 text-center"
                >−
                </button>
                <span className="text-secondary text-xs font-semibold w-5 text-center select-none">
              {mode == 'weeks' ? add * 2 : add}
            </span>
                <button
                  onClick={() => setAdd((a) => a + 1)}
                  className="text-secondary/50 hover:text-secondary transition-colors duration-200 font-bold text-sm w-4 text-center"
                >+
                </button>
              </div>
              <div className="flex items-center justify-between gap-1"> {/*export type*/}
                {(["weeks", "months"] as const).map((m, i) => ( // WHY ARE YOU SO TALL FIX LATER
                  <span key={m} className="flex items-center">
                {i > 0 && <Divider/>}
                    <IslandBtn
                      active={mode === m}
                      onClick={() => {
                        setMode(m);
                        setAdd(1);
                        setMaskInd(1);
                      }}
                    >
                  {m}
                </IslandBtn>
              </span>
                ))}
              </div>
            </div>
          </div>
          <div> {/*export button*/}
            <Button onClick={exportCsv} className="justify-center gap-2 w-full py-1" noshadow={true}>
              <div className={'flex items-center justify-between w-full gap-2'}>
                <Download size={15}/>
                csv
              </div>
            </Button>
          </div>

        </div>
        <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-4">
          <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">
              display:
            </span>
          <button
            onClick={() => setWeekIndex((i) => i + 1)}
            className="text-secondary/40 hover:text-secondary disabled:opacity-20 transition-colors duration-200"
          >
            <ChevronLeft size={15}/>
          </button>
          <span className="text-secondary font-semibold uppercase tracking-tight text-sm min-w-[160px] text-center">
            {payload ? `${payload.allDays[0].slice(5,)} — ${payload.allDays[6].slice(5,)}` : 'loading'}
          </span>
          <button
            onClick={() => setWeekIndex((i) => i - 1)}
            className="text-secondary/40 hover:text-secondary disabled:opacity-20 transition-colors duration-200"
          >
            <ChevronRight size={15}/>
          </button>
          <button
            onClick={() => setWeekIndex(0)}
            className="text-secondary/40 hover:text-secondary disabled:opacity-20 transition-colors duration-200"
          >
            <Calendar1 size={15}/>
          </button>

          <div className="ml-auto flex items-center gap-6">
            <span className="text-secondary/50 text-xs uppercase tracking-widest font-semibold">
              {filteredUsers.filter(u => week.some(d => u.days[d])).length} reported
            </span>
            <span className="text-secondary/30 text-xs uppercase tracking-widest font-semibold">
              {filteredUsers.filter(u => !week.some(d => u.days[d])).length} pending
            </span>
          </div>
        </div>

        {/* White inset table */}
        <div className="bg-secondary shadow mx-4 my-4">
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
                {week.map((day, i) => (
                  <th key={day}
                      className={`text-center px-1 py-2 w-[64px]`}>
                    <div
                      className={`text-xs font-semibold uppercase tracking-widest text-primary ${mask.includes(day) ? 'bg-green-500' : ''} rounded-t-xl transition-all duration-200 ease-in-out`}>{DAY_LABELS[i % 7]}</div>
                    <div
                      className={`text-xs text-primary font-medium ${mask.includes(day) ? 'bg-green-500' : ''} rounded-b-xl transition-all duration-200 ease-in-out`}>{day.slice(8)}</div>
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
                  <td colSpan={4 + week.length}
                      className="py-8 text-center text-xs uppercase tracking-widest text-primary/30 font-semibold">
                    no results
                  </td>
                </tr>
              ) : filteredUsers.map((user, idx) => {
                const weekDaysWorked = week.filter((d) => user.days[d]).length;
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
                      {user.userId ? (
                        <span className={`text-xs font-semibold uppercase tracking-tight ${
                          user.isDomestic ? "text-primary" : "text-tdi-blue"
                        }`}>
                          {user.userId}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-tight text-primary/20">
                          —
                        </span>
                      )}
                    </td>
                    {week.map((day) => {
                      const ship = user.days[day];
                      return (
                        <DayCell
                          key={day}
                          ship={ship}
                          day={day}
                          vessels={VESSELS}
                          onUpdate={(d, v) => updateDay(user.email, d, v)}
                        />
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
      <div className={'h-[170px]'}></div>
      {/*this is a spacer*/}
    </main>
  );
}