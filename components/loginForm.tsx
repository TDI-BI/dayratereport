"use client"
import {login} from '@/actions'
import { useFormState } from 'react-dom'

const LoginForm = () => {
    const [state,formAction] = useFormState<any, FormData>(login, undefined);
    return (
        <form action={formAction}>
            <h1 className='loginfeild'>USERNAME: <input className='shipInput' name='username' type='text'/> </h1>
            <h1 className='loginfeild'>PASSWORD: <input className='shipInput' name='password' type='password'/> </h1>
            <button> <p className='loginBtn'>login</p> </button>
            {state?.error && <p>{state.error}</p>}
        </form>
    )
}

export default LoginForm