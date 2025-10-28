import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get('freedomu_session');

  if (session?.value === 'authenticated') {
    redirect('/home');
  } else {
    redirect('/login');
  }
}
