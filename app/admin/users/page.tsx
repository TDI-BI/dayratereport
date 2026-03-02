'use client';

import {useState, useEffect} from 'react';
import {Mail, Search, UserPlus} from 'lucide-react';
import {Button} from "@/components/button";
import {LoadOverlay} from "@/components/loadingOverlay";

interface UserRow {
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isActive: boolean;
  workType: string;
  username: string;
  domesticId: string | null;
}

/* // maybe re-implement this later..,
const timeAgo = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
*/
export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const [editState, setEditState] = useState<Partial<UserRow>>({});


// Invite form state
  const [inviteUpid, setInviteUpid] = useState('');
  const [inviteFirst, setInviteFirst] = useState('');
  const [inviteLast, setInviteLast] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [editOverlayMessage, setEditOverlayMessage] = useState<string | null>(null);
  const [inviteOverlayMessage, setInviteOverlayMessage] = useState<string | null>(null);


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

  useEffect(() => {
    if (selectedUser) setEditState({...selectedUser});
  }, [selectedUser]);

  const updateUser = (email: string, patch: Partial<UserRow>) => {
    setUsers((prev) => prev.map((u) => u.email === email ? {...u, ...patch} : u));
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setEditOverlayMessage("Saving...");
    try {
      const res = await fetch(`/api/admin/updateUserInfo`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email: selectedUser.email,
          firstName: editState.firstName,
          lastName: editState.lastName,
          username: editState.username ?? "",
          domesticId: editState.domesticId ?? null,
          isActive: editState.isActive,
          isAdmin: editState.isAdmin,
        }),
      });

      if (res.ok) {
        updateUser(selectedUser.email, editState);
        setEditOverlayMessage("Saved!");
      } else {
        const data = await res.json();
        setEditOverlayMessage(data.error ?? "Something went wrong.");
      }
    } catch (e) {
      setEditOverlayMessage("Network error.");
    } finally {
      console.log('hi')
      await new Promise(r => setTimeout(r, 1000));
      setEditOverlayMessage(null);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteFirst || !inviteLast || !inviteEmail) {
      setInviteOverlayMessage("Please fill in all required fields.");
      await new Promise(r => setTimeout(r, 1000));
      setInviteOverlayMessage(null);
      return;
    }

    setInviteOverlayMessage("Sending invite...");
    try {
      const res = await fetch('/api/admin/inviteUser', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          upid: inviteUpid || null,
          firstName: inviteFirst,
          lastName: inviteLast,
          email: inviteEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setInviteOverlayMessage("Invite sent!");
      setInviteUpid('');
      setInviteFirst('');
      setInviteLast('');
      setInviteEmail('');

    } catch (error) {
      setInviteOverlayMessage((error as Error).message ?? "Something went wrong.");
    } finally {
      await new Promise(r => setTimeout(r, 1000));
      setInviteOverlayMessage(null);
    }
  };
  const handlePasswordReset = async () => {
    setEditOverlayMessage("Sending reset email...");
    try {
      const res = await fetch(`/api/account/recover?email=${selectedUser?.email}`);
      if (!res.ok) throw new Error("Failed to send reset email.");
      setEditOverlayMessage("Reset email sent!");
    } catch (error) {
      setEditOverlayMessage((error as Error).message ?? "Something went wrong.");
    } finally {
      await new Promise(r => setTimeout(r, 1000));
      setEditOverlayMessage(null);
    }
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

                  <div className="w-[60px] text-center">
                    <span className={`text-xs font-semibold uppercase tracking-tight ${
                      user.domesticId ? "text-tdi-blue" : "text-primary/40"
                    }`}>
                      {user.domesticId ? "DOM" : "INT"}
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
        <LoadOverlay message={editOverlayMessage}>
          {/* Detail panel */}
          <div className="bg-tdi-blue shadow flex flex-col">
            <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-2">
              <Mail size={14} className="text-secondary/50"/>
              <span className="text-secondary font-semibold uppercase tracking-tight text-sm">
              {selectedUser ? `${selectedUser.email}` : "Select a user"}
            </span>
            </div>

            {selectedUser ? (

              <div className="flex flex-col gap-3 px-4 py-4">
                {/* Editable fields */}
                <div className="bg-secondary shadow px-4 py-3 flex flex-col gap-2">
                  {/* Work Type (read only) */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-primary/40 uppercase tracking-widest font-semibold">Work Type</span>
                    <span
                      className="text-xs font-semibold text-primary/50 tracking-tight">{selectedUser.workType ?? "—"}</span>
                  </div>
                  <div className="h-[1px] bg-primary/10 mt-2"/>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-primary/40 uppercase tracking-widest font-semibold">username</span>
                    <span
                      className="text-xs font-semibold text-primary/50 tracking-tight">{selectedUser.username ?? "—"}</span>
                  </div>
                  <div className="h-[1px] bg-primary/10 mt-2"/>
                  {[
                    {label: "First Name", field: "firstName"},
                    {label: "Last Name", field: "lastName"},
                  ].map(({label, field}) => (
                    <div key={field}>
                      <div className="flex justify-between items-center gap-4">
                      <span
                        className="text-xs text-primary/40 uppercase tracking-widest font-semibold whitespace-nowrap">{label}</span>
                        <input
                          className="text-xs font-semibold text-primary tracking-tight bg-transparent border-b border-primary/10 focus:border-primary/40 outline-none text-right w-full max-w-[200px] py-0.5 transition-colors"
                          value={(editState as any)[field] ?? ""}
                          onChange={(e) => setEditState((prev: any) => ({...prev, [field]: e.target.value}))}
                        />
                      </div>
                      <div className="h-[1px] bg-primary/10 mt-2"/>
                    </div>
                  ))}

                  {/* Paycor ID */}
                  <div>
                    <div className="flex justify-between items-center gap-4">
                      <span
                        className="text-xs text-primary/40 uppercase tracking-widest font-semibold whitespace-nowrap">Paycor ID</span>
                      <input
                        className="text-xs font-semibold text-primary tracking-tight bg-transparent border-b border-primary/10 focus:border-primary/40 outline-none text-right w-full max-w-[200px] py-0.5 transition-colors"
                        placeholder="—"
                        value={editState.domesticId ?? ""}
                        onChange={(e) => setEditState((prev: any) => ({...prev, domesticId: e.target.value || null}))}
                      />
                    </div>
                  </div>


                </div>

                {/* Toggles */}
                <div className="flex gap-2">
                  {[
                    {label: "Active", field: "isActive"},
                    {label: "Admin", field: "isAdmin"},
                  ].map(({label, field}) => {
                    const val = (editState as any)[field] as boolean;
                    return (
                      <button
                        key={field}
                        onClick={() => setEditState((prev: any) => ({...prev, [field]: !val}))}
                        className={`flex-1 px-3 py-2 transition-all duration-300 ease-in-out text-xs font-semibold uppercase tracking-widest bg-secondary shadow hover:bg-secondary/90`}
                      >
                        {label}: {val ? "Yes" : "No"}
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={handlePasswordReset} className="flex-1 justify-center" noshadow={true}>
                    Recover
                  </Button>
                  <Button onClick={handleUpdateUser} className="flex-1 justify-center" noshadow={true}>
                    Update
                  </Button>
                </div>

              </div>

            ) : (
              <div className="px-4 py-8 text-center text-secondary/30 text-xs uppercase tracking-widest font-semibold">
                no user selected
              </div>
            )}
          </div>
        </LoadOverlay>


        {/* Invite panel */}
        <LoadOverlay message={inviteOverlayMessage}>
          <div className="bg-tdi-blue shadow flex flex-col">
            <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-2">
              <UserPlus size={14} className="text-secondary/50"/>
              <span className="text-secondary font-semibold uppercase tracking-tight text-sm">Invite New User</span>
            </div>

            <div className="flex flex-col gap-3 px-4 py-4">
              <div className="bg-secondary shadow px-4 py-3 flex flex-col gap-2">
                {[
                  {label: "Paycor ID", value: inviteUpid, set: setInviteUpid, placeholder: "U016"},
                  {label: "First Name", value: inviteFirst, set: setInviteFirst, placeholder: "Jane"},
                  {label: "Last Name", value: inviteLast, set: setInviteLast, placeholder: "Doe"},
                  {label: "Email", value: inviteEmail, set: setInviteEmail, placeholder: "jane@tdi-bi.com"},

                ].map(({label, value, set, placeholder}, i, arr) => (
                  <div key={label}>
                    <div className="flex justify-between items-center gap-4">
                    <span
                      className="text-xs text-primary/40 uppercase tracking-widest font-semibold whitespace-nowrap">{label}</span>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="text-xs font-semibold text-primary tracking-tight bg-transparent border-b border-primary/10 focus:border-primary/40 outline-none text-right w-full max-w-[200px] py-0.5 transition-colors placeholder:text-primary/20"
                      />
                    </div>
                    {i < arr.length - 1 && <div className="h-[1px] bg-primary/10 mt-2"/>}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleInviteUser}
                className="w-full justify-center mt-1"
                noshadow={true}
              >
                Send Invite
              </Button>
            </div>
          </div>
        </LoadOverlay>
      </div>
    </main>
  );
}