import {SessionOptions } from "iron-session";

export interface sessionData{ // init
    userId?:string;
    username?:string;
    userEmail?:string;
    isLoggedIn?:boolean;
    isAdmin?:boolean;
    isDomestic?:boolean;
}

export const sessionOptions: SessionOptions ={
    password: process.env.SECRET_KEY!,
    cookieName: 'session',
    cookieOptions:{
        httpOnly:true,
        secure: false,//process.env.NODE_ENV!=='development',//shuold flag false in dev mode bc its gonna be http
        sameSite:'lax',
        path:'/'
    }
}

export const defaultSession: sessionData = {
    isLoggedIn:false
}
