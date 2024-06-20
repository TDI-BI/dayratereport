"use client"
import { mkAccount } from '@/actions'
import { useFormState } from 'react-dom'
import { useEffect } from 'react'
import { flashDiv } from '@/utils/flashDiv'

const MkaccountForm = () => {
    const [state,formAction] = useFormState<any, FormData>(mkAccount, undefined);

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
                    <input className='formInput' name='firstname' type='text' placeholder='first name'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='lastname' type='text' placeholder='last name'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='nusername' type='text' placeholder='username'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='email' type='text' placeholder='email'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='password1' type='password' placeholder='password'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='password2' type='password' placeholder='repeat password'/> 
                </h1>
                <h1 className='formLine'>
                    <button><p className='formBtn'>register</p></button>
                </h1>


                <h1 className='formLine'>
                    <div className='errMessage' id='error'> {
                        state?.error && <p>{state.error}</p>
                    } </div>
                </h1>
            </form>
        </div>
    )
}



export default MkaccountForm