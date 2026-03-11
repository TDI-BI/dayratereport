import {LoadOverlay} from "@/components/loadingOverlay";
import {UserPlus} from "lucide-react";
import {Button} from "@/components/button";
import React, {useState} from "react";

const InvitePanel = () => {
  const [inviteUpid, setInviteUpid] = useState('');
  const [inviteFirst, setInviteFirst] = useState('');
  const [inviteLast, setInviteLast] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCrew, setInviteCrew] = useState<"Domestic" | "Foreign">('Domestic');
  const [inviteType, setInviteType] = useState<"Tech" | "Marine" | "">("");
  const [inviteOverlayMessage, setInviteOverlayMessage] = useState<string | null>(null);

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
          upid: inviteUpid,
          firstName: inviteFirst,
          lastName: inviteLast,
          email: inviteEmail,
          type: inviteType,
          crew: inviteCrew
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


  return (<>
      {/* Invite panel */}
      <LoadOverlay message={inviteOverlayMessage}>
        <div className="bg-tdi-blue shadow flex flex-col">
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center gap-2">
            <UserPlus size={14} className="text-secondary/50"/>
            <span className="text-secondary font-semibold uppercase tracking-tight text-sm">Invite New User</span>
          </div>

          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="bg-secondary shadow px-4 py-3 flex flex-col gap-2">
              {/*crew picker*/}
              <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-primary/40 uppercase tracking-widest font-semibold whitespace-nowrap">
                    Crew
                  </span>
                {(["Domestic", "Foreign"] as const).map((t) => (
                  <span
                    key={t}
                    onClick={() => setInviteCrew(t)}
                    className={`flex flex-grow items-center justify-center text-xs text-primary tracking-widest font-semibold whitespace-nowrap cursor-pointer pb-0.5 border-b-2 transition-colors ${
                      inviteCrew === t ? "border-primary" : "border-transparent hover:border-primary"
                    }`}
                  >
                      {t}
                    </span>
                ))}
              </div>

              <div className="h-[1px] bg-primary/10 mt-2"/>
              {[
                {
                  label: `${inviteCrew === 'Domestic' ? 'Paycor' : 'TDI'} ID`,
                  value: inviteUpid,
                  set: setInviteUpid,
                  placeholder: "U016"
                },
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
                  <div className="h-[1px] bg-primary/10 mt-2"/>
                </div>
              ))}
              {/*type picker*/}
              <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-primary/40 uppercase tracking-widest font-semibold whitespace-nowrap">
                    Type
                  </span>
                {(["Tech", "Marine"] as const).map((t) => (
                  <span
                    key={t}
                    onClick={() => setInviteType(t)}
                    className={`flex flex-grow items-center justify-center text-xs text-primary tracking-widest font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
                      inviteType === t ? "border-primary" : "border-transparent hover:border-primary"
                    }`}
                  >
                      {t}
                    </span>
                ))}
              </div>
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
    </>
  )

}
export default InvitePanel;