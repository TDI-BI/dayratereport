import { getSession} from '@/actions'
import { redirect } from 'next/navigation';

const profile = async () => {
    const session = await getSession();
    if(!session.isLoggedIn){
        redirect('/login')
    }
    let name = session.userId!.split('/')
    return(
        <main className="flex min-h-screen flex-col items-center"> 
                <p> <strong> THANK YOU {name[0] + ' ' + name[1]}</strong> </p>
                <p> your time sheet has been submitted! </p>
                <p> we are preparing your pdf, please do not close the website </p>
                <p> until that has been downloaded </p>
                <p> please do not submit a travel log again until next pay period </p>
        </main>
    ) 
}

export default profile;