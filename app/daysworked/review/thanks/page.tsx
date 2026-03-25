"use client";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {fetchBoth} from "@/utils/fetchboth";
import {Button} from "@/components/button";

const Thanks = () => {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetchBoth("/api/account/myAccountInfo?fields=firstName,lastName");
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const data = await res.json();
      const {firstName, lastName} = data.resp;
      setName(`${firstName} ${lastName}`);
    }

    load();
  }, [router]);

  return (
    <main className="flex justify-center px-5 min-h-screen">
      <div className="w-full max-w-[360px] py-8 flex flex-col gap-6">

        {/* Message card — text flat on blue */}
        <div className="bg-tdi-blue shadow px-5 py-5 flex flex-col gap-4 text-center">
          <p className="text-secondary text-sm font-semibold uppercase tracking-tight">
            {name ? `Thank you, ${name}` : "Thank you"}, Your report has been submitted.
          </p>
          <div className="h-[2px] w-full bg-secondary/20"/>
          <p className="text-secondary text-xs leading-relaxed">
            A copy will arrive in your inbox within a few minutes. You are only required to submit once per pay period,
            but you may resubmit at any time if you need to correct an error.
          </p>
          <p className="text-secondary text-xs leading-relaxed">
            Questions or issues — parkerseeley@tdi-bi.com
          </p>
        </div>

        {/* Home button */}
        <Button onClick={() => router.push("../../../")} className="w-full justify-center">
          HOME
        </Button>

      </div>
    </main>
  );
};

export default Thanks;