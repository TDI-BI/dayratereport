'use server';
import {getIronSession} from 'iron-session';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {fetchBoth} from '@/utils/fetchboth';

import {sessionOptions, sessionData, defaultSession} from '@/lib';

const bcrypt = require('bcrypt');

export const getSession = async () => {
  const session = await getIronSession<sessionData>(
    await cookies(),
    sessionOptions
  );

  return session;
};

export const login = async (
  prevState: { error: undefined | string },
  formData: FormData
) => {
  const session = await getSession();
  const formUsername = formData.get('username') as string;
  const formPassword = formData.get('password') as string;

  // Validate input
  if (!formUsername || !formPassword) {
    return {error: 'username and password required'};
  }

  // Query API
  const response = await fetchBoth(
    `/api/account/login?username=${formUsername}`
  );
  const res = await response.json();
  if (res.error) {
    return {error: 'account not found'};
  }

  const dbAcc = res.resp[0];

  // Check if account is active
  if (!dbAcc.isActive) {
    return {error: 'account inactive'};
  }

  try {
    const auth = await bcrypt.compare(formPassword, dbAcc.password);
    if (!auth) {
      return {error: 'incorrect password'};
    }
  } catch (error) {
    return {error: 'authentication failed'};
  }

  // Create session
  session.email = dbAcc.email;
  session.isLoggedIn = true;
  await session.save();

  console.log(dbAcc);

  if (dbAcc.isAdmin) {
    redirect('/admin');
  } else {
    redirect('/daysworked');
  }
};

export const logout = async () => {
  const session = await getSession();
  session.destroy();
  redirect('/');
};

export const mkAccount = async (
  prevState: { error: undefined | string },
  formData: FormData
) => {
  // Get form data
  const formUsername = formData.get('nusername') as string;
  const formPassword = formData.get('password1') as string;
  const formPasswordRepeat = formData.get('password2') as string;
  const formToken = formData.get('token') as string;

  // Validation
  if (formPassword !== formPasswordRepeat) {
    return {error: "passwords don't match"};
  }

  if (
    !formUsername ||
    !formPassword
  ) {
    return {error: 'all fields required'};
  }

  if (formUsername.includes(' ')) {
    return {error: 'no spaces allowed'};
  }

  // Create hashed password
  const hashword = await bcrypt.hash(formPassword, 10);

  // Query API with new schema fields
  const response = await fetchBoth(
    `/api/account/create?username=${formUsername}&password=${hashword}&token=${formToken}`
  );
  const res = await response.json();

  if (res.error) {
    return res;
  }

  // Log in the new user - just store upid
  const session = await getSession();
  session.email = res.email;
  session.isLoggedIn = true;
  await session.save();

  redirect('../../');
};

export const recover = async (
  prevState: { error: undefined | string },
  formData: FormData
) => {
  const formEmail = formData.get('email') as string;

  if (!formEmail) {
    return {error: 'email required'};
  }

  // Query API
  const response = await fetchBoth(`/api/account/recover?email=${formEmail}`);

  try {
    const res = await response.json();
    if (res.resp === 'email sent') {
      return {error: 'recovery instructions sent'};
    }
    return {error: 'account not found'};
  } catch (e) {
    return {error: 'account not found'};
  }
};

export const resetPassword = async (
  prevState: { error: undefined | string },
  formData: FormData
) => {
  const resetToken = formData.get('token') as string; // Changed from "acc"
  const formPassword = formData.get('password1') as string;
  const formPasswordRepeat = formData.get('password2') as string;

  if (!formPassword || !formPasswordRepeat) {
    return {error: 'all fields required'};
  }

  if (formPassword !== formPasswordRepeat) {
    return {error: 'passwords do not match'};
  }

  // Encrypt new password
  const hashword = await bcrypt.hash(formPassword, 10);

  // Query API with token instead of oldhash
  const response = await fetchBoth(
    `/api/account/reset-password?password=${hashword}&token=${resetToken}`
  );
  const res = await response.json();

  if (res.error) {
    return res;
  }

  redirect('../../');
};
