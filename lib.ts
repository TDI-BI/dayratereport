import {SessionOptions } from "iron-session";

export interface sessionData{
    userId?:string;
    username?:string;
    userEmail?:string;
    isLoggedIn?:boolean;
}

export const sessionOptions: SessionOptions ={
    password: process.env.SECRET_KEY!,
    cookieName: 'session',
    cookieOptions:{
        httpOnly:true,
        secure: false//process.env.NODE_ENV === "production"
    }
}

export const defaultSession: sessionData = {
    isLoggedIn:false
}