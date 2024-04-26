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

    // really gotta think of a better way to do this tbh
    let name=''
    let daysworked=0
    var dict: {[id: string] : string} = {};
    dataResponse.forEach((item) => { // should build our dictionary mybe
        name=item.uid;
        if(item.ship) daysworked+=1;
        dict[item.day]=item.ship
    }) 

    return (
        <main className="flex min-h-screen flex-c   ol items-center">
            <p><strong>COMFIRM REPORT</strong></p>
            {/* LETS WORK ON REPORT FORMATTING*/}
            <p> PERIOD REPORT FOR: {name}</p>
            <div>{ // throws crazy errors but its a working example of pulling from the server at least
                period.map((day) => 
                <div>
                    <div className="reportLine" key={day}> 
                        <p className='reportTxt'>{day}</p> : <p className='reportTxt'>{dict[day] ? dict[day] : ''}</p> 
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