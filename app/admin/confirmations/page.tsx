'use client'
import { useState, useEffect } from "react";
import { fetchBoth } from "@/utils/fetchBoth";
import { getPort } from "@/utils/getPort";



const Confirmations = () =>{

    //FOR SORTING OUR TABLE
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('uid');
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
            {
                sorted.map((inp:any)=>
                <p key={inp['uid']}>{inp['uid']}</p>
                )
            }
        </main>
    )
}

export default Confirmations;