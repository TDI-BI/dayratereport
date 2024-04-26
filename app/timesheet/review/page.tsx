"use client"; // needed for interactivity
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPeriod } from '../../../utils/payperiod';

export default function Page() {
    let period = getPeriod();
    const [dataResponse, setdataResponse] = useState([]);
    useEffect(() => {
      async function getPeriodInf(){
        const apiUrlEndpoint = 'http://localhost:3000/api/getperiodinf';
        const response = await fetch(apiUrlEndpoint);
        const res = await response.json();
        setdataResponse(res.resp);  
      }
      getPeriodInf();
    }, []);

    let name=''
    let daysworked=0
    dataResponse.forEach((item) =>{
        name=item.uid;
        if(item.ship) daysworked+=1;
    });

    return (
        <main className="flex min-h-screen flex-col items-center">
            <p><strong>COMFIRM REPORT</strong></p>
            {/* LETS WORK ON REPORT FORMATTING*/}
            <p> PERIOD REPORT FOR: {name}</p>
            <div>{ // throws crazy errors but its a working example of pulling from the server at least
                dataResponse.map((items) => 
                <div>
                    <div className="reportLine" key={items.day}> 
                        <p className='reportTxt'>{items.day}</p> : <p className='reportTxt'>{items.ship}</p> 
                    </div>
                </div>) // for now we are jtus gonna try to pull 1 line
                
            }</div>
            <p> TOTAL DAYS: {daysworked}</p>
            {/* END SAMPLE REPORT */}
            <div className='tblFoot'>
                <Link href='../'><div className='tblFootBtn'> confirm and submit </div></Link>
                <Link href='../'><div className='tblFootBtn'> back </div></Link>
            </div>
        </main>
    )
}