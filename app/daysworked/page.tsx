"use client";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {ChevronLeft, ChevronRight, X} from "lucide-react";
import {Button} from "@/components/button";
import {fetchBoth} from "@/utils/fetchboth";
import {getPeriod} from "@/utils/payperiod";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VESSELS = ["NONE", "BMCC", "EMMA", "PROT", "GYRE", "NAUT", "3RD"];

export default function Home() {
  const router = useRouter();
  const [prev, setPrev] = useState(0);
  const [isDomestic, setIsDomestic] = useState<boolean | null>(null);
  const [vessels, setVessels] = useState<Record<string, string>>({});
  const [period, setPeriod] = useState<string[]>(getPeriod());
  const [modalDay, setModalDay] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Auth + account type — runs once
  useEffect(() => {
    async function init() {
      const authRes = await fetchBoth("/api/account/myAccountInfo?fields=email,isDomestic");
      if (authRes.status === 401) {
        router.push("/");
        return;
      }
      const authData = await authRes.json();
      setIsDomestic(!!authData.resp?.isDomestic);
    }

    init();
  }, [router]);

  // Period + saved days — re-runs whenever prev changes
  useEffect(() => {
    async function loadWeek() {
      const [periodRes, weekRes] = await Promise.all([
        fetchBoth(`/api/days/verifyDate?prev=${prev}`),
        fetchBoth(`/api/days/getWorkWeek?prev=${prev}`),
      ]);

      const periodData = await periodRes.json();
      if (periodData.resp) setPeriod(periodData.resp);

      const weekData = await weekRes.json();
      if (weekData.resp) {
        const saved: Record<string, string> = {};
        weekData.resp.forEach((entry: { day: string; ship: string }) => {
          if (entry.ship) saved[entry.day] = entry.ship;
        });
        setVessels(saved);
      }
    }

    loadWeek();
  }, [prev]);

  const checkBounds = async (direction: "prev" | "next") => {
    const candidate = direction === "prev" ? prev + 1 : prev - 1;

    const res = await fetchBoth(`/api/days/verifyDate?prev=${candidate}`);
    const {resp: candidateWeek} = await res.json();

    if (isDomestic) {
      const domRes = await fetchBoth("/api/period/getLatestDomesticPeriod");
      const {resp: domPeriod} = await domRes.json();
      return candidateWeek.some((d: string) => domPeriod.includes(d));
    } else {
      const currentMonth = Number(getPeriod()[0].slice(5, 7));
      return candidateWeek.some((d: string) => Number(d.slice(5, 7)) === currentMonth);
    }
  };

  const navigate = async (direction: "prev" | "next") => {
    if (saving) return;
    const allowed = await checkBounds(direction);
    if (!allowed) {
      setSaveMsg("out of range");
      await new Promise((r) => setTimeout(r, 1000));
      setSaveMsg("");
      return;
    }
    setPrev((p) => direction === "prev" ? p + 1 : p - 1);
  };

  // Animate modal in after mount
  useEffect(() => {
    if (modalDay) {
      const t = setTimeout(() => setModalVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setModalVisible(false);
    }
  }, [modalDay]);

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setModalDay(null), 250);
  };

  const save = async (notimer = 0) => {
    if (saving) return;
    setSaving(true);
    setSaveMsg("saving...");

    const daysParam = period
      .filter((day) => vessels[day])
      .map((day) => `${day}:${vessels[day]}`)
      .join(";");

    const res = await fetchBoth(`/api/days/create?days=${daysParam}&prev=${prev}`);

    if (res.status === 200) {
      setSaveMsg("saved!");
    } else {
      const body = await res.json();
      setSaveMsg(`error: ${body.error ?? "unknown"}`);
    }
    setSaving(false);
    if (!notimer) await new Promise((r) => setTimeout(r, 5000));
    setSaveMsg("");
  };

  const modalIndex = modalDay ? period.indexOf(modalDay) : -1;

  return (
    <main className="flex justify-center px-5 bg-secondary min-h-screen">
      <div className="w-full max-w-[360px] py-8 flex flex-col gap-6">

        {/* Nav Buttons */}
        <div className="flex gap-4">
          <Button onClick={() => navigate("prev")} className="w-full items-center">
            <div className="flex justify-center items-center gap-2 w-full">
              <ChevronLeft size={16}/>
              <span>PREV</span>
            </div>
          </Button>
          <Button onClick={() => navigate("next")} className="w-full items-center">
            <div className="flex justify-center items-center gap-2 w-full">
              <span>NEXT</span>
              <ChevronRight size={16}/>
            </div>
          </Button>
        </div>

        {/* Calendar — blue frame, white cards */}
        <div className="bg-tdi-blue p-3 shadow grid grid-cols-2 gap-3">
          {period.map((day, i) => (
            <div
              key={day}
              id={day + "flash"}
              className={i === period.length - 1 ? "col-span-1" : ""}
            >
              <div
                className="group cursor-pointer bg-secondary text-primary shadow transition-all duration-300 ease-in-out relative overflow-visible"
                onClick={() => setModalDay(day)}
              >
                {/* Corner ticks */}
                <span
                  className="absolute top-0 left-0 h-[2px] w-0 bg-tdi-blue group-hover:w-3 transition-all duration-300 ease-in-out"/>
                <span
                  className="absolute top-0 left-0 w-[2px] h-0 bg-tdi-blue group-hover:h-3 transition-all duration-300 ease-in-out"/>
                <span
                  className="absolute bottom-0 right-0 h-[2px] w-0 bg-tdi-blue group-hover:w-3 transition-all duration-300 ease-in-out"/>
                <span
                  className="absolute bottom-0 right-0 w-[2px] h-0 bg-tdi-blue group-hover:h-3 transition-all duration-300 ease-in-out"/>

                <div className="px-4 py-3">
                  <div className="font-semibold uppercase tracking-tight text-sm text-primary">
                    {DAYS[i]}
                  </div>
                  <div className="text-xs tracking-tight text-primary/50">
                    {day.slice(5, 10)}
                  </div>
                  <div className="mt-2 h-[2px] w-full bg-primary/10"/>
                  <div className="mt-2 text-sm font-semibold uppercase tracking-tight text-primary">
                    {vessels[day] || "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Status message in the natural 8th grid cell */}
          <div className="flex items-center justify-center px-3">
                        <span
                          className={`text-xs font-semibold uppercase tracking-tight transition-all duration-300 ease-in-out ${
                            saveMsg.startsWith("error") || saveMsg === "out of range"
                              ? "text-red-300"
                              : "text-secondary/70"
                          }`}>
                            {saveMsg}
                        </span>
          </div>
        </div>

        {/* Save / Review Buttons */}
        <div className="flex gap-4">
          <Button onClick={save} className="flex-1 justify-center">
            {saving ? "..." : "SAVE"}
          </Button>
          <Button onClick={async () => {
            try {
              await save(1);
              router.push(`/daysworked/review?prev=${prev}`)
            } catch (error) {
              console.error(error)
            }
            return;
          }} className="flex-1 justify-center">
            REVIEW
          </Button>
        </div>

      </div>

      {/* Modal */}
      {modalDay && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-250 ease-in-out ${
            modalVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-primary/70"/>

          <div
            className={`relative w-full max-w-[300px] shadow-2xl transition-all duration-250 ease-in-out ${
              modalVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-tdi-blue px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-secondary font-semibold uppercase tracking-tight text-sm">
                  {DAYS[modalIndex]}
                </div>
                <div className="text-secondary/60 text-xs tracking-tight">
                  {modalDay.slice(5, 10)}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-secondary/60 hover:text-secondary transition-colors duration-200"
              >
                <X size={18}/>
              </button>
            </div>

            {/* Vessel List */}
            <div className="bg-secondary">
              {VESSELS.map((v) => {
                const isSelected = (v === "NONE" && !vessels[modalDay]) || v === vessels[modalDay];
                return (
                  <div
                    key={v}
                    className={`px-5 py-3 cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-between ${
                      isSelected
                        ? "bg-tdi-blue text-secondary"
                        : "text-primary hover:bg-tdi-blue hover:text-secondary"
                    }`}
                    onClick={() => {
                      setVessels((prev) => ({
                        ...prev,
                        [modalDay]: v === "NONE" ? "" : v,
                      }));
                      closeModal();
                    }}
                  >
                    <span className="text-sm font-semibold uppercase tracking-tight">{v}</span>
                    {isSelected && <div className="w-[6px] h-[6px] bg-secondary"/>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}