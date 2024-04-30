"use client"; // needed for interactivity
import Link from "next/link";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // this is so gas actually
import { useEffect, useState } from "react";
import { getPeriod } from '@/utils/payperiod';
import {redirect} from 'next/navigation'



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

    function submit(){
         // not working for some reason/
        const doc = new jsPDF();
        let data:string[][] = []
        doc.text('travel log for: '+name, 100, 10, {align: 'center'})
        let dinf=''

        period.map((day) => {   
            dict[day] ? dinf = dict[day] : dinf = '';

            data.push([day, dinf])
        })

        autoTable(doc, { 
            head: [["date","ship"]], 
            body: data,
        })
        doc.text('days worked: '+daysworked, 100, 150, {align: 'center'})

        doc.save("report_for_" + name + "_" + period[0] +".pdf");

        const apiUrlEndpoint = 'http://localhost:3000/api/sendperiodinf?day='+period[0];
        const response = fetch(apiUrlEndpoint); // not oging to await bc htis is the end ig, also dont care abt response rn
        //need to add some session flag that doesnt let you spam the email hitting send over and over
        
    }



    // Default export is a4 paper, portrait, using millimeters for units
    //test
    
    
    

    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className='report'>
                <p><strong>COMFIRM REPORT</strong></p>
                <div className='reportForPrint'>
                <p> PERIOD REPORT FOR: {name}</p>
                <div className='div2print'>{
                        period.map((day) => 
                        <div>
                            <div className="reportLine" key={day}> 
                        <p className='reportTxt'>{day}</p> : <p className='reportTxt'>{dict[day] ? dict[day] : ''}</p> 
                            </div>
                        </div>) // for now we are jtus gonna try to pull 1 line    
                    }</div>
                    <p> TOTAL DAYS: {daysworked}</p>
                </div>
            </div>
            <div className='tblFoot'>
                <button onClick={submit}><div className='tblFootBtn'> confirm and submit </div></button>
                <Link href='../'><div className='tblFootBtn'> back </div></Link>
            </div>
        </main>
    )
}