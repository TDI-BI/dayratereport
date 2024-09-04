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
        {!session.isLoggedIn && <Link href='/login' ><div className='w-[calc(100vw/3)] h-[50px] line-h-[50px] btn hoverbg'>login</div></Link>}

        <Link href={session.isLoggedIn? '/daysworked' : '/login'} >
            <button className='w-[calc(100vw/3)] h-[50px] line-h-[50px] btn hoverbg'>Days Worked</button>
        </Link>

        <Link href={session.isLoggedIn? '/info' : '/login'}>
            <button className='w-[calc(100vw/3)] h-[50px] line-h-[50px] btn hoverbg'>info</button>
        </Link>
    </nav>
    )
}

export default Navbar;