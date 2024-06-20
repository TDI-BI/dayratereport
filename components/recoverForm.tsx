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
        <div className='tblWrapper'>
            <form action={formAction}>

                <h1 className='formLine'>
                    <p className='formicon'>icon</p>
                    <input className='formInput' name='email' type='text' placeholder='email'/>
                </h1>

                <h1 className='formLine'>
                    <button> <p className='formBtn'>recover</p> </button>
                    <Link href='../login'> <p className='formBtn'> back </p> </Link>
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

export default RecoverForm