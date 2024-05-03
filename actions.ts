"use server";
import {sessionOptions, sessionData, defaultSession} from "@/lib"
import {getIronSession} from 'iron-session'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import { GET } from "./app/api/getperiodinf/route"; 
const bcrypt = require('bcrypt')    

let username='chris'//'eygwa'
let password='1234'
let email='dayratereportdonotrespond@gmail.com'


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
    const link = 'http://localhost:3000/api/login?&username='+formUsername;
    //console.log(link);
    const response = await fetch(link);
    const res = await response.json();
    const dbAcc= res.resp[0];  
    //const hashed = await bcrypt.hash(formPassword, 10) -> manually hashing password rn
    //console.log(hashed)   
    
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

//todo fix this later
export const changeUsername = async (formData:FormData)=>{
    const session = await getSession();
    const newUsername = formData.get('username') as string;
    username=newUsername; // change this with a db query at some point
    
    session.username = username;
    await session.save();
    revalidatePath('/profile')
}