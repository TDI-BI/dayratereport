import {getSession }from '@/actions'
import { redirect } from 'next/navigation'
//THIS PAGE JUST EXISTS TO REDIRECT US TO A DIFFERENT PAGE!
const home = async () =>{
    const session = await getSession();
    
    return(
        <main className="flex min-h-screen flex-col items-center"> 
            {session.isLoggedIn ? redirect('/timesheet'):redirect('/login')}
        </main>
    ) 
}

export default home