import Link from "next/link";
import LogoutForm from './logoutForm'
import {getSession }from '@/actions'

const Navbar = async () => {
    const session = await getSession()

    //console.log(session)  
    //console.log(session.isLoggedIn)
    if(!session.isLoggedIn) return(
        <div className='padding'/>
    );
    return(    
    <nav className='head'>
        {session.isLoggedIn && <LogoutForm/>}        
        {!session.isLoggedIn && <Link href='/login' ><div className='headBtn'>login</div></Link>}

        <Link href={session.isLoggedIn? '/daysworked' : '/login'} >
        <div className='headBtn'>Days Worked</div>
        </Link>

        <Link href={session.isLoggedIn? '/info' : '/login'}>
        <div className='headBtn'>info</div>
        </Link>
    </nav>
    )
}

export default Navbar;