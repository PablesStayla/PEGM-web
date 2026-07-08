'use server';

import { redirect } from 'next/navigation';
import { getSiteUrl } from '@/lib/site-url';
import { createClient } from '@/lib/supabase/server';

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  const supabase = await createClient();
  const redirectUrl = `${getSiteUrl()}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
