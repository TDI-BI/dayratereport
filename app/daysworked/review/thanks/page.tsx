import { getSession} from '@/actions'
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
                <p> please do not close the website until your field days worked report</p>
                <p> until that has been downloaded. this will happen automatically. </p>
                <p> you are only required to submit one report per pay period </p>
                <p> you may resubmit if you find any issues within your report </p>
                <Link href='../../../'><div className='tblFootBtn'>home</div></Link>
        </main>
    ) 
}

export default profile;