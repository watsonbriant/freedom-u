'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSignIn = () => {
    setIsLoading(true);
    // Redirect to OAuth initiation endpoint
    window.location.href = '/api/auth/ministryplatform';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-4">
      <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center py-32">
        <div className="w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Image 
                src="/Logo.jpg" 
                alt="FreedomU Logo" 
                width={40} 
                height={40}
                className="rounded"
              />
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                FreedomU
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <p className="text-sm text-center text-zinc-600 dark:text-zinc-400 mb-4">
              Sign in with your MinistryPlatform credentials
            </p>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-black dark:bg-zinc-50 text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In with MinistryPlatform'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

