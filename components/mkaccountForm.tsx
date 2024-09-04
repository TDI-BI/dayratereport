"use client"
import { mkAccount } from '@/actions'
import { useFormState } from 'react-dom'
import { useEffect } from 'react'
import { flashDiv } from '@/utils/flashDiv'
import Image from 'next/image';

//icons
import person from '@/rsrsc/ionicons.designerpack/person-circle-outline.svg'
import lock from '@/rsrsc/ionicons.designerpack/lock-closed-outline.svg'
import mail from '@/rsrsc/ionicons.designerpack/mail-open-outline.svg'
import names from '@/rsrsc/ionicons.designerpack/body-outline.svg'

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
                    <p className='formIcon'>
                        <Image
                            priority
                            src={names}
                            alt='icon'
                        />
                    </p>
                    <input className='hoverLn hoverLnF formInput' name='firstname' type='text' placeholder='first name'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formIcon'>
                        <Image
                            priority
                            src={names}
                            alt='icon'
                        />
                    </p>
                    <input className='hoverLn hoverLnF formInput' name='lastname' type='text' placeholder='last name'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formIcon'>
                        <Image
                            priority
                            src={person}
                            alt='icon'
                        />
                    </p>
                    <input className='hoverLn hoverLnF formInput' name='nusername' type='text' placeholder='username'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formIcon'>
                        <Image
                            priority
                            src={mail}
                            alt='icon'
                        />
                    </p>
                    <input className='hoverLn hoverLnF formInput' name='email' type='text' placeholder='email'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formIcon'>
                        <Image
                            priority
                            src={lock}
                            alt='icon'
                        />
                    </p>
                    <input className='hoverLn hoverLnF formInput' name='password1' type='password' placeholder='password'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formIcon'>
                        <Image
                            priority
                            src={lock}
                            alt='icon'
                        />
                    </p>
                    <input className='hoverLn hoverLnF formInput' name='password2' type='password' placeholder='repeat password'/> 
                </h1>
                <h1 className='formLine'>
                    <button><p className='w-[280px] btnh btn hoverbg'>register</p></button>
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