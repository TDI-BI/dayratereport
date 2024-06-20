"use client"
import {login} from '@/actions'
import { useFormState } from 'react-dom'
import {useEffect} from 'react';
import { flashDiv } from '@/utils/flashDiv';
import Link from 'next/link'

const LoginForm = () => {
    const [state,formAction] = useFormState<any, FormData>(login, undefined);
    
    useEffect(()=>{
        if(state?.error){ 
            flashDiv(document.getElementById('error') as HTMLElement)
        }
    })
    return (
        <div className='tblWrapper'>
            <form action={formAction}>
                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='username' type='text' placeholder='username'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='password' type='password' placeholder='password'/>
                </h1>
                <h1 className='formLine'>
                    <button> <p className='formBtn'>login</p> </button>
                    <Link href='login/mkaccount'> <p className='formBtn'> register </p> </Link>
                </h1>
                
                <h1 className='formLine'><div className='errMessage' id='error'> {
                    state?.error && <p>{state.error}</p>
                } </div></h1>
                
                <h1 className='formLine'><Link href='login/rcvaccount'> <p className='formBtn'> recover account </p> </Link></h1>
            </form>
        </div>
    )
}

export default LoginForm