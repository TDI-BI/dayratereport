"use client"
import {login} from '@/actions'
import { useFormState } from 'react-dom'
import {useEffect} from 'react';
import { flashDiv } from '@/utils/flashDiv';
import Link from 'next/link'
import Image from 'next/image';

//icons
import person from '@/rsrsc/ionicons.designerpack/person-circle-outline.svg'
import lock from '@/rsrsc/ionicons.designerpack/lock-closed-outline.svg'


const LoginForm = () => {
    const [state,formAction] = useFormState<any, FormData>(login, undefined);
    
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
                            src={person}
                            alt='icon'
                        />
                    </p>
                    <input className='hoverLn hoverLnF formInput' name='username' type='text' placeholder='username'/> 
                </h1>
                <h1 className='formLine'>
                    <p className='formIcon'>
                        <Image
                            priority
                            src={lock}
                            alt='icon'
                        />
                    </p>
                    <input className='hoverLn hoverLnF formInput ' name='password' type='password' placeholder='password'/>
                </h1>
                <h1 className='formLine'>
                    <button> <p className='w-[140px] btnh btn hoverbg'>login</p> </button>
                    <Link href='login/mkaccount'> <p className='w-[140px] btnh btn hoverbg'> register </p> </Link>
                </h1>
                
                <h1 className='formLine'><div className='errMessage' id='error'> {
                    state?.error && <p>{state.error}</p>
                } </div></h1>
                
                <h1 className='formLine'><Link href='login/rcvaccount'> <p className='w-[280px] btnh btn hoverbg'> recover account </p> </Link></h1>
            </form>
        </div>
    )
}

export default LoginForm