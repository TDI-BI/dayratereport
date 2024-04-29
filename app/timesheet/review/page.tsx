"use client"; // needed for interactivity
import Link from "next/link";
import Report from "@/components/report"

export default function Page() {
    

    return (
        <main className="flex min-h-screen flex-col items-center">
            <Report/>
            <div className='tblFoot'>
                <Link href='../'><div className='tblFootBtn'> confirm and submit </div></Link>
                <Link href='../'><div className='tblFootBtn'> back </div></Link>
            </div>
        </main>
    )
}