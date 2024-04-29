"use client"; // needed for interactivity
import Link from "next/link";
import Report from "@/components/report"
import { jsPDF } from "jspdf";

export default function Page() {

    function bweh(){
        doc.save("a4.pdf");
    }

    // Default export is a4 paper, portrait, using millimeters for units
    //test
    const doc = new jsPDF();

    doc.text("Hello world!", 10, 10);
    
    

    return (
        <main className="flex min-h-screen flex-col items-center">
            <Report/>
            <div className='tblFoot'>
                <button onClick={bweh}><div className='tblFootBtn'> confirm and submit </div></button>
                <Link href='../'><div className='tblFootBtn'> back </div></Link>
            </div>
        </main>
    )
}