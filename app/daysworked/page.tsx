"use client"; // needed for interactivity
import { useState, useEffect, HTMLInputTypeAttribute } from "react";
import { getPeriod } from '@/utils/payperiod';
import { getPort } from '@/utils/getPort';
import { fetchBoth } from '@/utils/fetchBoth';
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { flashDiv } from "@/utils/flashDiv";
import { useSearchParams } from "next/navigation";

//page globals
const por=getPort();

let runcount=1;


export default function Home(){
    const router = useRouter();

    //flag for previous
    const sprms = useSearchParams();
    const prev= sprms.get('prev')=='1';
    const period = prev? getPeriod(1) : getPeriod(0)
    const ex = prev ? 'prev=1' : '';

    //function for saving our ship
    const review = async () => {
        const rlink = prev? '/daysworked/review?prev=1' : '/daysworked/review'
        if(await save()) router.push(rlink)
    }

    const save = async () =>{ 
        let strdict=''
        let derrors:HTMLElement[] = [] // gonna treat this as a stack for which days i need to flash
        period.map((day) => { 

            if( // one or not hte other
                !vessels[day as keyof {}] && jobs[day as keyof {}] || 
                vessels[day as keyof {}] && !jobs[day as keyof {}]
            ){
                derrors.push(document.getElementById(day+'flash') as HTMLElement)
                return; //skip the rest of this since it errors anyway
            }
               
            //read our displayed tabl
            var cship='';
            var cjob='';
            //console.log('vessels: '+vessels[day as keyof {}])
            vessels[day as keyof {}] ? cship=vessels[day as keyof {}] : ''
            jobs[day as keyof {}] ? cjob = jobs[day as keyof {}] : ''
            
            //prepare our output
            strdict+=day+':'+cship+':'+cjob+';';
            
        })
        if(derrors.length!=0){
            derrors.forEach((itm)=>{
                flashDiv(itm)
            })
            return false;
        }
        if(crew==''){
            const target= document.getElementById('target') as HTMLElement
            flashDiv(target)
            return false
        }
        
        crew=='domestic' ? strdict+='&dom=1':strdict+='&dom=0' // flags if you are a domestic or foreign worker
        const apiUrlEndpoint = por+'/api/mkday?days='+strdict+'&'+ex;
        await fetchBoth(apiUrlEndpoint);
        return true;
    }
    const [vessels, setVessels]=useState({})
    const [jobs, setJobs]=useState({})
    const [crew, setCrew] = useState('')
    const [dataResponse, setdataResponse] = useState([]);
    useEffect(() => { 
        //query database
        async function getPeriodInf(){
            const apiUrlEndpoint = por+'/api/getperiodinf?'+ex;
            const response = await fetchBoth(apiUrlEndpoint);
            const res = await response.json();
            
            let ves:{[id: string] : string} = {}
            let job:{[id: string] : string} = {}
            try{
                (res.resp).forEach((item:any)=>{ // for some reason i need to :any to compile, annoying!
                    if(item['day']=='-1'){
                        item['ship']=='1' ? setCrew('domestic') : setCrew('foreign')
                        return
                    }
                    ves[item['day']]=item['ship']
                    job[item['day']]=item['type']
                })
            }
            catch{
                    
            }
            setVessels(ves);
            setJobs(job);
            setdataResponse(res.resp); 
            
        }
        getPeriodInf();

        //event listeners are async and thus must be wrapped in some kind of useeffect
        document.addEventListener('keydown', e => { // catch ctrls
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if(e.repeat) return; // stops hold from looping this function
                if((runcount%2)==1){ // ignore every other since this always triggers at least twice
                    save();
                } 
                runcount+=1;
                return; // idk how important this is to be honest
            }
        });
    }, []);

    try{
        dataResponse.forEach((item) => {}); // this is literally jsut an error catcher, if this doesnt work it means we are logged out   
    }
    catch{ // dataresponse will be null in the case of our user not being logged in
        redirect('../../')
    }
    //generate html
    //console.log('refresh')
    return (
        <main className="flex min-h-screen flex-col items-center px-1">  
            <div className='tblFoot'>
                <button className='topBtn' onClick={() =>{ 
                    const more = prev? 'redirect?prev=0' : 'redirect?prev=1'
                    router.push(more)
                }}> {prev ? 'show current period >' : '< show previous period'} </button>
            </div>
            <div className='tblWrapper'>
                <div className='tblHead'>
                    <div className='tblHeadDate'>
                        <strong>DATE</strong>
                    </div>
                    <div className='tblHeadShip'>
                        <strong>VESSEL</strong>
                    </div>
                    <div className='tblHeadShip'>
                        <strong>JOB</strong>
                    </div>
                </div>
                <div>
                    {
                    period.map((day:string)=>
                        <div key={day} id={day+'flash'}>
                            <div key={day} id={day+'_item'} className='tblRow'>{/*each of these are 345 wide as its the perfect width for mobile. do everything to maintain that*/}
                                <div className="tblBodyDate">
                                    {day}
                                </div>

                                <div className="tblBodyShip">
                                    <select className='shipInput' id={day+'_ship'} value={vessels[day as keyof {}] ? vessels[day as keyof {}] : ''} onChange={(e)=>{
                                        //this is extremely ugly but it works, so thats whats important-est imo
                                        let ndict:{[id: string] : string}=structuredClone(vessels)
                                        ndict[day]=e.target.value
                                        setVessels(ndict)
                                    }}>
                                        <option value='' id='' key='' className='shipValue'/>
                                        <option value='BMCC' label='BMCC' key='BMCC' className='shipValue'/>
                                        <option value='EMMA' label='EMMA' key='EMMA' className='shipValue'/>
                                        <option value='PROT' label='PROT' key='PROT' className='shipValue'/>
                                        <option value='GYRE' label='GYRE' key='GYRE' className='shipValue'/>
                                        <option value='NAUT' label='NAUT' key='NAUT' className='shipValue'/>
                                        <option value='3RD' label='3RD' key='3RD' className='shipValue'/>
                                        <option value='????' label='????' key='????' className='shipValue'/>
                                    </select>
                                </div>

                                <div className="tblBodyShip">
                                    <select className='shipInput' id={day+'_job'} value={jobs[day as keyof {}] ? jobs[day as keyof {}] : ''} onChange={(e)=>{
                                        //this is extremely ugly but it works, so thats whats important-est imo
                                        let ndict:{[id: string] : string}=structuredClone(jobs)
                                        ndict[day]=e.target.value
                                        setJobs(ndict)
                                    }}>
                                        <option value='' id='' key='' className='shipValue'/>
                                        <option value='TECH' label='TECH' key='TECH' className='shipValue'/>
                                        <option value='MARINE' label='MARINE' key='MARINE' className='shipValue'/>
                                    </select>
                                </div>
                            </div>  
                        </div>
                        
                    )}
                </div>

                <div className='crewtype' id='target'>
                    CREW:
                        <button onClick={()=>setCrew('domestic')} className={crew=='domestic'? 'selectedCrew': 'unselectedCrew'}>domestic</button>
                        <button onClick={()=>setCrew('foreign')} className={crew=='foreign'? 'selectedCrew': 'unselectedCrew'}>foreign</button>
                </div>
            </div>

            <div className='tblFoot'>
                <button className='tblFootBtn' onClick={save}> save </button>
                <button className='tblFootBtn' onClick={review}> review </button>
            </div>
        </main>
    );
}
