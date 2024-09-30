"use client"; 
import { getPort } from '@/utils/getPort'; const por=getPort();
import { useEffect, useState } from "react";
import { getPeriod } from '@/utils/payperiod';
import {flashDiv} from '@/utils/flashDiv'
import { useSearchParams } from "next/navigation";
import { fetchBoth } from "@/utils/fetchBoth";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@nextui-org/react"
import { 
    redirect, 
    useRouter 
} from 'next/navigation'
import Link from "next/link";

export default function Page() {
    //check previous or current
    const sprms = useSearchParams();
    const prev= Number(sprms.get('prev'));
    const ex = 'prev=' + prev;
    
    //needs to be called from within a function (ugh)
    const router = useRouter();

    //states
    const [pulled, setPulled] = useState(0);
    const [period, setPeriod] = useState(getPeriod(prev));
    const [saving, setsaving] = useState(0);
    const [dataResponse, setdataResponse] = useState([]);

    const submit = async () =>{ // im sure this function is due for a re-write at some point
        //makes logic cleaner
        const affirm = document.getElementById('affirm') as HTMLInputElement;
        const target = document.getElementById('target') as HTMLElement;

        //flashes our confirm if its not clicked
        if(!affirm.checked){
            flashDiv(target);
            return;
        }
        setsaving(1);

        // client pdf generation removed
        let strdict='';
        period.map((day) => strdict+=day+':'+vesselDict[day]+':'+crewDict[day]+';')

        //send email
        const apiUrlEndpoint = por+'/api/sendperiodinf?day='+period[0]+'&pdf='+strdict+'&type='+type+'&'+ex;
        await fetchBoth(apiUrlEndpoint);

        //redirect :p
        setsaving(0);
        router.push('review/thanks');
    }
    
    //database queries
    useEffect(() => {
        async function getPeriodInf(){
            const apiUrlEndpoint = por+'/api/getperiodinf?'+ex;
            const response = await fetchBoth(apiUrlEndpoint);
            const res = await response.json();
            
            const perResp = await (fetchBoth(por+'/api/verifydate?'+ex))
            const serverPeriod = (await perResp.json()).resp;

            setPeriod(serverPeriod);
            setdataResponse(res.resp);  
            setPulled(1);
        }
        getPeriodInf();

        


    }, [ex]);
   
    // type declarations
    let name:string='';
    let type:string='';
    var vesselDict: {[id: string] : string} = {};
    var crewDict: {[id: string] : string} = {};

    let daysworked=0;

    try{
        dataResponse.forEach((item) => { // build dictionaries for page
            if(item['day']==-1){
                item['ship']=='1' ? type = 'domestic' : type = 'foreign';
                return
            } 
            if(!name) name=item['uid'];
            if(item['ship']) daysworked+=1;
            vesselDict[item['day']]=item['ship']
            crewDict[item['day']]=item['type']
           
        }) ;
    }
    catch{ // dataresponse will be null in the case of our user not being logged in
        redirect('../../')
    }
    let names:string[]=name.split('/')

    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className='text-center w-[345px]'>
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
                        <TableRow key={day} className='reportLine hoverLn'> 
                            <TableCell className='reportTxt' key={day+'date'}>{day}</TableCell> 
                            <TableCell className='reportTxt'key={day+'ship'}>{vesselDict[day] ? vesselDict[day] : ''}</TableCell>
                            <TableCell className='reportTxt'key={day+'job'}>{crewDict[day] ? crewDict[day] : ''}</TableCell>
                        </TableRow>) // for now we are jtus gonna try to pull 1 line    
                    }</TableBody>
                </Table>
                <p> crew type: {type}</p>
                <p> TOTAL DAYS: {daysworked}</p>
                {prev? <p className='prev'> {"NOT THIS WEEK'S REPORT"} </p> : ''}
            </div>

            {/* from here i need to obscure this stuff until its loaded */}
            <div className={pulled ? 'report' : 'report hidden'}>
                <div className='w-[345px] pt-[10px] pb-[10px] rounded-2xl' id='target'>
                    <div className='inline-flex flex-row'>
                        <p className='w-[345px] text-center'>
                            <input type='checkbox' id='affirm'/>
                            : I acknowledge and certify that the information on this document is true and accurate
                        </p>
                    </div>
                </div>
                <div className='inline-flex flex-row'>
                    <Link href='../'><div className=' w-[174px] btnh btn hoverbg'> back </div></Link>
                    <button onClick={submit}><div className='w-[174px] btnh btn hoverbg'> confirm and submit </div></button>
                </div>
                <p className={'text-center ' + (saving ? 'savemsg1' : 'savemsg0')}>{saving ? 'preparing email...' : 'sent'}</p>
            </div>
            {/* display 'loading' otherwise */}
            <div className={pulled ? 'hidden' : ''}>
                <p className='savemsg1'>loading</p>
            </div>
            
        </main>
    )
}