'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Image from "next/image";
import { File, Video, TextAlignStart, GraduationCap, FileVideoCamera, Link as LinkIcon, Headphones } from 'lucide-react';

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
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryUuid = params.category as string;

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

  // Fetch courses and category name
  useEffect(() => {
    if (!isLoading) {
      const cacheKey = `courses_${categoryUuid}`;
      
      // Check if sessionStorage is available and if we have cached data
      let cached = null;
      if (typeof sessionStorage !== 'undefined') {
        cached = sessionStorage.getItem(cacheKey);
      }
      
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setCourses(cachedData.courses);
          setCategoryName(cachedData.categoryName);
        } catch (error) {
          console.error('Error parsing cached data:', error);
        }
      } else {
        // Fetch courses for this category via uuid
        fetch(`/api/courses?category_uuid=${encodeURIComponent(categoryUuid)}`)
          .then((res) => res.json())
          .then((result) => {
            if (result.data) {
              setCourses(result.data);
              // Cache the results
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(cacheKey, JSON.stringify({
                  courses: result.data,
                  categoryName: result.categoryName
                }));
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
    }
  }, [isLoading, categoryUuid]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleLogoClick = () => {
    router.push('/home');
  };

  // Parse pathname to get current course and item UUIDs
  const pathParts = pathname.split('/').filter(Boolean);
  const currentCourseUuid = pathParts.length >= 2 ? pathParts[1] : '';
  const currentItemUuid = pathParts.length >= 3 ? pathParts[2] : '';

  // Fetch items when course changes
  useEffect(() => {
    if (currentCourseUuid && currentCourseUuid !== categoryUuid) {
      setItemsLoading(true);
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
    } else {
      setItems([]);
    }
  }, [currentCourseUuid, categoryUuid]);

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
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
              >
                Sign Out
              </button>
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
                            <div className="font-medium">{course.course_name}</div>
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
                                        <span className="text-sm">{title}</span>
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
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

