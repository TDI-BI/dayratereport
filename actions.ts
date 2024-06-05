"use server";
import {sessionOptions, sessionData, defaultSession} from "@/lib"
import {getIronSession} from 'iron-session'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import { GET } from "./app/api/getperiodinf/route"; 
import { getPort } from '@/utils/getPort';
const bcrypt = require('bcrypt')    

let username='chris'//'eygwa'
let password='1234'
let email='dayratereportdonotrespond@gmail.com'
let por = getPort()


export const getSession = async()=>{
    const session = await getIronSession<sessionData>(cookies(), sessionOptions)
    return session;

    if(!session.isLoggedIn){
        session.isLoggedIn=defaultSession.isLoggedIn; // defualts us to not being logged in
    }

}
export const login = async(
    prevState:{error:undefined | string}, 
    formData:FormData
)=>{
    const session = await getSession()
    const formUsername = formData.get('username') as string
    const formPassword = formData.get('password') as string
    
    //get user in db
    const link = 'http://'+por+'/api/login?&username='+formUsername;
    //console.log(link);
    const response = await fetch(link);
    const res = await response.json();
    const dbAcc= res.resp[0];
    
    try{
        const auth= await bcrypt.compare(formPassword, dbAcc.password)
        if(!auth){
            //console.log(formPassword + " " + password);
            return {error: 'wrong password for account'}
        }
    }
    catch(error){ 
        return { error: 'no account for that username'}
    }
    
    session.userId= dbAcc.uid
    session.username= dbAcc.username
    session.userEmail= dbAcc.email
    session.isLoggedIn= true
    await session.save();
    
    redirect("/")
}
export const logout = async()=>{
    const session = await getSession()
    session.destroy()
    redirect("/")
}

export const mkAccount = async(
    prevState:{error:undefined | string}, 
    formData:FormData
)=>{
    const formFirstname = formData.get('firstname') as string
    const formLastname = formData.get('lastname') as string
    const formUsername = formData.get('nusername') as string
    const formEmail = formData.get('email') as string
    const formPassword = formData.get('password1') as string
    const formPasswordRepeat = formData.get('password2') as string
    if(formPassword!==formPasswordRepeat) return { error : 'passwords do not match' }

    const hashword = await bcrypt.hash(formPassword, 10)
    if(
        formFirstname=='' || 
        formLastname=='' || 
        formEmail=='' || 
        formUsername=='' || 
        formPassword==''
    ){
        return { error: 'empty fields' }
    }
    const fullname=formFirstname+'/'+formLastname;
    const link = 'http://'+por+'/api/mkaccount?username='+formUsername+'&password='+hashword+'&email='+formEmail+'&fullname='+fullname;
    const response = await fetch(link);
    const res = await response.json();
    try{
        if(res.error) return res // catch error in account creation
    }
    catch(error){
    }
    redirect("../../")// -> uncomment this out when im done toying with the form
}

export const recover = async (
    prevState:{error:undefined | string}, 
    formData:FormData
)=>{
    //send account recovery email
    const formEmail = formData.get('email') as string;
    //send email
}

export const resetPassword = async(
    prevState:{error:undefined | string}, 
    formData:FormData
)=>{
    const oldhash = formData.get('acc') as string
    const formPassword = formData.get('password1') as string
    const formPasswordRepeat = formData.get('password2') as string

    if(formPassword!==formPasswordRepeat) return { error : 'passwords do not match' }

    const hashword = await bcrypt.hash(formPassword, 10)
    console.log(hashword, oldhash);


    const link = 'http://'+por+'/api/resetpassword?password='+hashword+'&oldhash='+oldhash;
    const response = await fetch(link);
    const res = await response.json();
    try{
        if(res.error) return res // catch error in account creation
    }
    catch(error){
    }
    //redirect("../../")// -> uncomment this out when im done toying with the form
}