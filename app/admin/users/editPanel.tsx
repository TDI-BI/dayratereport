import {Mail} from "lucide-react";
import {Button} from "@/components/button";
import {LoadOverlay} from "@/components/loadingOverlay";
import React, {useState, useEffect} from "react";
import {UserRow, EditPanelProps} from "./interfaces";

const EditPanel = ({selectedUser, updateUser}: EditPanelProps) => {
  // Invite form state
  const [editOverlayMessage, setEditOverlayMessage] = useState<string | null>(null);
  const [editState, setEditState] = useState<Partial<UserRow>>({});

  useEffect(() => {
    if (selectedUser) setEditState({...selectedUser});
  }, [selectedUser]);

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
          id: editState.id ?? null,
          isActive: editState.isActive,
          isAdmin: editState.isAdmin,
          isDomestic: editState.isDomestic,
          type: editState.workType
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


  return (<>
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
              {/*type picker*/}
              <div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-primary/40 uppercase tracking-widest font-semibold whitespace-nowrap">
                    Crew
                  </span>
                  {(["Domestic", "Foreign"] as const).map((t) => (
                    <span
                      key={t}
                      onClick={() => setEditState((prev: any) => ({...prev, isDomestic: t === 'Domestic'}))}
                      className={`flex flex-grow items-center justify-center text-xs text-primary tracking-widest font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
                        (t === 'Domestic' && editState.isDomestic) || (t === 'Foreign' && !editState.isDomestic)
                          ? "border-primary"
                          : "border-transparent hover:border-primary"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="h-[1px] bg-primary/10 mt-2"/>
              </div>
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

              <div>

                <div className="flex justify-between items-center gap-4">
                      <span
                        className="text-xs text-primary/40 uppercase tracking-widest font-semibold whitespace-nowrap">
                        {editState.isDomestic ? 'Paycor' : 'tdi'} ID
                      </span>
                  <input
                    className="text-xs font-semibold text-primary tracking-tight bg-transparent border-b border-primary/10 focus:border-primary/40 outline-none text-right w-full max-w-[200px] py-0.5 transition-colors"
                    value={editState.id ?? ""}
                    onChange={(e) => setEditState((prev: any) => ({...prev, id: e.target.value || null}))}
                  />
                </div>
                <div className="h-[1px] bg-primary/10 mt-2"/>
              </div>
              <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-primary/40 uppercase tracking-widest font-semibold whitespace-nowrap">
                    Type
                  </span>
                {(["Tech", "Marine"] as const).map((t) => (
                  <span
                    key={t}
                    onClick={() => setEditState((prev: any) => ({...prev, workType: t}))}
                    className={`flex flex-grow items-center justify-center text-xs text-primary tracking-widest font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
                      editState.workType === t ? "border-primary" : "border-transparent hover:border-primary"
                    }`}
                  >
                      {t}
                    </span>
                ))}

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
  </>)
}
export default EditPanel;
