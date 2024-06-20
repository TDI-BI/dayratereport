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
        <form action={formAction}>
            <h1 className='loginfeild'>USERNAME: <input className='shipInput' name='username' type='text'/> </h1>
            <h1 className='loginfeild'>PASSWORD: <input className='shipInput' name='password' type='password'/> </h1>
            <button> <p className='loginBtn'>login</p> </button>
            <Link href='login/mkaccount'> <p className='loginBtn'> make account </p> </Link>
            <Link href='login/rcvaccount'> <p className='loginBtn'> recover account </p> </Link>
            <div className='errMessage' id='error'> {
                state?.error && <p>{state.error}</p>
            } </div>
        </form>
    )
}

export default LoginForm