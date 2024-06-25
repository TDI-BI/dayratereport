"use client"; // needed for interactivity
import { useState, useEffect, HTMLInputTypeAttribute } from "react";
import { getPeriod } from '@/utils/payperiod';
import { getPort } from '@/utils/getPort';
import { fetchBoth } from '@/utils/fetchBoth';
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { flashDiv } from "@/utils/flashDiv";

//page globals
const por=getPort();
const period= getPeriod();
let runcount=1;

export default function Home(){
    const router = useRouter();
    //function for saving our ship
    const review = async () => {
        if(await save()) router.push('/daysworked/review')
    }

    const save = async () =>{ 
        let strdict=''
        period.map((day) => { 
           
            //read our displayed table
            var cship='';
            if(dict[day as keyof {}]) cship = dict[day as keyof {}]
            
            //prepare our output
            strdict+=day+':'+cship+';';
            
        })
        if(selected==''){
            const target= document.getElementById('target') as HTMLElement
            flashDiv(target)
            return false
        }
        selected=='domestic' ? strdict+='&dom=1':strdict+='&dom=0' // flags if you are a domestic or foreign worker
        const apiUrlEndpoint = por+'/api/mkday?days='+strdict;
        await fetchBoth(apiUrlEndpoint);
        return true;
    }
    const [dict, setdict]=useState({})
    const [selected, setSelected] = useState('')
    const [dataResponse, setdataResponse] = useState([]);
        useEffect(() => {

            //query database
            async function getPeriodInf(){
                const apiUrlEndpoint = por+'/api/getperiodinf';
                const response = await fetchBoth(apiUrlEndpoint);
                const res = await response.json();
                
                let dict:{[id: string] : string} = {}
                try{
                    (res.resp).forEach((item:any)=>{ // for some reason i need to :any to compile, annoying!
                        if(item['day']=='-1'){
                            item['ship']=='1' ? setSelected('domestic') : setSelected('foreign')
                            return
                        }
                        dict[item['day']]=item['ship']
                    })
                }
                catch{
                    
                }
                setdict(dict);
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
        }, []
    );
    try{
        dataResponse.forEach((item) => {}); // this is literally jsut an error catcher, if this doesnt work it means we are logged out   
    }
    catch{ // dataresponse will be null in the case of our user not being logged in
        redirect('../../')
    }
    //generate html
    console.log('refresh')
    return (
        <main className="flex min-h-screen flex-col items-center px-1">  
            <div className='tblWrapper'>
                <div className='tblHead'>
                    <div className='tblHeadCheck'>
                        <input type='checkbox' id={'all'} />
                    </div>
                    <div className='tblHeadDate'>
                        <strong>DATE</strong>
                    </div>
                    <div className='tblHeadShip'>
                        <strong>VESSEL</strong>
                    </div>
                </div>
                <div>
                    {
                    period.map((day:string)=>
                        <div key={day} id={day+' item'} className='tblRow'>
                            <div className="tblBodyCheck">
                                <input type='checkbox' id={day+'_worked'}/>
                            </div>
                            <div className="tblBodyDate">
                                {day}
                            </div>

                            <div className="tblBodyShip">
                                <select className='shipInput' id={day+'_ship'} value={dict[day as keyof {}]} onChange={(e)=>{
                                    //this is extremely ugly but it works, so thats whats important-est imo
                                    let ndict:{[id: string] : string}=structuredClone(dict)
                                    ndict[day]=e.target.value
                                    setdict(ndict)
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
                        </div>  
                    )}
                </div>

                <div className='crewtype' id='target'>
                    CREW:
                        <button onClick={()=>setSelected('domestic')} className={selected=='domestic'? 'selectedCrew': 'unselectedCrew'}>domestic</button>
                        <button onClick={()=>setSelected('foreign')} className={selected=='foreign'? 'selectedCrew': 'unselectedCrew'}>foreign</button>
                </div>
            </div>

            <div className='tblFoot'>
                <button className='tblFootBtn' onClick={save}> save </button>
                <button className='tblFootBtn' onClick={review}> review </button>
            </div>
        </main>
    );
}
