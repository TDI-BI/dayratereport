
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
                    <form action={changeUsername}> {/*i need to learn how to use tailwind*/}
                        username: <input className='shipInput' type='text' name='username' placeholder={session.username}/>
                        <button> <div className='tblFootBtn'>update</div> </button>
                    </form> 
                    <p> email: {session.userEmail} </p>
                </div>
        </main>

    ) 
}

export default profile;