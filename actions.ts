"use server";
import {sessionOptions, sessionData, defaultSession} from "@/lib"
import {getIronSession} from 'iron-session'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import { GET } from "./app/api/getperiodinf/route";

let username='chris'//'eygwa'
let password='1234'
let email='dayratereportdonotrespond@gmail.com'
const bcrypt = require('bcrypt')


function hashPass(unHashPass:string){
    return bcrypt.hash(unHashPass, 10).then(function(hash:string){
        return hash;
    });
}
function isSamePass(unHashPass:string, hashPass:string){
    return bcrypt.compare(unHashPass, hashPass).then(function(result:boolean){
        return(result)
    })
}

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
    const link = 'http://localhost:3000/api/login?&password='+formPassword+'&username='+formUsername;
    console.log(link);
    const response = await fetch(link);
    const res = await response.json();
    const dbAcc= res.resp[0];  

    console.log(hashPass(formPassword))
    if(dbAcc.password!==formPassword){
        //console.log(formPassword + " " + password);
        return {error: 'wrong creds'}
    }
    console.log();  
    
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