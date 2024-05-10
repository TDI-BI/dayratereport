"use client"; // needed for interactivity
import Link from "next/link";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // this is so gas actually
import { useEffect, useState } from "react";
import { getPeriod } from '@/utils/payperiod';
import { useRouter } from 'next/navigation'
import { getPort } from '@/utils/getPort';
let por=getPort();

//lets me do client redirects


//THERE IS SOME KEY ISSUE IN THIS FUNCTION. IT DOES NOT SEEM TO INHIBIT FUNCTIONALITY BUT ITS STILL ANNOYING I GUESS

export default function Page() {
    const router = useRouter()
    let period = getPeriod();
    const [dataResponse, setdataResponse] = useState([]);
    useEffect(() => {
      async function getPeriodInf(){
        const apiUrlEndpoint = 'http://'+por+'/api/getperiodinf';
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
        name=item['uid'];
        if(item['ship']) daysworked+=1;
        dict[item['day']]=item['ship']
    }) ;
    let names:string[]=name.split('/')

    function submit(){ // im sure this function is due for a re-write at some point

        if(!(document.getElementById('affirm') as HTMLInputElement).checked){

            (document.getElementById('target') as HTMLElement).style.transition = '100ms';
            (document.getElementById('target') as HTMLElement).style.background = 'rgb(255, 255, 255, 1)';
            setTimeout(() => {
                (document.getElementById('target') as HTMLElement).style.transition = '1s';
                (document.getElementById('target') as HTMLElement).style.background = 'rgb(255, 255, 255, 0)';
                //console.log('change colors')
            }, 100)
            return
        }

        const doc = new jsPDF();
        let data:string[][] = []
        let dinf=''
        let w = ''

        console.log(dict);

        let strdict=''

        period.map((day) => {   
            strdict+=day+':'+dict[day]+';';
            dict[day] ? dinf = dict[day] : dinf = '';
            dict[day] ? w = '[C]' : w ='[  ]'
            data.push([day, w, dinf])
        })
        console.log(strdict)

        //make pdf
        autoTable(doc, { 
            head: [["date","worked?","ship"]], 
            body: data,
        })
        doc.text('days worked: '+daysworked, 100, 100, {align: 'center'})
        doc.setFontSize(12)
        //doc.addFont('ComicSansMS', 'Comic Sans', 'normal');
        doc.text(
            'I, '+ names[0] + ' ' + names[1] +', acknowledge and certify that the information \non this document is true and accurate', 
            100,    
            170, 
            {align: 'center'}
        )

        //download
        //uncomment this later
        doc.save("report_for_" + name + "_" + period[0] +".pdf");

        //send
        const apiUrlEndpoint = 'http://'+por+'/api/sendperiodinf?day='+period[0]+'&pdf='+strdict;
        console.log(apiUrlEndpoint)
        const response = fetch(apiUrlEndpoint);
        router.push('review/thanks')
    }

    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className='report'>
                <p><strong>COMFIRM REPORT</strong></p>
                <p> PERIOD REPORT FOR: {names[0] + ' ' + names[1]}</p>
                 <div className='table'>{
                        period.map((day) => 
                        <div key={day+'rdiv'}>
                            <div className="reportLine" key={day}> 
                              <p className='reportTxt' key={day+'date'}>{day}</p> : 
                              <p className='reportTxt'key={day+'ship'}>{dict[day] ? dict[day] : ''}</p>
                            </div>
                        </div>) // for now we are jtus gonna try to pull 1 line    
                    }</div>
                <p> TOTAL DAYS: {daysworked}</p>
            </div>
            <div className='affirmation' id='target'>
                <div className='affirmRow'>
                    <input type='checkbox' id='affirm'/>
                    <p>: I AFFIRM THAT ALL THE INFORMATION </p>
                </div>
                <p>IN THE ABOVE REPORT IS TRUE AND REAL</p>
            </div>
            <div className='tblFoot'>
                <button onClick={submit}><div className='tblFootBtn'> confirm and submit </div></button>
                <Link href='../'><div className='tblFootBtn'> back </div></Link>
            </div>
        </main>
    )
}