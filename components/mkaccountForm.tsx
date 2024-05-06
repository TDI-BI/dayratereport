"use client"
import { mkAccount } from '@/actions'
import { useFormState } from 'react-dom'

const MkaccountForm = () => {
    const [state,formAction] = useFormState<any, FormData>(mkAccount, undefined);
    return (
        <form action={formAction}>
            <h1 className='loginfeild'>FIRST NAME: <input className='shipInput' name='firstname' type='text'/> </h1>
            <h1 className='loginfeild'>LAST NAME: <input className='shipInput' name='lastname' type='text'/> </h1>
            <h1 className='loginfeild'>USERNAME: <input className='shipInput' name='nusername' type='text'/> </h1>
            <h1 className='loginfeild'>EMAIL: <input className='shipInput' name='email' type='text'/> </h1>
            <h1 className='loginfeild'>PASSWORD: <input className='shipInput' name='password1' type='password'/> </h1>
            <h1 className='loginfeild'>REPEAT PASSWORD: <input className='shipInput' name='password2' type='password'/> </h1>
            <button><p className='loginBtn'>make account</p></button>
            {state?.error && <p>{state.error}</p>}
        </form>
    )
}



export default MkaccountForm