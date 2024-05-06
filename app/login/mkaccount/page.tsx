import MkaccountForm from '@/components/mkaccountForm'
import { getSession } from '@/actions'
import { redirect } from 'next/navigation'
const mkaccountPage = async () =>{
    const session = await getSession();
    return(
        <main className="flex min-h-screen flex-col items-center"> 
            {/* we are gonna convert this to a form at some point i thinkge */}
            <MkaccountForm/>
            
        </main>
    )
}

export default mkaccountPage