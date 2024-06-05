import RecoverForm from '@/components/recoverForm'
import { getSession } from '@/actions'
import { redirect } from 'next/navigation'
const rcvaccountPage = async () =>{
    const session = await getSession();
    return(
        <main className="flex min-h-screen flex-col items-center"> 
            {/* we are gonna convert this to a form at some point i thinkge */}
            <RecoverForm/>
            
        </main>
    )
}

export default rcvaccountPage