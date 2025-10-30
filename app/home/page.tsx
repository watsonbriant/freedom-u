'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import EmailModal from '@/components/EmailModal';
import EmailPill from '@/components/EmailPill';

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
    podcasts: number;
    externalLinks: number;
  };
}

interface Item {
  uuid: string;
  lp_identifier?: string;
}

interface Course {
  uuid: string;
  category: string;
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [email, setEmail] = useState<string>('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(true);
  const [lpCompletionStatus, setLpCompletionStatus] = useState<Record<string, boolean>>({});
  const [lpItems, setLpItems] = useState<Item[]>([]);
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
    // Check if user has an email set
    fetch('/api/get-email')
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setEmail(data.email);
        } else {
          // If no email is set, show the email modal
          setShowEmailModal(true);
        }
        setCheckingEmail(false);
      })
      .catch(() => {
        setCheckingEmail(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Fetch categories
      fetch('/api/categories')
        .then((res) => res.json())
        .then((result) => {
          if (result.data) {
            setCategories(result.data);
          }
          setCategoriesLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching categories:', error);
          setCategoriesLoading(false);
        });
    }
  }, [isLoading]);

  // Function to refresh LP completion status
  const refreshLpCompletion = () => {
    if (email) {
      fetch(`/api/lp/completion?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.data) {
            setLpCompletionStatus(result.data);
          }
        })
        .catch(() => {
          // Silent fail
        });
    }
  };

  // Fetch LP completion status and items for Leadership Pipeline category
  useEffect(() => {
    if (email) {
      // Fetch completion status
      refreshLpCompletion();

      // Find Leadership Pipeline category
      const lpCategory = categories.find(c => c.category === 'Leadership Pipeline');
      if (lpCategory) {
        // Fetch courses for Leadership Pipeline
        fetch(`/api/courses?category_uuid=${encodeURIComponent(lpCategory.uuid)}`)
          .then((res) => res.json())
          .then((result) => {
            if (result.data && result.data.length > 0) {
              // Fetch items for all courses
              return Promise.all(
                result.data.map((course: Course) =>
                  fetch(`/api/items?course_uuid=${encodeURIComponent(course.uuid)}`)
                    .then((res) => res.json())
                    .then((itemResult) => itemResult.data || [])
                    .catch(() => [])
                )
              );
            }
            return [];
          })
          .then((allItemsArrays: Item[][]) => {
            const allItems: Item[] = [];
            allItemsArrays.forEach(items => {
              allItems.push(...items);
            });
            setLpItems(allItems);
          })
          .catch(() => {
            // Silent fail
          });
      }
    }
  }, [email, categories]);

  // Listen for completion updates
  useEffect(() => {
    const handleCompletionUpdate = () => {
      refreshLpCompletion();
    };

    window.addEventListener('lp-completion-updated', handleCompletionUpdate);
    return () => {
      window.removeEventListener('lp-completion-updated', handleCompletionUpdate);
    };
  }, [email]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
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

  if (isLoading || checkingEmail) {
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
              onClick={() => router.push('/home')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => {
                // Calculate LP completion if this is Leadership Pipeline
                const isLeadershipPipeline = category.category === 'Leadership Pipeline';
                const lpItemsForCategory = isLeadershipPipeline ? lpItems.filter(item => 
                  item.lp_identifier && item.lp_identifier.trim() !== ''
                ) : [];
                const completedCount = lpItemsForCategory.filter(item =>
                  item.lp_identifier && lpCompletionStatus[item.lp_identifier] === true
                ).length;
                const totalCount = lpItemsForCategory.length;
                const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                const allCompleted = totalCount > 0 && completedCount === totalCount;

                return (
                  <button
                    key={category.category}
                    onClick={() => router.push(`/${category.uuid}`)}
                    className={`flex flex-col rounded-lg border transition-all text-left ${
                      isLeadershipPipeline && allCompleted
                        ? 'bg-white dark:bg-zinc-900 border-green-500 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-600 dark:hover:border-green-500'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    } hover:shadow-md`}
                  >
                    {/* Top Area - Title */}
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                          {category.category}
                        </h3>
                        {isLeadershipPipeline && email && totalCount > 0 && (
                          <div className="flex items-center gap-2">
                            {allCompleted ? (
                              <>
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 dark:bg-green-600">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </span>
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                  Course Complete
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                {completedCount}/{totalCount} ({percentage}%)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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
                        {category.counts.podcasts > 0 && (
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                            {category.counts.podcasts} {category.counts.podcasts === 1 ? 'podcast' : 'podcasts'}
                          </span>
                        )}
                        {category.counts.externalLinks > 0 && (
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                            {category.counts.externalLinks} {category.counts.externalLinks === 1 ? 'external link' : 'external links'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
                );
              })}
            </div>
          )}

          {categoriesLoading ? (
            <div className="mt-12 p-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 text-center">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 && (
            <div className="mt-12 p-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 text-center">
                No categories available yet.
              </p>
            </div>
          )}
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

