import { SessionOptions } from 'iron-session';

export interface sessionData {
  upid?: string; // Just store the user's Paycor ID
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
