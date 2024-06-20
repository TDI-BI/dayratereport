"use client"
import { resetPassword } from '@/actions'
import { useFormState } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { flashDiv } from '@/utils/flashDiv'
import Link from 'next/link'

const ResetForm = () => {
    const searchParams = useSearchParams();
    const oldHash = searchParams.get('acc') as string;
    const [state,formAction] = useFormState<any, FormData>(resetPassword, undefined);

    useEffect(()=>{
        if(state?.error){ 
            flashDiv(document.getElementById('error') as HTMLElement)
        }
    })

    return (
        <form action={formAction}>
            <input className='hidethis' name='acc' type='password' value={oldHash}/>
            <h1 className='loginfeild'>NEW PASSWORD: <input className='shipInput' name='password1' type='password'/> </h1>
            <h1 className='loginfeild'>REPEAT PASSWORD: <input className='shipInput' name='password2' type='password'/> </h1>
            <button> <p className='loginBtn'>reset password</p> </button>
            <div className='errMessage' id='error'> {
                state?.error && <p>{state.error}</p>
            } </div>
        </form>
    )
}

export default ResetForm