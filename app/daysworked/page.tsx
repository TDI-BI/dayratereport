"use client";
import { getPort } from '@/utils/getPort'; const por=getPort();
import { getPeriod } from '@/utils/payperiod';
import { fetchBoth } from '@/utils/fetchBoth';
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { flashDiv } from "@/utils/flashDiv";
import { 
    useState, 
    useEffect 
} from "react";

//we need some helper function to check the bounds of what is legal and what isnt

export default function Home(){

    const router = useRouter();
  
    //states
    const [period, setPeriod] = useState(getPeriod()); // init period
    const [vessels, setVessels]=useState({} as {[key:string]:any});
    const [jobs, setJobs]=useState({} as {[key:string]:any});
    const [crew, setCrew] = useState(true);
    const [dataResponse, setdataResponse] = useState([]);
    const [saving, setsaving] = useState(0);
    const [umsg, setUmsg] = useState('');
    const [prev, setprev] = useState(0);

    const ex = 'prev=' + prev;

    //save then redirect
    const review = async () => {
        const rlink = '/daysworked/review?'+ex;
        if(await save()) router.push(rlink);
    }

    //save table entrys
    const save = async () =>{ 
        setsaving(1);
        setUmsg('saving...')
        let strdict='';
        let derrors:HTMLElement[] = []; // gonna treat this as a stack for which days i need to flash

        period.map((day) => { 

            if( // one or not hte other
                !vessels[day] && jobs[day] || 
                vessels[day] && !jobs[day]
            ){
                derrors.push(document.getElementById(day+'flash') as HTMLElement);
                return; //skip the rest of this since it errors anyway
            }
               
            //read our displayed tabl
            var cship='';
            var cjob='';

            vessels[day] ? cship=vessels[day] : '';
            jobs[day] ? cjob = jobs[day] : '';
            
            //prepare our output
            strdict+=day+':'+cship+':'+cjob+';';
        })

        //if we have any errors inform the user they need to make changes before they can save
        if(derrors.length!=0){
            derrors.forEach((itm)=>{
                flashDiv(itm);
            });
            return false;
        }
        
        crew ? strdict+='&dom=1':strdict+='&dom=0' // flags if you are a domestic or foreign worker
        const apiUrlEndpoint = por+'/api/mkday?days='+strdict+'&'+ex;
        console.log(apiUrlEndpoint)
        await fetchBoth(apiUrlEndpoint);
        setUmsg('saved')
        setsaving(0);
        return true;
    }

    const checkBounds = async (t:boolean) => { // incoming 1 for next 0 for last, also needs to be async for verification
        const nweek = (await (await (fetchBoth(por+'/api/verifydate?prev='+(t ? prev - 1 : prev + 1)))).json()).resp // get next week in intended direction
        if(crew){
            const thisp = (await(await fetchBoth(por+'/api/getlatestdomesticperiod')).json()).resp
            const checkday = t ? nweek[0] : nweek[6]
            return thisp.includes(checkday)
        }
        else{
            const thismonth = new Date((await (await (fetchBoth(por+'/api/getday'))).json()).resp).getMonth(); // zero indexed so +1 this is really stupid
            const fweek=nweek.filter((e:any)=>
                (Number(e.slice(5, 7)) == thismonth+1)
            )
            return fweek.length > 0 
        }
    }

    useEffect(() => {
        //query database
        async function getPeriodInf(){
            const apiUrlEndpoint = por+'/api/getperiodinf?'+ex;
            const response = await fetchBoth(apiUrlEndpoint);
            const res = await response.json();
            
            let ves:{[id: string] : string} = {};
            let job:{[id: string] : string} = {};
            try{
                (res.resp).forEach((item:any)=>{ // for some reason i need to :any to compile, annoying!
                    if(item['day']=='-1'){
                        return;
                    }
                    ves[item['day']]=item['ship'];
                    job[item['day']]=item['type'];
                })
            }
            catch(e){}   // make sure page doesnt crash

            const perResp = await (fetchBoth(por+'/api/verifydate?'+ex))
            const serverPeriod = (await perResp.json()).resp;

            const session = (await (await fetchBoth(por+'/api/sessionforclient')).json()).resp

            setCrew(session.isDomestic ? true : false); // error thrown bc could maybe be empty (lie)
            setPeriod(serverPeriod);
            setVessels(ves);
            setJobs(job);
            setdataResponse(res.resp); 
            
        }
        getPeriodInf();

    }, [ex]);

    try{
        dataResponse.forEach((item) => {}); // this will throw an error if the user isnt logged in
    }
    catch{ // redirect if we throw an error
        redirect('../../');
    }

    return (
        <main className="flex min-h-screen flex-col items-center px-1 space-y-[10px]">  
            <div className='inline-flex h-[44px]' id='buttons'>
                <button className='w-[150px] btnh btn hoverbg' onClick={async () =>{ 
                    if(!await checkBounds(false)){ //need to create some visual indication that we are maximally backed
                        const flashme =document.getElementById('buttons') as HTMLElement 
                        flashDiv(flashme)
                        return;
                    }
                    setprev(prev+1);
                }}> {'< back a week'} </button>
                
                
                <button id='forbutton' className='w-[150px] btnh btn hoverbg' onClick={async () =>{ 
                    if(!await checkBounds(true)){ 
                        const flashme =document.getElementById('buttons') as HTMLElement 
                        flashDiv(flashme)
                        return;
                    }
                    setprev(prev-1);
                }}> {'forward a week >'} </button>
            </div>
            <div className='tblWrapper' id='pgtbl'>
                <div className='pt-[10px] inline-flex'>
                    <div className='tblHeadItm'>
                        <strong>DATE</strong>
                    </div>
                    <div className='tblHeadItm'>
                        <strong>VESSEL</strong>
                    </div>
                    <div className='tblHeadItm'>
                        <strong>DEPT</strong>
                    </div>
                </div>
                <div>
                    {
                    period.map((day:string)=>
                        <div key={day} id={day+'flash'}>
                            <div key={day} id={day+'_item'} className='pt-[15px] h-[60px] hoverbg'>{/*each of these are 345 wide as its the perfect width for mobile. do everything to maintain that*/}
                                <div className="tblBodyDate">
                                    {day}
                                </div>

                                <div className="tblDD">
                                    <select className='hoverLn shipInput' id={day+'_ship'} value={vessels[day as keyof {}] ? vessels[day as keyof {}] : ''} onChange={(e)=>{
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
                                    </select>
                                </div>
 
                                <div className="tblDD">
                                    <select className='hoverLn shipInput' id={day+'_job'} value={jobs[day as keyof {}] ? jobs[day as keyof {}] : ''} onChange={(e)=>{
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
            </div>

            <div className='tblFoot'>
                <button className='w-[185.5px] btnh btn hoverbg' onClick={save}> save </button>
                <button className='w-[185.5px] btnh btn hoverbg' onClick={review}> next </button>
            </div>
            <div> <p className={saving ? 'savemsg1' : 'savemsg0'}>{umsg}</p> </div>
        </main>
    );
}

