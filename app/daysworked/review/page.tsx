"use client"; // needed for interactivity
import Link from "next/link";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // this is so gas actually
import { useEffect, useState } from "react";
import { getPeriod } from '@/utils/payperiod';
import { redirect, useRouter } from 'next/navigation'
import { getPort } from '@/utils/getPort';
import { fetchBoth } from "@/utils/fetchBoth";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@nextui-org/react"
import {flashDiv} from '@/utils/flashDiv'
import { useSearchParams } from "next/navigation";


//page globals
const por=getPort();


export default function Page() {
    const sprms = useSearchParams();
    const prev= sprms.get('prev')=='1';
    const period = prev? getPeriod(1) : getPeriod(0)
    const ex = prev ? 'prev=1' : '';
    //needs to be called from within a function (ugh)
    const router = useRouter();
    const [saving, setsaving] = useState(0);

    const submit = async () =>{ // im sure this function is due for a re-write at some point
        //makes logic cleaner
        const affirm = document.getElementById('affirm') as HTMLInputElement
        const target = document.getElementById('target') as HTMLElement

        //flashes our confirm if its not clicked
        if(!affirm.checked){
            flashDiv(target)
            return
        }
        setsaving(1);

        let data:string[][] = [] // for pdf
        let dinf=''
        let jinf=''
        let w = ''
        let strdict='' // for query
        //build data
        period.map((day) => {   
            strdict+=day+':'+dict[day]+':'+jdict[day]+';';
            dict[day] ? dinf = dict[day] : dinf = '';
            jdict[day] ? jinf = jdict[day] : jinf = '';
            dict[day] ? w = '[X]' : w ='[  ]'
            data.push([day, w, dinf, jinf])
        })

        //send email
        const apiUrlEndpoint = por+'/api/sendperiodinf?day='+period[0]+'&pdf='+strdict+'&type='+type;
        await fetchBoth(apiUrlEndpoint);

        //generate pdf
        const doc = new jsPDF();
        doc.text('report for: '+ names[0] + ' ' + names[1], 100, 10, {align: 'center'})
        autoTable(doc, { //autotable is a package built ontop of jspdf that just makes my life way easier
            head: [["date","worked?","vessel", "job"]], 
            body: data,
        })
        doc.text('days worked: '+daysworked, 100, 100, {align: 'center'})
        doc.text('crew type: '+type, 100, 120, {align: 'center'})
        doc.setFontSize(12)
        doc.text(
            'I, '+ names[0] + ' ' + names[1] +', acknowledge and certify that the information \non this document is true and accurate', 
            100,    
            170, 
            {align: 'center'}
        )
        //download pdf
        doc.save("report_for_" + name + "_" + period[0] +".pdf");
        router.push('review/thanks')
        setsaving(0);
    }
    
    const [dataResponse, setdataResponse] = useState([]);
    useEffect(() => {
      async function getPeriodInf(){
        const apiUrlEndpoint = por+'/api/getperiodinf?'+ex;
        const response = await fetchBoth(apiUrlEndpoint);
        const res = await response.json();
        setdataResponse(res.resp);  
      }
      getPeriodInf();
    }, []);
   
    // this is all just for building our page
    let name=''
    let daysworked=0
    var dict: {[id: string] : string} = {};
    var jdict: {[id: string] : string} = {};
    let type=''
    try{
        dataResponse.forEach((item) => {
            if(item['day']==-1){
                item['ship']=='1' ? type = 'domestic' : type = 'foreign';
                return
            } 
            if(!name) name=item['uid'];
            if(item['ship']) daysworked+=1;
            dict[item['day']]=item['ship']
            jdict[item['day']]=item['type']
           
        }) ;
    }
    catch{ // dataresponse will be null in the case of our user not being logged in
        redirect('../../')
    }
    let names:string[]=name.split('/')

    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className='report'>
                <p><strong>COMFIRM REPORT</strong></p>
                <p> PERIOD REPORT FOR: {names[0] + ' ' + names[1]}</p>
                
                <Table>
                    <TableHeader>
                        <TableColumn>
                            day
                        </TableColumn>
                        <TableColumn>
                            vessel
                        </TableColumn>
                        <TableColumn>
                            job
                        </TableColumn>
                    </TableHeader>
                    <TableBody>{
                    period.map((day) => 
                        <TableRow key={day} className='reportLine'> 
                            <TableCell className='reportTxt' key={day+'date'}>{day}</TableCell> 
                            <TableCell className='reportTxt'key={day+'ship'}>{dict[day] ? dict[day] : ''}</TableCell>
                            <TableCell className='reportTxt'key={day+'job'}>{jdict[day] ? jdict[day] : ''}</TableCell>
                        </TableRow>) // for now we are jtus gonna try to pull 1 line    
                    }</TableBody>
                </Table>
                <p> crew type: {type}</p>
                <p> TOTAL DAYS: {daysworked}</p>
                {prev? <p className='prev'> this is last weeks report </p> : ''}
            </div>
            <div className='affirmation' id='target'>
                <div className='affirmRow'>
                    <p>
                        <input type='checkbox' id='affirm'/>
                        : I acknowledge and certify that the information on this document is true and accurate
                    </p>
                </div>
            </div>
            <div className='tblFoot'>
                <Link href='../'><div className='tblFootBtn'> back </div></Link>
                <button onClick={submit}><div className='tblFootBtn'> confirm and submit </div></button>
            </div>
            <p className={saving ? 'savemsg1' : 'savemsg0'}>{saving ? 'preparing pdf...' : 'saved'}</p>
        </main>
    )
}