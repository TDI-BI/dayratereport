"use client"
import {recover} from '@/actions'
import { useFormState } from 'react-dom'
import Link from 'next/link'
import { useEffect } from 'react'
import { flashDiv } from '@/utils/flashDiv'

const RecoverForm = () => {
    const [state,formAction] = useFormState<any, FormData>(recover, undefined);

    useEffect(()=>{
        if(state?.error){ 
            flashDiv(document.getElementById('error') as HTMLElement)
        }
    })


    return (
        <form action={formAction}>
            <h1 className='loginfeild'>EMAIL: <input className='shipInput' name='email' type='text'/> </h1>
            <button> <p className='loginBtn'>recover</p> </button>
            <Link href='../login'> <p className='loginBtn'> back </p> </Link>
            <div className='errMessage' id='error'> {
                state?.error && <p>{state.error}</p>
            } </div>
        </form>
    )
}

export default RecoverForm