'use client';

import {useState, useEffect} from 'react';
import {Search, User, Shield, Globe, Home, Calendar, UserPlus} from 'lucide-react';
import {fetchBoth} from "@/utils/fetchboth";
import {Button} from "@/components/button";

interface UserRow {
  upid: string;
  firstName: string;
  lastName: string;
  email: string;
  isDomestic: boolean;
  lastConfirm: string | null;
  isAdmin: boolean;
  isActive: boolean;
}

const timeAgo = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const HDivider = () => <div className="h-[2px] w-full bg-secondary/20 my-1"/>;

// Reusable action tile for the detail panel
const ActionTile = ({
                      label,
                      active,
                      activeColor,
                      icon,
                      loading,
                      onClick,
                    }: {
  label: string;
  active: boolean;
  activeColor: string;
  icon: React.ReactNode;
  loading: boolean;
  onClick: () => void;
}) => (
  <div
    className={`flex-1 px-3 py-2 cursor-pointer transition-all duration-300 ease-in-out border border-secondary/20 hover:bg-secondary/10 ${
      loading ? "pointer-events-none opacity-50" : ""
    }`}
    onClick={onClick}
  >
    <div className="text-secondary/50 text-xs uppercase tracking-widest font-semibold mb-1">{label}</div>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 flex-shrink-0 ${activeColor}`}/>
      <span className="text-secondary text-xs font-semibold uppercase tracking-tight">
                {loading ? "..." : active ? "Yes" : "No"}
            </span>
    </div>
  </div>
);

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedUpid, setSelectedUpid] = useState<string | null>(null);
  const [activeSpinner, setActiveSpinner] = useState(false);
  const [typeSpinner, setTypeSpinner] = useState(false);
  const [adminSpinner, setAdminSpinner] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // Invite form state
  const [inviteUpid, setInviteUpid] = useState('');
  const [inviteFirst, setInviteFirst] = useState('');
  const [inviteLast, setInviteLast] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetchBoth('/api/admin/getUsers');
      const data = await res.json();
      if (data.resp) setUsers(data.resp);
    }

    load();
  }, []);

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(filter.toLowerCase())
  );

  const selectedUser = users.find((u) => u.upid === selectedUpid) ?? null;

  const updateUser = (upid: string, patch: Partial<UserRow>) => {
    setUsers((prev) => prev.map((u) => u.upid === upid ? {...u, ...patch} : u));
  };

  return (
    <main className="min-h-screen bg-secondary flex gap-6 p-6">

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
              <div className="w-[180px] text-xs font-semibold uppercase tracking-widest text-primary/40">Name</div>
              <div className="flex-1 text-xs font-semibold uppercase tracking-widest text-primary/40">Email</div>
              <div
                className="w-[60px] text-center text-xs font-semibold uppercase tracking-widest text-primary/40">Type
              </div>
              <div
                className="w-[60px] text-center text-xs font-semibold uppercase tracking-widest text-primary/40">Role
              </div>
              <div
                className="w-[90px] text-center text-xs font-semibold uppercase tracking-widest text-primary/40">Last
              </div>
            </div>

            {filteredUsers.map((user, idx) => {
              const isSelected = selectedUpid === user.upid;
              return (
                <div
                  key={user.upid}
                  onClick={() => setSelectedUpid(isSelected ? null : user.upid)}
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

                  <div className="w-[60px] text-center">
                                        <span className={`text-xs font-semibold uppercase tracking-tight ${
                                          user.isDomestic ? "text-tdi-blue" : "text-primary/40"
                                        }`}>
                                            {user.isDomestic ? "DOM" : "FOR"}
                                        </span>
                  </div>

                  <div className="w-[60px] text-center">
                                        <span className={`text-xs font-semibold uppercase tracking-tight ${
                                          user.isAdmin ? "text-tdi-blue" : "text-primary/20"
                                        }`}>
                                            {user.isAdmin ? "ADM" : "USR"}
                                        </span>
                  </div>

                  <div className="w-[90px] text-center text-xs text-primary/35 tracking-tight">
                    {user.lastConfirm ? timeAgo(user.lastConfirm) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Action panels ──────────────────────────── */}
      <div className="flex flex-col gap-4 w-[320px] flex-shrink-0">

        {/* Detail panel */}
        <div className="bg-tdi-blue shadow flex flex-col">
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-2">
            <User size={14} className="text-secondary/50"/>
            <span className="text-secondary font-semibold uppercase tracking-tight text-sm">
                            {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "Select a user"}
                        </span>
          </div>

          {selectedUser ? (
            <div className="flex flex-col gap-3 px-4 py-4">
              {/* Info rows */}
              <div className="bg-secondary shadow px-4 py-3 flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs text-primary/40 uppercase tracking-widest font-semibold">UPID</span>
                  <span className="text-xs font-semibold text-primary tracking-tight">{selectedUser.upid}</span>
                </div>
                <div className="h-[1px] bg-primary/10"/>
                <div className="flex justify-between">
                  <span className="text-xs text-primary/40 uppercase tracking-widest font-semibold">Email</span>
                  <span
                    className="text-xs font-semibold text-primary tracking-tight truncate max-w-[180px]">{selectedUser.email}</span>
                </div>
                <div className="h-[1px] bg-primary/10"/>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-primary/40 uppercase tracking-widest font-semibold">Last Confirm</span>
                  <span className="text-xs font-semibold text-primary tracking-tight">
                                        {selectedUser.lastConfirm
                                          ? `${selectedUser.lastConfirm.slice(5)} · ${timeAgo(selectedUser.lastConfirm)}`
                                          : "Never"}
                                    </span>
                </div>
              </div>

              {/* Action tiles */}
              <div className="flex gap-2">
                <ActionTile
                  label="Active"
                  active={selectedUser.isActive}
                  activeColor={selectedUser.isActive ? "bg-tdi-blue" : "bg-secondary/30"}
                  icon={<User size={12}/>}
                  loading={activeSpinner}
                  onClick={async () => {
                    setActiveSpinner(true);
                    const res = await fetchBoth(`/api/admin/toggleActive?upid=${selectedUser.upid}&active=${selectedUser.isActive}`);
                    if (res.status === 200) updateUser(selectedUser.upid, {isActive: !selectedUser.isActive});
                    setActiveSpinner(false);
                  }}
                />
                <ActionTile
                  label="Domestic"
                  active={selectedUser.isDomestic}
                  activeColor={selectedUser.isDomestic ? "bg-tdi-blue" : "bg-secondary/30"}
                  icon={selectedUser.isDomestic ? <Home size={12}/> : <Globe size={12}/>}
                  loading={typeSpinner}
                  onClick={async () => {
                    setTypeSpinner(true);
                    const res = await fetchBoth(`/api/admin/toggleDomestic?upid=${selectedUser.upid}&domestic=${selectedUser.isDomestic}`);
                    if (res.status === 200) updateUser(selectedUser.upid, {isDomestic: !selectedUser.isDomestic});
                    setTypeSpinner(false);
                  }}
                />
                <ActionTile
                  label="Admin"
                  active={selectedUser.isAdmin}
                  activeColor={selectedUser.isAdmin ? "bg-tdi-blue" : "bg-secondary/30"}
                  icon={selectedUser.isAdmin ? <Shield size={12}/> : <User size={12}/>}
                  loading={adminSpinner}
                  onClick={async () => {
                    setAdminSpinner(true);
                    const res = await fetchBoth(`/api/admin/toggleAdmin?upid=${selectedUser.upid}&admin=${selectedUser.isAdmin}`);
                    if (res.status === 200) updateUser(selectedUser.upid, {isAdmin: !selectedUser.isAdmin});
                    setAdminSpinner(false);
                  }}
                />
              </div>

              {/* Password reset */}
              <Button
                onClick={async () => {
                  setPwLoading(true);
                  await fetchBoth(`/api/recover?email=${selectedUser.email}`);
                  setPwLoading(false);
                }}
                className="w-full justify-center"
                noshadow={true}
              >
                {pwLoading ? "..." : "Send Password Reset"}
              </Button>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-secondary/30 text-xs uppercase tracking-widest font-semibold">
              no user selected
            </div>
          )}
        </div>

        {/* Invite panel */}
        <div className="bg-tdi-blue shadow flex flex-col">
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-2">
            <UserPlus size={14} className="text-secondary/50"/>
            <span className="text-secondary font-semibold uppercase tracking-tight text-sm">Invite User</span>
          </div>

          <div className="flex flex-col gap-3 px-4 py-4">
            {[
              {label: "UPID", value: inviteUpid, set: setInviteUpid, placeholder: "U016"},
              {label: "First Name", value: inviteFirst, set: setInviteFirst, placeholder: "Jane"},
              {label: "Last Name", value: inviteLast, set: setInviteLast, placeholder: "Doe"},
              {label: "Email", value: inviteEmail, set: setInviteEmail, placeholder: "jane@tdi-bi.com"},
            ].map(({label, value, set, placeholder}) => (
              <div key={label}>
                <div className="text-secondary/50 text-xs uppercase tracking-widest font-semibold mb-1">{label}</div>
                <div>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="peer bg-transparent text-secondary text-xs font-semibold uppercase tracking-tight placeholder:text-secondary/20 outline-none w-full"
                  />
                  <div
                    className="h-[2px] w-full bg-secondary/20 mt-1 peer-focus:bg-secondary transition-colors duration-300 ease-in-out"/>
                </div>
              </div>
            ))}

            <Button
              onClick={() => {
                // invite logic to be implemented
                console.log({inviteUpid, inviteFirst, inviteLast, inviteEmail});
              }}
              className="w-full justify-center mt-1"
              noshadow={true}
            >
              Send Invite
            </Button>
          </div>
        </div>

      </div>
    </main>
  );
}