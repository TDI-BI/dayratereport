
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
                <div id="bweh">
                    <p> username: {session.username}</p>
                    <p> email: {session.userEmail} </p>
                    <p> username: {name[0] + " " + name[1]} </p>
                </div>
                <p className='infoText'> 
                    <br></br>
                    with urgent issues email dayratereportdonotrespond@gmail.com with the subject URGENT: 
                </p>
 
                <Link href='https://forms.gle/EKyxpDDTSZknZYpe8'>
                    <p className='loginBtn'>
                        feedback form
                    </p>
                    
                </Link>
        </main>
    ) 
}

export default profile;