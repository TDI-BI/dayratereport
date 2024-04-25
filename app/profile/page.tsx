
import { getSession, changeUsername} from '@/actions'
import { redirect } from 'next/navigation';

const profile = async () => {
    const session = await getSession();
    if(!session.isLoggedIn){
        redirect('/login')
    }
    return(
        <main className="flex min-h-screen flex-col items-center"> 
                <div id="bweh">
                    <form action={changeUsername}> 
                        username: <input className='shipInput' type='text' name='username' placeholder={session.username}/>
                        <br></br><button> update </button>
                    </form> 
                    <p> email: {session.userEmail} </p>
                </div>
        </main>

    ) 
}

export default profile;