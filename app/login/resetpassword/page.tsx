import ResetForm from '@/components/resetForm';//U TOTALLY CAN FIND IT U LIAR U RENDER JUST FINE
import { getSession } from '@/actions'
import { redirect } from 'next/navigation'
const ResetPass = async () =>{
    const session = await getSession();
    return(
        <main className="flex min-h-screen flex-col items-center"> 
            {/* we are gonna convert this to a form at some point i thinkge */}
            <ResetForm/>
        </main>
    )
}

export default ResetPass