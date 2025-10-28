'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from "next/image";

interface Course {
  course_name: string;
  course_description: string;
  seq_order: number;
}

export default function CategoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const router = useRouter();
  const params = useParams();
  const category = params?.category as string;

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
    if (!isLoading && category) {
      // Decode category name (replace hyphens with spaces and capitalize)
      const decodedName = category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setCategoryName(decodedName);

      // Fetch courses for this category using the decoded name
      fetch(`/api/courses/${encodeURIComponent(decodedName)}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.data) {
            setCourses(result.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching courses:', error);
        });
    }
  }, [isLoading, category]);

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
              <button
                onClick={() => router.push('/home')}
                className="text-2xl font-bold text-black dark:text-zinc-50 hover:opacity-70 transition-opacity"
              >
                FreedomU
              </button>
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

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-6 py-8 overflow-y-auto">
          <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-6">
            {categoryName}
          </h2>
          <nav className="space-y-2">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course.course_name}
                  className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <h3 className="font-semibold text-black dark:text-zinc-50 mb-2">
                    {course.course_name}
                  </h3>
                  {course.course_description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {course.course_description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No courses available.
              </p>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-4">
              {categoryName}
            </h1>
            <div className="mt-8 p-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400">
                Select a course from the sidebar to begin.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

