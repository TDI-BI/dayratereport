import LoginForm from '@/components/loginForm'
import { getSession } from '@/actions'
import { redirect } from 'next/navigation'
const logpage = async () =>{
    const session = await getSession();
    return(
        <main className="flex min-h-screen flex-col items-center"> 
            {session.isLoggedIn ? redirect('/travellog') : <LoginForm/>}
        </main>
    )
}

export default logpage