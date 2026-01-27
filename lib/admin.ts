import { cookies } from 'next/headers';

// Shared function to get allowed admin emails
// This matches the logic in components/EmailPill.tsx
export function getAllowedAdminEmails(): string[] {
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_ADMIN_EMAILS) {
    return process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
  }
  // Default allowed emails - update this list as needed
  return [
    'jmcalister@freedomhouse.cc',
    'esawdon@freedomhouse.cc',
    'jharmon@freedomhouse.cc',
    'watson.briant@gmail.com',
    'tsteinmann@freedomhouse.cc',
    'jprice@freedomhouse.cc',
  ];
}

// Helper function to check admin authentication (both cookie and email)
export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('freedomu_admin_session');
  const emailCookie = cookieStore.get('freedomu_email');
  const userEmail = emailCookie?.value?.toLowerCase().trim();

  // Check both session cookie and email authorization
  if (session?.value === 'authenticated' && userEmail) {
    const allowedEmails = getAllowedAdminEmails();
    return allowedEmails.includes(userEmail);
  }

  return false;
}
