"use client"; // needed for interactivity
import Link from "next/link";
import { useState, useEffect, HTMLInputTypeAttribute } from "react";
import { getPeriod } from '@/utils/payperiod';
import { getPort } from '@/utils/getPort';
import { fetchBoth } from '@/utils/fetchBoth';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@nextui-org/react"
import { redirect } from "next/navigation";

//page globals
const por=getPort();
const period= getPeriod();
let runcount=1;
const slist:string[] = [
    'brooks',
    'emma',
    'marcelle',
    'proteus',
    'gyre',
    'nautilus',
    'barnacle',
    'unspecified',
] // may change this to query a database at some point, for now its just hard set


export default function Home(){
    //function for saving our ship
    const save = async () =>{ 
        let strdict=''
        period.map((day) => { 
            //setting up constants makes the logic look way cleaner
            const inp= (document.getElementById(day+'_ship') as HTMLInputElement).value.substring(0, 15) || ''; // trim to prevent overflow
            const plc= (document.getElementById(day+'_ship')!.getAttribute('placeholder') as string)
            const box= (document.getElementById(day+'_worked') as HTMLInputElement).checked
           
            //read our displayed table
            let cship='';
            if(inp!='') cship=inp;
            else if (plc!='' && box) cship=plc;
            else if (box) cship='unspecified'
            
            //prepare our output
            strdict+=day+':'+cship+';';

            //update our displayed table
            (document.getElementById(day+'_ship') as HTMLInputElement).value='';
            document.getElementById(day+'_ship')!.setAttribute('placeholder', cship);
            cship ? (document.getElementById(day+'_worked') as HTMLInputElement).checked = true : (document.getElementById(day+'_worked') as HTMLInputElement).checked = false;
            
        })

        const domestic = ((document.getElementById('american') as HTMLInputElement).checked)
        domestic ? strdict+='&dom=1':strdict+='&dom=0' // flags if you are a domestic or foreign worker

        const apiUrlEndpoint = por+'/api/mkday?days='+strdict;
        
        await fetchBoth(apiUrlEndpoint);
        
    }

    const [dataResponse, setdataResponse] = useState([]);
        useEffect(() => {

            //query database
            async function getPeriodInf(){
                const apiUrlEndpoint = por+'/api/getperiodinf';
                const response = await fetchBoth(apiUrlEndpoint);
                const res = await response.json();
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
                        //console.log('saving ' + runcount)
                    } 
                    runcount+=1;
                    return; // idk how important this is to be honest
                }
            });
        }, []
    );

    //build a dictionary mapping ships to days
    var dict: {[id: string] : string} = {};
    try{
        dataResponse.forEach((item) => {
            if(item['day']=='-1'){
                if(item['ship']==1) (document.getElementById('american') as HTMLInputElement).checked = true;
                return
            }
            dict[item['day']]=item['ship']
            if(item['ship']) (document.getElementById(item['day']+'_worked') as HTMLInputElement).checked = true;
        }) 
    }
    catch{ // if we arent logged in dataresponse will be null, throwing an error
        redirect('../')
    }


    //generate html
    return (
        <main className="flex min-h-screen flex-col items-center px-1">  

            <datalist id='suggestion'>
                {slist.map((item) => <option key={item} value={item}>{item}</option>)}
            </datalist>

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
                            {/*this may be worth wrapping in a box, just to indicate better you can fill it out*/}
                            <div className="tblBodyShip">
                                <input type='text' className='shipInput' id={day+'_ship'} placeholder={dict[day] ? dict[day] : ''} list='suggestion'/>
                            </div>
                        </div>  
                    )}
                </div>
            </div>
            <div className='domestic'>
                <p>
                    I am an american citizen : 
                    <input type='checkbox' id='american'/>
                </p>
            </div>
            <div className='tblFoot'>
                <button className='tblFootBtn' onClick={save}>save</button>
                <Link href='travellog/review'><div className='tblFootBtn'> review </div></Link>
            </div>
        </main>
    );
}
