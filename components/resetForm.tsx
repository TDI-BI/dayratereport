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
        <div className='tblWrapper'>
            <form action={formAction}>
                <input className='hidethis' name='acc' type='password' value={oldHash}/>

                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='password1' type='password' placeholder='new password'/>
                </h1>
                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='password2' type='password' placeholder='repeat password'/>
                </h1>

                <h1 className='formLine'>
                    <button> <p className='formBtn'>reset password</p> </button>
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

export default ResetForm