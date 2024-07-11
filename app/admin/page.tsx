'use client'
import { useState, useEffect } from "react";
import { getPort } from "@/utils/getPort";
import { fetchBoth } from "@/utils/fetchBoth";
import { redirect } from "next/navigation";
import { getPeriod } from "@/utils/payperiod";
import { 
    RadioGroup, 
    Radio, 
} from "@nextui-org/react";
import {
    mkConfig, generateCsv, download 
} from 'export-to-csv'

const port = getPort();



const AdminPannel = () =>{
    const [shipEh, setShipEh] = useState('BMCC'); // 0 for curr -/+ for rest (we invert)
    const [periodEh, setPeriodEh] = useState(0); // 0 for curr -/+ for rest (we invert)
    const period = getPeriod(periodEh);
    //gets stuffge

    let bweh:{[key:string]: string}={}
    const [fdict, setfdict]= useState(bweh); // domestic v foreign
    const [nun, setnun] = useState(bweh)
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
            let gdict:{[id: string] : string} = {};

            let masterJson:{[ship: string] : {[user:string]: {[day:string]: string}}}={};
            try{
                (res.resp).forEach((day:any)=>{
                    if(day['day']=='-1'){ 
                        tdict[day['username']]=(day['ship']=="1")?'domestic' : 'foreign';
                        return
                    } 
                    if(!gdict[day['uid']])gdict[day['uid']]=day['username']
                    if(!masterJson[day['ship']]) masterJson[day['ship']]={}
                    if(!masterJson[day['ship']][day['uid']]) masterJson[day['ship']][day['uid']]={}
                    masterJson[day['ship']][day['uid']][day['day']]=day['type']

                })
            }
            catch(e)
            {
            }
            setnun(gdict);
            setfdict(tdict);
            setDays(stuff);
            setdataResponse(res);
            setjson(masterJson)

        }
        getEveryting();
    },[])
    if(dataResponse['error' as any]){ 
        console.log('you do not have administrator access :c')
        redirect('../../')
    } // block non-admins

    //generate our table
    const tblData:any[] = [];

    if(json[shipEh]){
        Object.keys(json[shipEh]).map((name)=>{
            let sum=0;
            period.map((e) =>{
                if(json[shipEh][name][e]) sum++;
            })
            let row={
                cre:   fdict[nun[name]],
                fna:    name.split('/')[0],
                lna:    name.split('/')[1],
                mon:    json[shipEh][name][period[0]] ? json[shipEh][name][period[0]] : '',
                tue:    json[shipEh][name][period[1]] ? json[shipEh][name][period[1]] : '',
                wed:    json[shipEh][name][period[2]] ? json[shipEh][name][period[2]] : '',
                thu:    json[shipEh][name][period[3]] ? json[shipEh][name][period[3]] : '',
                fri:    json[shipEh][name][period[4]] ? json[shipEh][name][period[4]] : '',
                sat:    json[shipEh][name][period[5]] ? json[shipEh][name][period[5]] : '',
                sun:    json[shipEh][name][period[6]] ? json[shipEh][name][period[6]] : '',
                sum:    sum.toString()
            }
            if(sum!=0) tblData.push(row);
        })
    }

    const exportCsv = () =>{
        const expTableData =    [{
            cre:   'CREW',
            fna:    "first name",
            lna:    "last name",
            mon:    period[0],
            tue:    period[1],
            wed:    period[2],
            thu:    period[3],
            fri:    period[4],
            sat:    period[5],
            sun:    period[6],
            sum:    ''
        }].concat(tblData)
        // mkConfig merges your options with the defaults
        // and returns WithDefaults<ConfigOptions>
        const csvConfig = mkConfig({ 
            useKeysAsHeaders: true, 
            filename:shipEh+'_'+period[0]+'_TO_'+period[6]
        });
        // Converts your Array<Object> to a CsvOutput string based on the configs
        const csv = generateCsv(csvConfig)(expTableData);
        download(csvConfig)(csv)
    }


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
            <div className='adminWrap'>
                <div className='adminFilterWrap'>
                    <RadioGroup
                        label='filter: '
                        value={shipEh}
                        onValueChange={(v)=>setShipEh(v)}
                    >
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
                </div>
                <div className='adminTable'>
                    <div className='adminRowLabel' key='headrow'>
                        <div className='adminLabelX' key='headnamelbl'><strong>NAME</strong></div>
                        <div className='adminLabelY' key='headnamelbl'>CREW</div>
                        {period.map((day)=> //header
                            <div className='adminLabelY' key={day+'label'}>
                                <p>{day}</p>
                            </div>
                        )}
                    </div>
                    {json[shipEh] && tblData.map((el)=>
                        <div className='adminRow' key={el.fna+el.lna}>
                            <div className='adminLabelX' key={el.fna+el.lna+'name'}>{el.fna + ' ' + el.lna}</div>
                            <div className='adminCell' key={el.fna+el.lna+'dom'}>{el.cre}</div>
                            <div className='adminCell' key={el.fna+el.lna+'mon'}>{el.mon}</div>
                            <div className='adminCell' key={el.fna+el.lna+'tue'}>{el.tue}</div>
                            <div className='adminCell' key={el.fna+el.lna+'wed'}>{el.wed}</div>
                            <div className='adminCell' key={el.fna+el.lna+'thu'}>{el.thu}</div>
                            <div className='adminCell' key={el.fna+el.lna+'fri'}>{el.fri}</div>
                            <div className='adminCell' key={el.fna+el.lna+'sat'}>{el.sat}</div>
                            <div className='adminCell' key={el.fna+el.lna+'sun'}>{el.sun}</div>
                        </div>
                    )}
                </div>
            </div>
            <button className='tblFootBtn' onClick={exportCsv}>export</button> 
        </main>
    )
    
}
export default AdminPannel;