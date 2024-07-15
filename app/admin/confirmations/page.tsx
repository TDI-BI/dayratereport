'use client'
import { useState, useEffect } from "react";
import { fetchBoth } from "@/utils/fetchBoth";
import { getPort } from "@/utils/getPort";
import { getPeriod } from "@/utils/payperiod";



const Confirmations = () =>{
    
    //FOR SORTING OUR TABLE
    const period = getPeriod()
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('lastConfirmed');
    const searchFilter = (array:any) => {
        return array.filter(
            (el:any)=>el['uid'].includes(search)
        )
    }
    const sortBy = (array:any)=>{
        return array.sort(
            (el1:any, el2:any)=>{
                if(el1[sort]==el2[sort]) return 0;
                else return el1[sort]>el2[sort] ? 1 : -1
            }
        )
    }
    //DATABASE QUERIES
    const [users, setUsers] = useState([])
    useEffect(()=>{
        
        const getArr = async () =>{
            let resp = await fetchBoth(getPort()+'/api/getusers')
            const users = (await resp.json()).resp;
            setUsers(users)
        }
        getArr();

    }, [])
    const filtered = searchFilter(users)
    const sorted = sortBy(filtered);

    return(
        <main className="flex min-h-screen flex-col items-center">
            <input type='text' onChange={(e)=>{
                setSearch(e.target.value)
            }}/>
            <div className='adminTable'>
                <div className='adminRow'>
                        <div className='adminLabelX' key='uidlabel'><strong>UID</strong></div>
                        <div className='adminLabelX' key='emaillabel'><strong>EMAIL</strong></div>
                        <div className='adminCell' key='conflabel'>confirmed:</div>
                    </div>
                
                {sorted.map((inp:any)=>
                    <div className='adminRow' key={inp['uid'] + 'row'}>
                        <div className='adminLabelX' key={inp['uid']+'uid'}>{inp['uid']} </div>
                        <div className='adminLabelX' key={inp['uid']+'email'}>{inp['email']} </div>
                        <div className={(period.includes(inp['lastConfirm']) && inp['lastConfirm']) ? 'adminCellG' : 'adminCellR'} key={inp['uid']+'confirmation'}>{inp['lastConfirm']} </div>
                    </div>
                )}
            </div>
        </main>
    )
}

export default Confirmations;