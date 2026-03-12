'use client';

import React, {useState, useEffect} from 'react';
import {Download, Search} from 'lucide-react';
import {Button} from "@/components/button";
import {UserRow} from "./interfaces";
import EditPanel from "./editPanel";
import InvitePanel from "./invitePanel";


export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);


  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/getUsers');
      const data = await res.json();
      if (data.resp) setUsers(data.resp);
    }

    load();
  }, []);

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(filter.toLowerCase())
  );

  const selectedUser = users.find((u) => u.email === selectedEmail) ?? null;

  const updateUser = (email: string, patch: Partial<UserRow>) => {
    setUsers((prev) => prev.map((u) => u.email === email ? {...u, ...patch} : u));
  };


  return (
    <main className="min-h-screen flex gap-6 p-6">

      {/* ── LEFT: User sheet ──────────────────────────────── */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">

        {/* Search island */}
        <div className="bg-tdi-blue shadow px-4 py-3 flex items-center gap-2">
          <Search size={14} className="text-secondary/50 flex-shrink-0"/>
          <div className="flex-1">
            <input
              type="text"
              placeholder="search..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="peer bg-transparent text-secondary text-xs font-semibold uppercase tracking-tight placeholder:text-secondary/30 outline-none w-full"
            />
            <div
              className="h-[2px] w-full bg-secondary/20 mt-1 peer-focus:bg-secondary transition-colors duration-300 ease-in-out"/>
          </div>
        </div>

        {/* Table */}
        <div className="bg-tdi-blue shadow flex flex-col flex-1">
          <div className="px-5 py-3 border-b border-secondary/20 flex items-center">
            <span className="text-secondary font-semibold uppercase tracking-tight text-sm flex-1">Users</span>
            <span
              className="text-secondary/40 text-xs uppercase tracking-widest font-semibold">{filteredUsers.length}</span>
          </div>

          <div className="bg-secondary shadow mx-4 my-4 overflow-auto">
            {/* Header row */}
            <div className="flex items-center px-4 py-2 border-b border-primary/10">
              <div className="w-[180px] text-xs font-semibold uppercase tracking-widest text-primary">Name</div>
              <div className="flex-1 text-xs font-semibold uppercase tracking-widest text-primary">Email</div>
              <div className="w-[100px] text-center text-xs font-semibold uppercase tracking-widest text-primary">Type
              </div>
              <div className="w-[100px] text-center text-xs font-semibold uppercase tracking-widest text-primary">ID
              </div>
              <div
                className="w-[60px] text-center text-xs font-semibold uppercase tracking-widest text-primary">Role
              </div>
            </div>

            {filteredUsers.map((user, idx) => {
              const isSelected = selectedEmail === user.email;
              return (
                <div
                  key={user.email}
                  onClick={() => setSelectedEmail(isSelected ? null : user.email)}
                  className={`flex items-center px-4 py-2 cursor-pointer border-b border-primary/5 transition-all duration-150 ${
                    isSelected
                      ? "bg-tdi-blue/10"
                      : idx % 2 === 0 ? "hover:bg-tdi-blue/5" : "bg-primary/[0.02] hover:bg-tdi-blue/5"
                  }`}
                >
                  {/* Active indicator + name */}
                  <div className="w-[180px] flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 flex-shrink-0 ${user.isActive ? "bg-tdi-blue" : "bg-primary/20"}`}/>
                    <span className={`text-xs font-semibold uppercase tracking-tight truncate ${
                      user.isActive ? "text-primary" : "text-primary/30"
                    }`}>
                      {user.lastName}, {user.firstName}
                    </span>
                  </div>

                  <div className="flex-1 text-xs text-primary/40 tracking-tight truncate">{user.email}</div>

                  <div className="w-[100px] text-center">
                    <span className={`text-xs font-semibold uppercase tracking-tight text-primary`}>
                      {user.workType}
                    </span>
                  </div>

                  <div className="w-[100px] text-center">
                    <span className={`text-xs font-semibold uppercase tracking-tight text-primary`}>
                      {user.id ?? "—"}
                    </span>
                  </div>

                  <div className="w-[60px] text-center">
                    <span className={`text-xs font-semibold uppercase tracking-tight ${
                      user.isAdmin ? "text-tdi-blue" : "text-primary/20"
                    }`}>
                      {user.isAdmin ? "ADM" : "USR"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Action panels ──────────────────────────── */}
      <div className="flex flex-col gap-4 w-[320px] flex-shrink-0">
        <EditPanel selectedUser={selectedUser} updateUser={updateUser}/>

        <InvitePanel/>

        <Button onClick={() => window.location.href = '/api/admin/getUsersCsv?active=0'}
                className="justify-center gap-2 w-full">
          <div className={'flex items-center justify-center gap-5 w-full'}>
            <Download size={30}/>
            Export User eCSV
          </div>
        </Button>
      </div>
    </main>
  );
}