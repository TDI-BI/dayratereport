"use client";
import {useState, useEffect} from "react";
import {Mail, ChevronLeft, ChevronRight, Search} from "lucide-react";
import {fetchBoth} from "@/utils/fetchboth";

const timeAgo = (isoDate: string) => {
  const now = new Date();
  const then = new Date(isoDate);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  const m = Math.floor(diff / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  const w = Math.floor(d / 7), mo = Math.floor(d / 30), y = Math.floor(d / 365);
  if (diff < 60) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  if (w < 5) return `${w}w ago`;
  if (mo < 12) return `${mo}mo ago`;
  return `${y}y ago`;
};

const ViewEmails = () => {
  const [filter, setFilter] = useState('');
  const [emails, setEmails] = useState<Array<Record<string, string>>>([]);
  const [page, setPage] = useState(1);
  const [emailId, setEmailId] = useState('');

  const selectedEmail = emails.find((e) => e.id === emailId) ?? null;

  useEffect(() => {
    const load = async () => {
      const res = await fetchBoth(`/api/admin/getEmails?user=${filter}&page=${page}&status=0`);
      const json = await res.json();
      const raw = json.emails ?? [];
      setEmails(raw.sort((a: Record<string, string>, b: Record<string, string>) => a.id < b.id ? 1 : -1));
    };
    load();
  }, [filter, page]);

  return (
    <main className="min-h-screen flex gap-6 p-6">

      {/* ── LEFT: Email list ──────────────────────────────── */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">

        {/* Search + pagination island */}
        <div className="bg-tdi-blue shadow px-4 py-3 flex items-center gap-4">
          <Search size={14} className="text-secondary/50 flex-shrink-0"/>
          <div className="flex-1">
            <input
              type="text"
              placeholder="search by user..."
              value={filter}
              onChange={(e) => {
                setPage(1);
                setFilter(e.target.value);
              }}
              className="peer bg-transparent text-secondary text-xs font-semibold uppercase tracking-tight placeholder:text-secondary/30 outline-none w-full"
            />
            <div
              className="h-[2px] w-full bg-secondary/20 mt-1 peer-focus:bg-secondary transition-colors duration-300 ease-in-out"/>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => {
                if (page > 1) setPage(page - 1);
              }}
              disabled={page === 1}
              className="p-2 text-secondary/40 hover:text-secondary disabled:opacity-20 transition-colors duration-200"
            >
              <ChevronLeft size={15}/>
            </button>
            <span className="text-secondary/50 text-xs font-semibold uppercase tracking-widest px-2 select-none">
                            {page}
                        </span>
            <button
              onClick={() => {
                if (emails.length > 0) setPage(page + 1);
              }}
              disabled={emails.length === 0}
              className="p-2 text-secondary/40 hover:text-secondary disabled:opacity-20 transition-colors duration-200"
            >
              <ChevronRight size={15}/>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-tdi-blue shadow flex flex-col flex-1">
          <div className="px-5 py-3 border-b border-secondary/20 flex items-center">
            <span className="text-secondary font-semibold uppercase tracking-tight text-sm flex-1">Emails</span>
            <span className="text-secondary/40 text-xs uppercase tracking-widest font-semibold">{emails.length}</span>
          </div>

          <div className="bg-secondary shadow mx-4 my-4 overflow-auto">
            {/* Header */}
            <div className="flex items-center px-4 py-2 border-b border-primary/10">
              <div className="w-[90px] text-xs font-semibold uppercase tracking-widest text-primary/40">Status</div>
              <div className="flex-1 text-xs font-semibold uppercase tracking-widest text-primary/40">Recipient</div>
              <div
                className="w-[100px] text-center text-xs font-semibold uppercase tracking-widest text-primary/40">Sent
              </div>
            </div>

            {emails.length === 0 ? (
              <div className="py-8 text-center text-xs uppercase tracking-widest text-primary/30 font-semibold">
                no emails
              </div>
            ) : emails.map((e, idx) => {
              const isErr = e.status.split(':')[0] === 'Failure';
              const isSelected = emailId === e.id;
              return (
                <div
                  key={`email_${e.id}`}
                  onClick={() => setEmailId(isSelected ? '' : e.id)}
                  className={`flex items-center px-4 py-2 cursor-pointer border-b border-primary/5 transition-all duration-150 ${
                    isSelected
                      ? "bg-tdi-blue/10"
                      : idx % 2 === 0 ? "hover:bg-tdi-blue/5" : "bg-primary/[0.02] hover:bg-tdi-blue/5"
                  }`}
                >
                  {/* Status */}
                  <div className="w-[90px] flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 flex-shrink-0 ${isErr ? "bg-red-400" : "bg-tdi-blue"}`}/>
                    <span className={`text-xs font-semibold uppercase tracking-tight ${
                      isErr ? "text-red-400" : "text-primary/60"
                    }`}>
                                            {isErr ? "Fail" : "OK"}
                                        </span>
                  </div>

                  {/* Recipient */}
                  <div className="flex-1 text-xs text-primary/60 tracking-tight truncate" title={e.sentTo}>
                    {e.sentTo}
                  </div>

                  {/* Time */}
                  <div className="w-[100px] text-center text-xs text-primary/35 tracking-tight">
                    {timeAgo(e.date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Email detail ───────────────────────────── */}
      <div className="w-[400px] flex-shrink-0">
        <div className="bg-tdi-blue shadow flex flex-col h-full">
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-2">
            <Mail size={14} className="text-secondary/50"/>
            <span className="text-secondary font-semibold uppercase tracking-tight text-sm">
                            {selectedEmail ? "Email Detail" : "Select an email"}
                        </span>
          </div>

          {selectedEmail ? (
            <div className="flex flex-col gap-3 px-4 py-4">
              {/* Meta */}
              <div className="bg-secondary shadow px-4 py-3 flex flex-col gap-2">
                {[
                  {label: "To", value: selectedEmail.sentTo},
                  {label: "Subject", value: selectedEmail.subject},
                  {label: "Status", value: selectedEmail.status},
                  {label: "Sent", value: timeAgo(selectedEmail.date)},
                ].map(({label, value}) => (
                  <div key={label}>
                    <div className="flex justify-between gap-4">
                      <span
                        className="text-xs text-primary/40 uppercase tracking-widest font-semibold flex-shrink-0">{label}</span>
                      <span
                        className="text-xs font-semibold text-primary tracking-tight text-right truncate">{value}</span>
                    </div>
                    <div className="h-[1px] bg-primary/10 mt-2"/>
                  </div>
                ))}
              </div>

              {/* Body */}
              <div className="bg-secondary shadow px-4 py-3">
                <div className="text-xs text-primary/40 uppercase tracking-widest font-semibold mb-2">Body</div>
                <div
                  className="text-xs text-primary leading-relaxed overflow-auto max-h-[400px]"
                  dangerouslySetInnerHTML={{__html: selectedEmail.body}}
                />
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-secondary/30 text-xs uppercase tracking-widest font-semibold">
              no email selected
            </div>
          )}
        </div>
      </div>

    </main>
  );
};

export default ViewEmails;