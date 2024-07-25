"use server";

import { getPort } from '@/utils/getPort'; const por = getPort();
import {getIronSession} from 'iron-session'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import { fetchBoth } from "./utils/fetchBoth";
import {
    sessionOptions, 
    sessionData, 
    defaultSession // legacy, dont want to delete
} 
from "@/lib"
const bcrypt = require('bcrypt')    


export const getSession = async()=>{
    const session = await getIronSession<sessionData>(cookies(), sessionOptions)
    return session;
}

//client friendly, doesnt require the passing of illegal data types
export const clientGetSession = async () => {
    const session = await getIronSession<sessionData>(cookies(), sessionOptions)
    return session.isLoggedIn ? true : false;
}

export const login = async(
    prevState:{error:undefined | string}, 
    formData:FormData
)=>{
    //get session information
    const session = await getSession()
    const formUsername = formData.get('username') as string
    const formPassword = formData.get('password') as string
    
    //query API
    const link = por+'/api/login?&username='+formUsername;
    const response = await fetchBoth(link);
    const res = await response.json();
    const dbAcc= res.resp[0];
    
    try{ // compare our password with the hash using bcrypt
        const auth= await bcrypt.compare(formPassword, dbAcc.password)
        if(!auth){
            //console.log(formPassword + " " + password);
            return {error: 'wrong password for account'}
        }
    }
    catch(error){ 
        return { error: 'no account for that username'}
    }
    //create cookie
    session.userId= dbAcc.uid
    session.username= dbAcc.username
    session.userEmail= dbAcc.email
    session.isLoggedIn= true
    session.isAdmin= dbAcc.isAdmin=='true';
    await session.save();
    
    redirect("/")
}
export const logout = async()=>{ // destroy loggedin cookie
    const session = await getSession()
    session.destroy()
    redirect("/")
}

export const mkAccount = async(
    prevState:{error:undefined | string}, 
    formData:FormData
)=>{
    //get form data
    const formFirstname = formData.get('firstname') as string
    const formLastname = formData.get('lastname') as string
    const formUsername = formData.get('nusername') as string
    const formEmail = formData.get('email') as string
    const formPassword = formData.get('password1') as string
    const formPasswordRepeat = formData.get('password2') as string
    if(formPassword!==formPasswordRepeat) return { error : 'passwords do not match' }

    //create hashed password
    const hashword = await bcrypt.hash(formPassword, 10)
    
    // block if anything is wrong
    if( 
        formFirstname=='' || 
        formLastname=='' || 
        formEmail=='' || 
        formUsername=='' || 
        formPassword==''
    ){
        return { error: 'empty fields' }
    }
    if(formUsername.includes(' ')) return  {error : 'username has spaces'}

    //query API
    const fullname=formFirstname+'/'+formLastname;
    const link = por+'/api/mkaccount?username='+formUsername+'&password='+hashword+'&email='+formEmail+'&fullname='+fullname;
    const response = await fetchBoth(link);
    const res = await response.json();
    try{
        if(res.error) return res // catch error in account creation
    }
    catch(error){
    }

    //no errors means we survived! log us in 
    const session = await getSession()
    session.userId= fullname
    session.username= formUsername
    session.userEmail= formEmail
    session.isLoggedIn= true
    session.isAdmin= false; // should always be false on account creation
    await session.save();
    redirect("../../")// -> uncomment this out when im done toying with the form
}

export const recover = async (
    prevState:{error:undefined | string}, 
    formData:FormData
)=>{
    //get form data
    const formEmail = formData.get('email') as string;

    //block if incomplete
    if(!formEmail) return {error: 'no email'}

    //query api
    const link = por+'/api/recover?&email='+formEmail;
    const response = await fetchBoth(link);
    
    // check query response
    try{
        const res = await response.json();
        const rmessage= res.resp;
        if(rmessage=='email sent') return {error: 'recovery instructions sent'}
    }
    catch(e){ return {error: 'account not found'}}
}

export const resetPassword = async(
    prevState:{error:undefined | string}, 
    formData:FormData
)=>{
    //get form data
    const oldhash = formData.get('acc') as string
    const formPassword = formData.get('password1') as string
    const formPasswordRepeat = formData.get('password2') as string

    if(formPassword == '' || formPasswordRepeat=='') return { error: 'empty fields' }

    //block if something is incorrect
    if(formPassword!==formPasswordRepeat) return { error : 'passwords do not match' }

    //encrypt new password
    const hashword = await bcrypt.hash(formPassword, 10)

    //query API
    const link = por+'/api/resetpassword?password='+hashword+'&oldhash='+oldhash;
    const response = await fetchBoth(link);
    const res = await response.json();

    //check results
    try{
        if(res.error) return res // catch error in account creation
    }
    catch(error){
    }
    redirect("../../")// -> uncomment this out when im done toying with the form
}