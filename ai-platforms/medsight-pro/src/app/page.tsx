import { redirect } from 'next/navigation';

export default async function RootPage() {
  // Redirect to login page as default
  redirect('/login');
} 