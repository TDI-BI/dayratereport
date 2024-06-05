"use client"
import {recover} from '@/actions'
import { useFormState } from 'react-dom'
import Link from 'next/link'

const RecoverForm = () => {
    const [state,formAction] = useFormState<any, FormData>(recover, undefined);
    return (
        <form action={formAction}>
            <h1 className='loginfeild'>EMAIL: <input className='shipInput' name='email' type='text'/> </h1>
            <button> <p className='loginBtn'>recover</p> </button>
            <Link href='login'> <p className='loginBtn'> back </p> </Link>
            {state?.error && <p>{state.error}</p>}
        </form>
    )
}

export default RecoverForm