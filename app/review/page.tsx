"use client"; // this is a client componnent (?) idk why i just need this to run things
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {

    const [dataResponse, setdataResponse] = useState([]);
    useEffect(() => {
      async function getPageData(){
        const apiUrlEndpoint = 'http://localhost:3000/api/hello'
        const response = await fetch(apiUrlEndpoint);
        const res = await response.json();
        console.log(res.resp);// -> desnt work idk why
        setdataResponse(res.resp);
      }
      getPageData();
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center">

            <div>{ // throws crazy errors but its a working example of pulling from the server at least
                dataResponse.map((items) => <div> {items.msg} </div>)
            }</div>
            <p>COMFIRM INFORMATION</p>

            <div className='tblFoot'>
                <Link href='../'><div className='tblFootBtn'> confirm and submit </div></Link>
                <Link href='../'><div className='tblFootBtn'> back </div></Link>
            </div>
        </main>
    )
}