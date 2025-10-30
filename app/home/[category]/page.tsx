'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from "next/image";
import EmailModal from '@/components/EmailModal';
import EmailPill from '@/components/EmailPill';

interface Course {
  uuid: string;
  category: string;
  course_name: string;
  course_description: string;
  seq_order: number;
}

export default function CategoryDetailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const params = useParams();
  const router = useRouter();
  const categoryUuid = params.category as string;

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
    // Fetch email on mount
    fetch('/api/get-email')
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setEmail(data.email);
        }
      })
      .catch(() => {
        // Silent fail - email is optional
      });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Fetch courses for this category via uuid
      fetch(`/api/courses?category_uuid=${encodeURIComponent(categoryUuid)}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.data) {
            setCourses(result.data);
            // Auto-redirect to first course if courses exist
            if (result.data.length > 0) {
              router.replace(`/${categoryUuid}/${result.data[0].uuid}`);
            }
          }
          if (result.categoryName) {
            setCategoryName(result.categoryName);
          }
        })
        .catch((error) => {
          console.error('Error fetching courses:', error);
        });
    }
  }, [isLoading, categoryUuid, router]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleLogoClick = () => {
    router.push('/home');
  };

  const handleEmailSubmit = async (emailValue: string) => {
    const response = await fetch('/api/register-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: emailValue }),
    });

    if (response.ok) {
      setEmail(emailValue);
    } else {
      throw new Error('Failed to register email');
    }
  };

  const handleEmailChange = () => {
    setShowEmailModal(true);
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
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
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
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/home')}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
              >
                Home
              </button>
              <EmailPill email={email} onEmailChange={handleEmailChange} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex w-full gap-6">
          {/* Left Sidebar - Courses List */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                  {categoryName}
                </h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {courses.length > 0 ? (
                  <nav className="p-2">
                    {courses.map((course) => (
                      <button
                        key={course.uuid}
                        onClick={() => router.push(`/${categoryUuid}/${course.uuid}`)}
                        className={`w-full text-left px-4 py-3 rounded-md mb-2 transition-colors ${
                          selectedCourse?.uuid === course.uuid
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50 font-medium'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-700 dark:text-zinc-400'
                        }`}
                      >
                        <div className="font-medium">{course.course_name}</div>
                      </button>
                    ))}
                  </nav>
                ) : (
                  <div className="p-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                      No courses available yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-center h-full p-8">
                <p className="text-zinc-500 dark:text-zinc-400 text-center">
                  {courses.length > 0 
                    ? 'Select a course from the sidebar to view details'
                    : 'No courses available in this category'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        initialEmail={email}
      />
    </div>
  );
}

