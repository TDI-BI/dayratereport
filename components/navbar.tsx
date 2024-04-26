import Link from "next/link";
import LogoutForm from './logoutForm'
import {getSession }from '@/actions'

const Navbar = async () => {
    const session = await getSession()

    console.log(session)    
    return(    
    <nav className='head'>
        {session.isLoggedIn && <LogoutForm/>}        
        {!session.isLoggedIn && <Link href='/login' ><div className='headBtn'>login</div></Link>}

        <Link href={session.isLoggedIn? '/timesheet' : '/login'} >
        <div className='headBtn'>timesheet</div>
        </Link>

        <Link href={session.isLoggedIn? '/profile' : '/login'}>
        <div className='headBtn'>profile</div>
        </Link>
    </nav>
    )
}

export default Navbar;