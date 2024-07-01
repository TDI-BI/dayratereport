'use client'
import { useState, useEffect } from "react";
import { getPort } from "@/utils/getPort";
import { fetchBoth } from "@/utils/fetchBoth";
import { redirect } from "next/navigation";


const port = getPort();



const adminPannel = () =>{
    //gets stuffge
    const [fdict, setfdict]= useState({}); // username:string : isDomestic:bool
    const [dataResponse, setdataResponse] = useState([]);
    const [days, setDays] = useState([]);
    useEffect(()=>{
        const getEveryting = async () =>{
            const response = await fetchBoth(port+'/api/gigaquery')
            const res = await response.json();
            let stuff:any = [];
            let tdict:{[id: string] : boolean} = {};
            (res.resp).forEach((day:any)=>{
                if(day['day']=='-1') tdict[day['username']]=day['ship']=="1"
                else stuff.push(day)
            })
            setfdict(tdict);
            setDays(stuff);
            setdataResponse(res);

        }
        getEveryting();
    },[])
    if(dataResponse['error' as any]) redirect('../../') // block non-admins
    console.log(fdict)
    




    return( // just default page wrapper for now
        <main className="flex min-h-screen flex-col items-center">
            {days.map((day)=>day['ship'] && <p key={day['day']+day['uid']}>{
                day['day'] + ' : ' + day['ship'] + ' : ' + day['type'] + ' : ' + day['uid'] + ' : ' + day['username'] + ' : '
            }</p>)}
        </main>
    )
    
}
export default adminPannel;