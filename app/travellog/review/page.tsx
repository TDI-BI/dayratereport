"use client"; // needed for interactivity
import Link from "next/link";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // this is so gas actually
import { useEffect, useState } from "react";
import { getPeriod } from '@/utils/payperiod';

//THERE IS SOME KEY ISSUE IN THIS FUNCTION. IT DOES NOT SEEM TO INHIBIT FUNCTIONALITY BUT ITS STILL ANNOYING I GUESS

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
        //doc.text('travel log for: '+name, 100, 10, {align: 'center'})
        let dinf=''
        let w = ''
        period.map((day) => {   
            dict[day] ? dinf = dict[day] : dinf = '';
            dict[day] ? w = '[C]' : w ='[  ]'
            data.push([day, w, dinf])
        })

        autoTable(doc, { 
            head: [["date","worked?","ship"]], 
            body: data,
        })
        doc.text('days worked: '+daysworked, 100, 100, {align: 'center'})
        doc.setFontSize(12)
        doc.text(
            'I, '+name+' acknowledge and certify that the information \non this document is true and accurate', 
            100,    
            170, 
            {align: 'center'}
        )
        let pdf = doc.output().split('\n'); // gives us an array by line
        let pdfStr='';
        pdf.forEach((line) => { // convert from array to string
            pdfStr+=line + 'nline' // this is our linebreak character
        })
        //console.log(pdfStr);
        
        doc.save("report_for_" + name + "_" + period[0] +".pdf");

        console.log('new processing 3')
        //commented this out for rn just to not flood my own inbox
        const apiUrlEndpoint = 'http://localhost:3000/api/sendperiodinf?day='+period[0]+'&pdf='+pdfStr;
        const response = fetch(apiUrlEndpoint); // not oging to await bc htis is the end ig, also dont care abt response rn
        //need to add some session flag that doesnt let you spam the email hitting send over and over
        
    }
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