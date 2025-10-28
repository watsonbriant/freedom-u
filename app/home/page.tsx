'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

interface Category {
  uuid: string;
  category: string;
  category_description: string;
  category_order: number;
  counts?: {
    videos: number;
    documents: number;
    texts: number;
    quizzes: number;
  };
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/check-auth')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      // Fetch categories
      fetch('/api/categories')
        .then((res) => res.json())
        .then((result) => {
          if (result.data) {
            setCategories(result.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching categories:', error);
        });
    }
  }, [isLoading]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image 
                src="/Logo.jpg" 
                alt="FreedomU Logo" 
                width={32} 
                height={32}
                className="rounded"
              />
              <h1 className="text-2xl font-bold text-black dark:text-zinc-50">
                FreedomU
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black dark:text-zinc-50">
              FreedomU
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2">
              A Freedom House training library.
            </p>
          </div>

          {categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                // Convert category name to URL-friendly format
                const categorySlug = category.category.toLowerCase().replace(/\s+/g, '-');
                return (
                <div
                  key={category.category}
                  onClick={() => router.push(`/${categorySlug}`)}
                  className="flex flex-col bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* Top Area - Title */}
                  <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                      {category.category}
                    </h3>
                  </div>

                  {/* Middle Area - Description */}
                  <div className="px-6 py-4 space-y-3">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                      {category.category_description}
                    </p>
                    
                    {/* Item Counts */}
                    {category.counts && (
                      <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {category.counts.videos > 0 && (
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                            {category.counts.videos} {category.counts.videos === 1 ? 'video' : 'videos'}
                          </span>
                        )}
                        {category.counts.documents > 0 && (
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                            {category.counts.documents} {category.counts.documents === 1 ? 'document' : 'documents'}
                          </span>
                        )}
                        {category.counts.quizzes > 0 && (
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                            {category.counts.quizzes} {category.counts.quizzes === 1 ? 'quiz' : 'quizzes'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {categories.length === 0 && (
            <div className="mt-12 p-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 text-center">
                No categories available yet.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

