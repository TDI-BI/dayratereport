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
        //console.log('you do not have administrator access :c');
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
                nam:    name.split('/')[0]  + ' ' + name.split('/')[1], 
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
                //console.log(usr)
            } 
        })
        //console.log(expTableData)

        // generate from CSV, basically just copied from export-to-csv documentation
        const csvConfig = mkConfig({ 
            useKeysAsHeaders: true, 
            filename:shipEh+'_'+period[0]+'_TO_'+period[6]+'_'+crewEh
        });
        const csv = generateCsv(csvConfig)(expTableData);
        download(csvConfig)(csv)
    }

    const [userfilter, setuserFilter] = useState('')
    const searchFilteru = (array:any) => {
        return array.filter(
            (el:any)=>(el['nam'].toLowerCase()).includes(userfilter.toLowerCase())
        );
    }

    const userlist = searchFilteru(tblData)

    return(
        <main className="flex min-h-screen flex-col items-center">
            <div className='inline-flex flex-row pb-[10px]'>
                <p>
                    <button className='w-[180px] btnh btn hoverbg' key='back' onClick={()=>{setPeriodEh(periodEh+1)}}> {'< '} back</button>
                    {period[0]} to {period[6]}
                    <button className='w-[180px] btnh btn hoverbg' key='forward' onClick={()=>{setPeriodEh(periodEh-1)}}>forward {' >'}</button>
                </p>
                <div className='pt-[7px]'>
                    <div className='bg-white h-[30px] w-[240px] rounded-xl p-[2px] pl-[10px] pr-[10px] overflow-hidden'>
                        <input type='text' className='text-black h-[24px] focus:outline-none' value={userfilter} onChange={(e)=>setuserFilter(e.target.value)} placeholder='search users...'></input>
                    </div>
                </div>
            </div>
            <div className='inline-flex flex-row'>
                <div className='w-[200px]'>
                    <RadioGroup
                        key='filter'
                        label='filter: '
                        value={shipEh}
                        onValueChange={(v)=>setShipEh(v)}
                    >
                        <Radio
                            key='BMCC'
                            value='BMCC'
                            className={'hoverbg adminRB ' + (shipEh=='BMCC' ? 'select' : '')}
                        >BMCC</Radio>
                        <Radio
                            key='EMMA'
                            value='EMMA'
                            className={'hoverbg adminRB ' + (shipEh=='EMMA' ? 'select' : '')}
                        >EMMA</Radio>
                        <Radio
                            key='PROT'
                            value='PROT'
                            className={'hoverbg adminRB ' + (shipEh=='PROT' ? 'select' : '')}
                        >PROT</Radio>
                        <Radio
                            key='GYRE'
                            value='GYRE'
                            className={'hoverbg adminRB ' + (shipEh=='GYRE' ? 'select' : '')}
                        >GYRE</Radio>
                        <Radio
                            key='NAUT'
                            value='NAUT'
                            className={'hoverbg adminRB ' + (shipEh=='NAUT' ? 'select' : '')}
                        >NAUT</Radio>
                        <Radio
                            key='3RD'
                            value='3RD'
                            className={'hoverbg adminRB ' + (shipEh=='3RD' ? 'select' : '')}
                        >3RD</Radio>
                        <Radio
                            key='????'
                            value='????'
                            className={'hoverbg adminRB ' + (shipEh=='????' ? 'select' : '')}
                        >????</Radio>
                    </RadioGroup>
                </div>
                <div className='adminTable'>
                    <div className='h-[26px]' key='headrow'>
                        <div className='adminCell adminLabelX' key='headnamelblx'><strong>NAME</strong></div>
                        <div className='adminCell adminLabelY' key='headnamelbly'>CREW</div>
                        {period.map((day)=>
                            <div className='adminCell adminLabelY' key={day+'label'}>
                                <p>{day}</p>
                            </div>
                        )}
                    </div>
                    {json[shipEh] && userlist.map((el:any)=>
                        <div className='h-[26px] bghover' key={el.fna+el.lna}>
                            <div className='adminCell adminLabelX' key={el.fna+el.lna+'name'}>{el.fna + ' ' + el.lna}</div>
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
            <div className='pt-[10px] inline-flex'>
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
                        className={(weeks=='1' ? 'select' : '')+' exportSetting hoverbg'}
                    >1</Radio>
                    <Radio
                        key='2'
                        value='2'
                        className={(weeks=='2' ? 'select' : '')+' exportSetting hoverbg'}
                    >2</Radio>
                    <Radio
                        key='6'
                        value='6'
                        className={(weeks=='6' ? 'select' : '')+' exportSetting hoverbg'}
                    >6</Radio>
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
                        className={(crewEh=='all' ? 'select' : '')+' exportSetting hoverbg'}
                    >all</Radio>
                    <Radio
                        key='domestic'
                        value='domestic'
                        className={(crewEh=='domestic' ? 'select' : '')+' exportSetting hoverbg'}
                    >domestic</Radio>
                    <Radio
                        key='foreign'
                        value='foreign'
                        className={(crewEh=='foreign' ? 'select' : '')+' exportSetting hoverbg'}
                    >foreign</Radio>
                </RadioGroup>

                <button className='w-[180px] h-[115px] btn hoverbg' onClick={exportCsv}>export</button> 
            </div>

        </main>
    )
    
}
export default AdminPannel;