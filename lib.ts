import { SessionOptions } from 'iron-session';

export interface sessionData {
  email?: string; // store of users email (pkey)
  isLoggedIn?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_KEY!,
  cookieName: 'session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    path: '/',
  },
};

export const defaultSession: sessionData = {
  isLoggedIn: false,
};
