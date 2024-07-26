'use client'
import { getPort } from "@/utils/getPort"; const port = getPort();
import { fetchBoth } from "@/utils/fetchBoth";
import { redirect } from "next/navigation";
import { getPeriod } from "@/utils/payperiod";
import { 
    useState, 
    useEffect 
} from "react";
import { 
    RadioGroup, 
    Radio, 
} from "@nextui-org/react";
import {
    mkConfig, 
    generateCsv, 
    download 
} from 'export-to-csv'


const AdminPannel = () =>{

    //datatype declarations
    let bweh:{[key:string]: string}={};
    let jtype:{[ship: string] : {[user:string]: {[day:string]: string}}}={};
    const tblData:any[] = [];

    //states
    const [shipEh, setShipEh] = useState('BMCC'); // ship filter
    const [periodEh, setPeriodEh] = useState(0); // 0 for curr -/+ for rest (we invert)
    const [crewDict, setcrewDict]= useState(bweh); // domestic v foreign
    const [userDict, setuserDict] = useState(bweh);
    const [dataResponse, setdataResponse] = useState([]);
    const [json, setjson] = useState(jtype);

    const [crewEh, setCrewEh] = useState('all');
    const [weeks, setWeeks] = useState('1');

    const period = getPeriod(periodEh);

    //database queries
    useEffect(()=>{
        const getEveryting = async () =>{
            //fetch from database
            const response = await fetchBoth(port+'/api/gigaquery');
            const res = await response.json();

            //type declarations
            let crewDict:{[id: string] : string} = {};
            let userDict:{[id: string] : string} = {};
            let masterJson:{[ship: string] : {[user:string]: {[day:string]: string}}}={}; // a mess really, but whatever works

            try{
                //build responses
                (res.resp).forEach((day:any)=>{
                    if(day['day']=='-1'){ 
                        crewDict[day['username']]=(day['ship']=="1")?'domestic' : 'foreign'; // log crew type
                        return;
                    } 
                    if(!userDict[day['uid']])userDict[day['uid']]=day['username']; // match UID to username
                    if(!masterJson[day['ship']]) masterJson[day['ship']]={};
                    if(!masterJson[day['ship']][day['uid']]) masterJson[day['ship']][day['uid']]={};
                    masterJson[day['ship']][day['uid']][day['day']]=day['type'];

                })
            }
            catch(e){} // just so page doesnt crash for non-admin users

            //set states
            setuserDict(userDict);
            setcrewDict(crewDict);
            setdataResponse(res);
            setjson(masterJson)

        }
        getEveryting();
    },[])

    //block non-admins & redirect
    if(dataResponse['error' as any]){ 
        console.log('you do not have administrator access :c');
        redirect('../../');
    } 

    //build our table
    if(json[shipEh]){
        Object.keys(json[shipEh]).map((name)=>{
            let sum=0;
            period.map((e) =>{
                if(json[shipEh][name][e]) sum++;
            })
            let row={
                cre:    crewDict[userDict[name]],
                fna:    name.split('/')[0],
                lna:    name.split('/')[1],
                mon:    json[shipEh][name][period[0]] ? json[shipEh][name][period[0]] : '',
                tue:    json[shipEh][name][period[1]] ? json[shipEh][name][period[1]] : '',
                wed:    json[shipEh][name][period[2]] ? json[shipEh][name][period[2]] : '',
                thu:    json[shipEh][name][period[3]] ? json[shipEh][name][period[3]] : '',
                fri:    json[shipEh][name][period[4]] ? json[shipEh][name][period[4]] : '',
                sat:    json[shipEh][name][period[5]] ? json[shipEh][name][period[5]] : '',
                sun:    json[shipEh][name][period[6]] ? json[shipEh][name][period[6]] : '',
                sum:    sum.toString(),
            }
            if(sum!=0) tblData.push(row);
        })
    }

    //export csv
    const exportCsv = () =>{
        //setup label columns
        const expTableData:any[] = [];

        let tday:{[id: string] : string} = {};
        tday['cre']='crew'
        tday['fna']='first name'
        tday['lna']='last name'
        tday['sum']='total'

        for(var i=Number(weeks)-1; i>=0; i--){
            const nperiod = getPeriod(i+periodEh)
            let day:{[id: string] : string} = {};
            nperiod.map((p)=>{
                day[p] = p
            })

            tday = {...tday, ...day}
        }

        Object.keys(json[shipEh]).map((name)=>{
            let usr:{[id: string] : string} = {};
            let sum=0;
            for(const [id, value] of Object.entries(tday)){
                
                if(json[shipEh][name][id]){
                    sum+=1;
                    usr[id] = json[shipEh][name][id];
                }
                else usr[id]='';
            }
            usr['cre']=crewDict[userDict[name]];
            usr['lna']=name.split('/')[0];
            usr['fna']=name.split('/')[1];
            usr['sum']=String(sum);
            
            if(sum!=0 && (usr['cre']==crewEh || crewEh=='all')){
                expTableData.push(usr)
                console.log(usr)
            } 
        })
        console.log(expTableData)

        // generate from CSV, basically just copied from export-to-csv documentation
        const csvConfig = mkConfig({ 
            useKeysAsHeaders: true, 
            filename:shipEh+'_'+period[0]+'_TO_'+period[6]+'_'+crewEh
        });
        const csv = generateCsv(csvConfig)(expTableData);
        download(csvConfig)(csv)
    }

    return(
        <main className="flex min-h-screen flex-col items-center">
            <p>
                <button className='tblFootBtn' key='back' onClick={()=>{setPeriodEh(periodEh+1)}}> {'< '} back</button>
                {period[0]} to {period[6]}
                <button className='tblFootBtn' key='forward' onClick={()=>{setPeriodEh(periodEh-1)}}>forward {' >'}</button>
            </p>
            <div className='adminWrap'>
                <div className='adminFilterWrap'>
                    <RadioGroup
                        key='filter'
                        label='filter: '
                        value={shipEh}
                        onValueChange={(v)=>setShipEh(v)}
                    >
                        <Radio
                            key='BMCC'
                            value='BMCC'
                            className={shipEh=='BMCC' ? 'uadminRB' : 'sadminRB'}
                        >BMCC</Radio>
                        <Radio
                            key='EMMA'
                            value='EMMA'
                            className={shipEh=='EMMA' ? 'uadminRB' : 'sadminRB'}
                        >EMMA</Radio>
                        <Radio
                            key='PROT'
                            value='PROT'
                            className={shipEh=='PROT' ? 'uadminRB' : 'sadminRB'}
                        >PROT</Radio>
                        <Radio
                            key='GYRE'
                            value='GYRE'
                            className={shipEh=='GYRE' ? 'uadminRB' : 'sadminRB'}
                        >GYRE</Radio>
                        <Radio
                            key='NAUT'
                            value='NAUT'
                            className={shipEh=='NAUT' ? 'uadminRB' : 'sadminRB'}
                        >NAUT</Radio>
                        <Radio
                            key='3RD'
                            value='3RD'
                            className={shipEh=='3RD' ? 'uadminRB' : 'sadminRB'}
                        >3RD</Radio>
                        <Radio
                            key='????'
                            value='????'
                            className={shipEh=='????' ? 'uadminRB' : 'sadminRB'}
                        >????</Radio>
                    </RadioGroup>
                </div>
                <div className='adminTable'>
                    <div className='adminRowLabel' key='headrow'>
                        <div className='adminLabelX' key='headnamelblx'><strong>NAME</strong></div>
                        <div className='adminLabelY' key='headnamelbly'>CREW</div>
                        {period.map((day)=>
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
            <div className='tblHead'>
                <RadioGroup
                    className='exportSettings'
                    key='weeks'
                    label='Weeks: '
                    value={weeks}
                    onValueChange={(v)=>setWeeks(v)}        
                >
                    <Radio
                        key='1'
                        value='1'
                        className={weeks=='1' ? 'uexportSetting' : 'sexportSetting'}
                    >1</Radio>
                    <Radio
                        key='2'
                        value='2'
                        className={weeks=='2' ? 'uexportSetting' : 'sexportSetting'}
                    >2</Radio>
                    <Radio
                        key='4'
                        value='4'
                        className={weeks=='4' ? 'uexportSetting' : 'sexportSetting'}
                    >4</Radio>
                </RadioGroup>


                <RadioGroup
                    className='exportSettings'
                    key='crews'
                    label='Crews: '
                    value={crewEh}
                    onValueChange={(v)=>setCrewEh(v)}        
                >
                    <Radio
                        key='all'
                        value='all'
                        className={crewEh=='all' ? 'uexportSetting' : 'sexportSetting'}
                    >all</Radio>
                    <Radio
                        key='domestic'
                        value='domestic'
                        className={crewEh=='domestic' ? 'uexportSetting' : 'sexportSetting'}
                    >domestic</Radio>
                    <Radio
                        key='foreign'
                        value='foreign'
                        className={crewEh=='foreign' ? 'uexportSetting' : 'sexportSetting'}
                    >foreign</Radio>
                </RadioGroup>

                <button className='tblFootBtn' onClick={exportCsv}>export</button> 
            </div>

        </main>
    )
    
}
export default AdminPannel;