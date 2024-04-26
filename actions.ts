"use server";
import {sessionOptions, sessionData, defaultSession} from "@/lib"
import {getIronSession} from 'iron-session'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'

let username='chris'//'eygwa'
let password='1234'
let email='microwaveman@chrismail.com'




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
    //CHECK USER IN DB
    if(formUsername!==username || formPassword!=password){
        console.log(formPassword + " " + password);
        return {error: 'wrong creds'}
    }
    session.userId= '1'
    session.username= formUsername
    session.userEmail= email
    session.isLoggedIn= true
    await session.save();
    redirect("/")
    
}
export const logout = async()=>{
    const session = await getSession()
    session.destroy()
    redirect("/")
}

export const changeUsername = async (formData:FormData)=>{
    const session = await getSession();
    const newUsername = formData.get('username') as string;
    username=newUsername; // change this with a db query at some point
    
    session.username = username;
    await session.save();
    revalidatePath('/profile')
}