'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Image from "next/image";
import { File, Video, TextAlignStart, GraduationCap, FileVideoCamera, Link as LinkIcon, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import EmailModal from '@/components/EmailModal';
import EmailPill from '@/components/EmailPill';

interface Course {
  uuid: string;
  category: string;
  course_name: string;
  course_description: string;
  seq_order: number;
}

interface Item {
  uuid: string;
  item_type: string;
  video_title?: string;
  video_description?: string;
  document_title?: string;
  document_description?: string;
  text_title?: string;
  text_content?: string;
  quiz?: string;
  link_title?: string;
  link_url?: string;
  podcast_title?: string;
  podcast_url?: string;
  lp_identifier?: string;
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailNoticeText, setEmailNoticeText] = useState<string>('');
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [allCourseItems, setAllCourseItems] = useState<Record<string, Item[]>>({});
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryUuid = params.category as string;
  const lastFetchedCategoryRef = useRef<string | null>(null);
  const previousPathnameRef = useRef<string>('');

  // Check auth on mount
  useEffect(() => {
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

  // Fetch email on mount
  useEffect(() => {
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

  // Fetch courses and category name
  // Only fetch fresh when entering a category or returning to the base category page
  useEffect(() => {
    if (!isLoading) {
      const isBaseCategoryPage = pathname === `/${categoryUuid}`;
      const categoryChanged = lastFetchedCategoryRef.current !== categoryUuid;
      const returnedToBasePage = isBaseCategoryPage && previousPathnameRef.current !== pathname && previousPathnameRef.current !== '';
      
      // Fetch fresh when:
      // 1. Category changes (different category)
      // 2. Returning to base category page from a course/item
      // 3. On base category page initially (no courses loaded yet)
      const shouldFetchFresh = categoryChanged || returnedToBasePage || (isBaseCategoryPage && courses.length === 0);
      
      if (shouldFetchFresh) {
        // Always fetch fresh courses from the database
        fetch(`/api/courses?category_uuid=${encodeURIComponent(categoryUuid)}`, {
          cache: 'no-store'
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.data) {
              setCourses(result.data);
              lastFetchedCategoryRef.current = categoryUuid;
            }
            if (result.categoryName) {
              setCategoryName(result.categoryName);
            }
          })
          .catch((error) => {
            console.error('Error fetching courses:', error);
          });
      }
      
      // Update previous pathname
      previousPathnameRef.current = pathname;
    }
  }, [isLoading, categoryUuid, pathname, courses.length]);

  // Open email modal automatically for Leadership Pipeline if email not set
  useEffect(() => {
    if (categoryName === 'Leadership Pipeline' && !email) {
      setEmailNoticeText('In order to access the Leadership Pipeline course, enter the email associated with your FHConnect account below.');
      setShowEmailModal(true);
    }
  }, [categoryName, email]);

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

  const handleLogout = () => {
    setEmail('');
    setShowEmailModal(true);
  };

  // Parse pathname to get current course and item UUIDs
  const pathParts = pathname.split('/').filter(Boolean);
  const currentCourseUuid = pathParts.length >= 2 ? pathParts[1] : '';
  const currentItemUuid = pathParts.length >= 3 ? pathParts[2] : '';

  // Fetch items for all courses when in Leadership Pipeline category
  useEffect(() => {
    if (categoryName === 'Leadership Pipeline' && courses.length > 0) {
      // Fetch items for all courses
      Promise.all(
        courses.map((course) =>
          fetch(`/api/items?course_uuid=${encodeURIComponent(course.uuid)}`)
            .then((res) => res.json())
            .then((result) => ({ courseUuid: course.uuid, items: result.data || [] }))
            .catch(() => ({ courseUuid: course.uuid, items: [] }))
        )
      ).then((results) => {
        const itemsMap: Record<string, Item[]> = {};
        results.forEach(({ courseUuid, items: courseItems }) => {
          itemsMap[courseUuid] = courseItems;
        });
        setAllCourseItems(itemsMap);
      });
    }
  }, [categoryName, courses]);

  // Fetch items when course changes (for the selected course display)
  useEffect(() => {
    if (currentCourseUuid && currentCourseUuid !== categoryUuid) {
      setItemsLoading(true);
      // Use cached items if available, otherwise fetch
      if (allCourseItems[currentCourseUuid]) {
        setItems(allCourseItems[currentCourseUuid]);
        setItemsLoading(false);
      } else {
        fetch(`/api/items?course_uuid=${encodeURIComponent(currentCourseUuid)}`)
          .then((res) => res.json())
          .then((result) => {
            if (result.data) {
              setItems(result.data);
            }
            setItemsLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching items:', error);
            setItemsLoading(false);
          });
      }
    } else {
      setItems([]);
    }
  }, [currentCourseUuid, categoryUuid, allCourseItems]);

  // Function to refresh completion status
  const refreshCompletionStatus = () => {
    if (email && categoryName === 'Leadership Pipeline') {
      fetch(`/api/lp/completion?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.data) {
            setCompletionStatus(result.data);
          }
        })
        .catch(() => {
          // Silent fail
        });
    } else {
      setCompletionStatus({});
    }
  };

  // Fetch completion status for Leadership Pipeline
  useEffect(() => {
    refreshCompletionStatus();
  }, [email, categoryName]);

  // Listen for completion updates from item pages
  useEffect(() => {
    const handleCompletionUpdate = () => {
      // Refresh completion status when an item is marked complete
      refreshCompletionStatus();
    };

    window.addEventListener('lp-completion-updated', handleCompletionUpdate);
    return () => {
      window.removeEventListener('lp-completion-updated', handleCompletionUpdate);
    };
  }, [email, categoryName]);

  // Helper function to get item icon
  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'text':
        return <TextAlignStart className="w-4 h-4" />;
      case 'document':
        return <File className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'video_doc':
        return <FileVideoCamera className="w-4 h-4" />;
      case 'quiz':
        return <GraduationCap className="w-4 h-4" />;
      case 'link':
        return <LinkIcon className="w-4 h-4" />;
      case 'podcast':
        return <Headphones className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Helper function to get item title
  const getItemTitle = (item: Item) => {
    const itemType = item.item_type || '';
    switch (itemType) {
      case 'video':
        return item.video_title || 'Video';
      case 'document':
        return item.document_title || 'Document';
      case 'video_doc':
        return item.video_title || 'Video Document';
      case 'text':
        return item.text_title || 'Text';
      case 'quiz':
        return item.quiz || 'Quiz';
      case 'link':
        return item.link_title || 'Link';
      case 'podcast':
        return item.podcast_title || 'Podcast';
      default:
        return 'Item';
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-open modal on mobile when entering a category
  useEffect(() => {
    if (pathname === `/${categoryUuid}` && courses.length > 0) {
      // Only auto-open on mobile devices
      if (window.innerWidth < 640) {
        setIsMobileMenuOpen(true);
      }
    }
  }, [pathname, categoryUuid, courses.length]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
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
              <h1 className="hidden sm:block text-2xl font-bold text-black dark:text-zinc-50">
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
              <EmailPill email={email} onEmailChange={handleEmailChange} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex w-full gap-6">

          {/* Mobile Menu Modal */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 sm:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="h-full w-80 bg-white dark:bg-zinc-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Sidebar content - reused below */}
                <div className={`bg-white dark:bg-zinc-900 ${
                  categoryName === 'Leadership Pipeline' && email && (() => {
                    const allLpItems: Item[] = [];
                    Object.values(allCourseItems).forEach(courseItems => {
                      const lpItems = courseItems.filter(item => 
                        item.lp_identifier && item.lp_identifier.trim() !== ''
                      );
                      allLpItems.push(...lpItems);
                    });
                    const completedCount = allLpItems.filter(item =>
                      item.lp_identifier && completionStatus[item.lp_identifier] === true
                    ).length;
                    const totalCount = allLpItems.length;
                    const allCompleted = totalCount > 0 && completedCount === totalCount;
                    return allCompleted ? 'border-green-500 dark:border-green-600 border-l-4' : 'border-zinc-200 dark:border-zinc-800';
                  })() || 'border-zinc-200 dark:border-zinc-800'
                }`}>
                  <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                      {categoryName}
                    </h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                    {courses.length > 0 ? (
                      <nav className="p-2">
                        {courses.map((course) => {
                          const isSelected = currentCourseUuid === course.uuid;
                          return (
                            <div key={course.uuid}>
                              <button
                                onClick={() => {
                                  router.push(`/${categoryUuid}/${course.uuid}`);
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-md mb-2 transition-colors ${
                                  isSelected
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50 font-medium'
                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-700 dark:text-zinc-400'
                                }`}
                              >
                                {(() => {
                                  if (categoryName === 'Leadership Pipeline' && email) {
                                    const courseItems = allCourseItems[course.uuid] || [];
                                    const lpItems = courseItems.filter(item => 
                                      item.lp_identifier && item.lp_identifier.trim() !== ''
                                    );
                                    const allCompleted = lpItems.length > 0 && lpItems.every(item => 
                                      item.lp_identifier && completionStatus[item.lp_identifier] === true
                                    );
                                    const hasItems = lpItems.length > 0;
                                    
                                    return (
                                      <div className="flex items-center gap-2">
                                        <div className="font-medium flex-1 text-sm">{course.course_name}</div>
                                        {hasItems && (
                                          <div className="flex-shrink-0">
                                            {allCompleted ? (
                                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 dark:bg-green-600">
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 dark:bg-red-600">
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="flex items-center gap-2">
                                      <div className="font-medium flex-1 text-sm">{course.course_name}</div>
                                    </div>
                                  );
                                })()}
                              </button>
                              
                              {isSelected && items.length > 0 && (
                                <div className="ml-4 mb-2">
                                  {itemsLoading ? (
                                    <div className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                                      Loading...
                                    </div>
                                  ) : (
                                    items.map((item) => {
                                      const itemType = item.item_type || '';
                                      const title = getItemTitle(item);
                                      const isItemSelected = currentItemUuid === item.uuid;
                                      const isLpItem = categoryName === 'Leadership Pipeline' && 
                                                      item.lp_identifier && 
                                                      item.lp_identifier.trim() !== '';
                                      const isItemCompleted = isLpItem && email && item.lp_identifier && 
                                                            completionStatus[item.lp_identifier] === true;
                                      return (
                                        <button
                                          key={item.uuid}
                                          onClick={() => {
                                            router.push(`/${categoryUuid}/${course.uuid}/${item.uuid}`);
                                            setIsMobileMenuOpen(false);
                                          }}
                                          className={`w-full text-left px-4 py-2 rounded-md mb-1 transition-colors ${
                                            isItemSelected
                                              ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50'
                                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-600 dark:text-zinc-500'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className="flex-shrink-0">
                                              {getItemIcon(itemType)}
                                            </div>
                                            <span className="text-xs flex-1">{title}</span>
                                            {isLpItem && (
                                              <div className="flex-shrink-0">
                                                {isItemCompleted ? (
                                                  <svg className="w-3 h-3 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                ) : (
                                                  <svg className="w-3 h-3 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                  </svg>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </nav>
                    ) : (
                      <div className="p-4">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                          No courses available yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Left Sidebar - Courses List (Desktop) */}
          <aside className="hidden sm:block w-80 flex-shrink-0">
            <div className={`bg-white dark:bg-zinc-900 rounded-lg border ${
              categoryName === 'Leadership Pipeline' && email && (() => {
                const allLpItems: Item[] = [];
                Object.values(allCourseItems).forEach(courseItems => {
                  const lpItems = courseItems.filter(item => 
                    item.lp_identifier && item.lp_identifier.trim() !== ''
                  );
                  allLpItems.push(...lpItems);
                });
                const completedCount = allLpItems.filter(item =>
                  item.lp_identifier && completionStatus[item.lp_identifier] === true
                ).length;
                const totalCount = allLpItems.length;
                const allCompleted = totalCount > 0 && completedCount === totalCount;
                return allCompleted ? 'border-green-500 dark:border-green-600' : 'border-zinc-200 dark:border-zinc-800';
              })() || 'border-zinc-200 dark:border-zinc-800'
            }`}>
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                    {categoryName}
                  </h2>
                  {categoryName === 'Leadership Pipeline' && email && (() => {
                    // Calculate total LP items across all courses
                    const allLpItems: Item[] = [];
                    Object.values(allCourseItems).forEach(courseItems => {
                      const lpItems = courseItems.filter(item => 
                        item.lp_identifier && item.lp_identifier.trim() !== ''
                      );
                      allLpItems.push(...lpItems);
                    });
                    
                    // Count completed items
                    const completedCount = allLpItems.filter(item =>
                      item.lp_identifier && completionStatus[item.lp_identifier] === true
                    ).length;
                    const totalCount = allLpItems.length;
                    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                    const allCompleted = totalCount > 0 && completedCount === totalCount;
                    
                    return (
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
                              Completed
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {completedCount}/{totalCount} ({percentage}%)
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {courses.length > 0 ? (
                  <nav className="p-2">
                    {courses.map((course) => {
                      const isSelected = currentCourseUuid === course.uuid;
                      return (
                        <div key={course.uuid}>
                          <button
                            onClick={() => router.push(`/${categoryUuid}/${course.uuid}`)}
                            className={`w-full text-left px-4 py-3 rounded-md mb-2 transition-colors ${
                              isSelected
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50 font-medium'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-700 dark:text-zinc-400'
                            }`}
                          >
                            {(() => {
                              // Calculate completion status for this course (works for all courses now)
                              if (categoryName === 'Leadership Pipeline' && email) {
                                // Get all LP items for this course (from cached items)
                                const courseItems = allCourseItems[course.uuid] || [];
                                const lpItems = courseItems.filter(item => 
                                  item.lp_identifier && item.lp_identifier.trim() !== ''
                                );
                                // Check if all are completed
                                const allCompleted = lpItems.length > 0 && lpItems.every(item => 
                                  item.lp_identifier && completionStatus[item.lp_identifier] === true
                                );
                                const hasItems = lpItems.length > 0;
                                
                                return (
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium flex-1">{course.course_name}</div>
                                    {hasItems && (
                                      <div className="flex-shrink-0">
                                        {allCompleted ? (
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
                                        ) : (
                                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 dark:bg-red-600">
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
                                                d="M6 18L18 6M6 6l12 12"
                                              />
                                            </svg>
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              
                              // For non-Leadership Pipeline categories, just show course name
                              return (
                                <div className="flex items-center gap-2">
                                  <div className="font-medium flex-1">{course.course_name}</div>
                                </div>
                              );
                            })()}
                          </button>
                          
                          {/* Show items nested under the selected course */}
                          {isSelected && items.length > 0 && (
                            <div className="ml-4 mb-2">
                              {itemsLoading ? (
                                <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                                  Loading...
                                </div>
                              ) : (
                                items.map((item) => {
                                  const itemType = item.item_type || '';
                                  const title = getItemTitle(item);
                                  const isItemSelected = currentItemUuid === item.uuid;
                                  // Check if this is an LP item and if it's completed
                                  const isLpItem = categoryName === 'Leadership Pipeline' && 
                                                  item.lp_identifier && 
                                                  item.lp_identifier.trim() !== '';
                                  const isItemCompleted = isLpItem && email && item.lp_identifier && 
                                                        completionStatus[item.lp_identifier] === true;
                                  return (
                                    <button
                                      key={item.uuid}
                                      onClick={() => router.push(`/${categoryUuid}/${course.uuid}/${item.uuid}`)}
                                      className={`w-full text-left px-4 py-2 rounded-md mb-1 transition-colors ${
                                        isItemSelected
                                          ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50'
                                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-600 dark:text-zinc-500'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0">
                                          {getItemIcon(itemType)}
                                        </div>
                                        <span className="text-sm flex-1">{title}</span>
                                        {isLpItem && (
                                          <div className="flex-shrink-0">
                                            {isItemCompleted ? (
                                              <svg
                                                className="w-4 h-4 text-green-500 dark:text-green-400"
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
                                            ) : (
                                              <svg
                                                className="w-4 h-4 text-red-500 dark:text-red-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"
                                                />
                                              </svg>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
            {/* Mobile Breadcrumb */}
            {(currentCourseUuid || pathname === `/${categoryUuid}`) && (
              <div className="mb-4 sm:hidden bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {categoryName}
                    </div>
                    {currentCourseUuid && (() => {
                      const currentCourse = courses.find(c => c.uuid === currentCourseUuid);
                      if (currentCourse) {
                        return (
                          <div className="text-base font-semibold text-black dark:text-zinc-50 truncate">
                            {currentCourse.course_name}
                          </div>
                        );
                      }
                    })()}
                    {currentItemUuid && (() => {
                      const currentItem = items.find(i => i.uuid === currentItemUuid);
                      if (currentItem) {
                        return (
                          <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                            {getItemTitle(currentItem)}
                          </div>
                        );
                      }
                    })()}
                  </div>
                  
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex-shrink-0 w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-opacity flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            {currentItemUuid && courses.length > 0 && (() => {
              // Find all items in the category - need to fetch all items for navigation
              const allItems: Array<{ item: Item; courseUuid: string }> = [];
              
              // For Leadership Pipeline, use cached items
              if (categoryName === 'Leadership Pipeline' && Object.keys(allCourseItems).length > 0) {
                courses.forEach(course => {
                  const courseItems = allCourseItems[course.uuid] || [];
                  courseItems.forEach(item => {
                    allItems.push({ item, courseUuid: course.uuid });
                  });
                });
              } else {
                // For other categories, we need to get items
                // For now, just use current course items
                courses.forEach(course => {
                  if (course.uuid === currentCourseUuid) {
                    items.forEach(item => {
                      allItems.push({ item, courseUuid: course.uuid });
                    });
                  }
                });
              }
              
              const currentIndex = allItems.findIndex(({ item }) => item.uuid === currentItemUuid);
              const hasPrevious = currentIndex > 0;
              const hasNext = currentIndex < allItems.length - 1;
              
              if (hasPrevious || hasNext) {
                return (
                  <div className="mb-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => {
                          if (hasPrevious) {
                            const { item, courseUuid } = allItems[currentIndex - 1];
                            router.push(`/${categoryUuid}/${courseUuid}/${item.uuid}`);
                          }
                        }}
                        disabled={!hasPrevious}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-opacity ${
                          hasPrevious
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {currentIndex + 1} / {allItems.length}
                      </span>
                      
                      <button
                        onClick={() => {
                          if (hasNext) {
                            const { item, courseUuid } = allItems[currentIndex + 1];
                            router.push(`/${categoryUuid}/${courseUuid}/${item.uuid}`);
                          }
                        }}
                        disabled={!hasNext}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-opacity ${
                          hasNext
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {children}
            </div>
          </div>
        </div>
      </main>

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        initialEmail={email}
        noticeText={emailNoticeText}
      />
    </div>
  );
}

