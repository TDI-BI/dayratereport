import {SessionOptions } from "iron-session";

export interface sessionData{ // init
    userId?:string;
    username?:string;
    userEmail?:string;
    isLoggedIn?:boolean;
    isAdmin?:boolean;
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