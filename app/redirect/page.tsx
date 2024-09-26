'use client'
import { redirect } from 'next/navigation'
import { useSearchParams } from "next/navigation";
//THIS PAGE JUST EXISTS TO REDIRECT US TO A DIFFERENT PAGE
const R = () =>{
    const sprms = useSearchParams();
    const prev= Number(sprms.get('prev'));
    return(
        <main className="flex min-h-screen flex-col items-center"> 
            we are refreshing your report, please be patient
            {redirect('/daysworked?prev='+prev)}
        </main>
    ) 
}
//this forces us to refresh our page with a button click
export default R