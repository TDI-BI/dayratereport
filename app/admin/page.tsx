'use client'
import { useState, useEffect } from "react";
import { getPort } from "@/utils/getPort";
import { fetchBoth } from "@/utils/fetchBoth";
import { redirect } from "next/navigation";
import { getPeriod } from "@/utils/payperiod";
import { RadioGroup, Radio } from "@nextui-org/react";

const port = getPort();



const adminPannel = () =>{
    const [shipEh, setShipEh] = useState('ALL'); // 0 for curr -/+ for rest (we invert)
    const [periodEh, setPeriodEh] = useState(0); // 0 for curr -/+ for rest (we invert)
    const period = getPeriod(periodEh);
    //gets stuffge
    const [fdict, setfdict]= useState({}); // username:string : isDomestic:bool
    const [dataResponse, setdataResponse] = useState([]);


    let jtype:{[ship: string] : {[user:string]: {[day:string]: string}}}={};
    const [json, setjson] = useState(jtype)


    const [days, setDays] = useState([]);
    useEffect(()=>{
        const getEveryting = async () =>{
            const response = await fetchBoth(port+'/api/gigaquery')
            const res = await response.json();
            let stuff:any = [];
            let tdict:{[id: string] : string} = {};

            let masterJson:{[ship: string] : {[user:string]: {[day:string]: string}}}={};



            (res.resp).forEach((day:any)=>{
                if(day['day']=='-1'){ 
                    tdict[day['username']]=(day['ship']=="1")?'domestic' : 'foreign';
                    return
                } 
                if(!masterJson[day['ship']]) masterJson[day['ship']]={}
                if(!masterJson[day['ship']][day['username']]) masterJson[day['ship']][day['username']]={}
                masterJson[day['ship']][day['username']][day['day']]=day['type']

            })
            setfdict(tdict);
            setDays(stuff);
            setdataResponse(res);
            setjson(masterJson)

        }
        getEveryting();
    },[])
    if(dataResponse['error' as any]) redirect('../../') // block non-admins
    //console.log(dataResponse)
    




    return( // just default page wrapper for now
        <main className="flex min-h-screen flex-col items-center">
            <p>
                <button className='tblFootBtn' onClick={()=>{setPeriodEh(periodEh+1)}}> {'< '} back</button>
                {period[0]} to {period[6]}
                <button className='tblFootBtn' onClick={()=>{setPeriodEh(periodEh-1)}}>forward {' >'}</button>
            </p>
            {/*days.map((day)=>day['ship'] && <p key={day['day']+day['uid']}>{ // example
                day['day'] + ' : ' + day['ship'] + ' : ' + day['type'] + ' : ' + day['uid'] + ' : ' + day['username'] + ' : ' + fdict[day['username']]
            }</p>)*/}
            <RadioGroup
                label='filter: '
                value={shipEh}
                onValueChange={(v)=>setShipEh(v)}
            >
                <Radio
                    value='ALL'
                    className={shipEh=='ALL' ? 'uadminRB' : 'sadminRB'}
                >ALL</Radio>
                <Radio
                    value='BMCC'
                    className={shipEh=='BMCC' ? 'uadminRB' : 'sadminRB'}
                >BMCC</Radio>
                <Radio
                    value='EMMA'
                    className={shipEh=='EMMA' ? 'uadminRB' : 'sadminRB'}
                >EMMA</Radio>
                <Radio
                    value='PROT'
                    className={shipEh=='PROT' ? 'uadminRB' : 'sadminRB'}
                >PROT</Radio>
                <Radio
                    value='GYRE'
                    className={shipEh=='GYRE' ? 'uadminRB' : 'sadminRB'}
                >GYRE</Radio>
                <Radio
                    value='NAUT'
                    className={shipEh=='NAUT' ? 'uadminRB' : 'sadminRB'}
                >NAUT</Radio>
                <Radio
                    value='3RD'
                    className={shipEh=='3RD' ? 'uadminRB' : 'sadminRB'}
                >3RD</Radio>
                <Radio
                    value='????'
                    className={shipEh=='????' ? 'uadminRB' : 'sadminRB'}
                >????</Radio>
            </RadioGroup>

            <div className='adminRow'>
                <div className='adminLabelX'>.</div>
                {period.map((day)=> //header
                    <div className='adminLabelY'>
                        <p>{day}</p>
                    </div>
                )}
            </div>

            {
                json[shipEh] && Object.keys(json[shipEh]).map((name)=>
                    <div className='adminRow'>
                        <div className='adminLabelX'>.</div>
                        {period.map((day)=> //body example
                            <div className='adminCell'>
                                <p>{json[shipEh][name][day] ? json[shipEh][name][day] : '.' }</p>
                        </div>
                        )}
                    </div>

                )
            }   

            
                
            
        </main>
    )
    
}
export default adminPannel;