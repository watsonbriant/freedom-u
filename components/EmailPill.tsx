'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Check, File, Video, TextAlignStart, GraduationCap, FileVideoCamera, Link as LinkIcon, Headphones } from 'lucide-react';

interface EmailPillProps {
  email: string;
  onEmailChange: () => void;
}

interface Item {
  uuid: string;
  item_type: string;
  video_title?: string;
  quiz?: string;
  lp_identifier?: string;
}

interface Course {
  uuid: string;
  category: string;
}

interface Category {
  uuid: string;
  category: string;
}

export default function EmailPill({ email, onEmailChange }: EmailPillProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailValue, setEmailValue] = useState(email);
  const [savedEmail, setSavedEmail] = useState(email);
  const [lpItems, setLpItems] = useState<Item[]>([]);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [lpCategoryUuid, setLpCategoryUuid] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const displayEmail = email || 'No email set';

  // Update email value when prop changes
  useEffect(() => {
    setEmailValue(email);
    setSavedEmail(email);
  }, [email]);

  // Function to fetch LP items and completion status
  const fetchLpData = useCallback(() => {
    if (!email) return;

    // Fetch categories to get Leadership Pipeline UUID
    fetch('/api/categories')
      .then((res) => res.json())
      .then((result) => {
        if (result.data) {
          const lpCategory = result.data.find((c: Category) => c.category === 'Leadership Pipeline');
          if (lpCategory) {
            setLpCategoryUuid(lpCategory.uuid);
            
            // Fetch courses for Leadership Pipeline
            return fetch(`/api/courses?category_uuid=${encodeURIComponent(lpCategory.uuid)}`)
              .then((res) => res.json())
              .then((courseResult) => {
                if (courseResult.data && courseResult.data.length > 0) {
                  // Fetch items for all courses
                  return Promise.all(
                    courseResult.data.map((course: Course) =>
                      fetch(`/api/items?course_uuid=${encodeURIComponent(course.uuid)}`)
                        .then((res) => res.json())
                        .then((itemResult) => itemResult.data || [])
                        .catch(() => [])
                    )
                  );
                }
                return [];
              });
          }
        }
        return [];
      })
      .then((allItemsArrays: Item[][]) => {
        const allItems: Item[] = [];
        allItemsArrays.forEach(items => {
          allItems.push(...items);
        });
        // Filter to only items with lp_identifier
        const lpFiltered = allItems.filter(item => 
          item.lp_identifier && item.lp_identifier.trim() !== ''
        );
        setLpItems(lpFiltered);
      })
      .catch(() => {
        // Silent fail
      });

    // Fetch completion status
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
  }, [email]);

  // Fetch LP items and completion status when expanded and email exists
  useEffect(() => {
    if (isExpanded && email) {
      fetchLpData();
    }
  }, [isExpanded, email, fetchLpData]);

  // Listen for completion updates
  useEffect(() => {
    const handleCompletionUpdate = () => {
      if (isExpanded && email) {
        fetchLpData();
      }
    };

    window.addEventListener('lp-completion-updated', handleCompletionUpdate);
    return () => {
      window.removeEventListener('lp-completion-updated', handleCompletionUpdate);
    };
  }, [isExpanded, email, fetchLpData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setIsEditing(false);
        setEmailValue(savedEmail);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, savedEmail]);

  const handleToggle = () => {
    if (!email) {
      // If no email, call the original onEmailChange handler
      onEmailChange();
      return;
    }
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setIsEditing(false);
      setEmailValue(savedEmail);
    }
  };

  const handleUpdateClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEmailValue(savedEmail);
  };

  const handleSave = async () => {
    if (!emailValue || !emailValue.includes('@')) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/register-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailValue }),
      });

      if (response.ok) {
        setSavedEmail(emailValue);
        setIsEditing(false);
        // Trigger a page refresh to update email across the app
        window.location.reload();
      } else {
        throw new Error('Failed to save email');
      }
    } catch (error) {
      console.error('Error saving email:', error);
      setEmailValue(savedEmail);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigateToLP = () => {
    if (lpCategoryUuid) {
      router.push(`/${lpCategoryUuid}`);
      setIsExpanded(false);
    }
  };

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
    if (item.video_title) {
      return item.video_title;
    }
    if (item.quiz) {
      return item.quiz;
    }
    return 'Untitled Item';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
        title={email ? "Click to view email and progress" : "Click to set email"}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="max-w-[200px] truncate">{displayEmail}</span>
        <Menu className="w-4 h-4" />
      </button>

      {isExpanded && email && (
        <div className="absolute right-0 top-14 w-[750px] bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">Profile Overview</h3>
            <button
              onClick={() => {
                setIsExpanded(false);
                setIsEditing(false);
                setEmailValue(savedEmail);
              }}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-6">
            {/* Left section - Email editing */}
            <div className="flex-[1.5]">
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Email Address
              </label>
              <div className="space-y-3">
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 text-sm rounded-lg border ${
                    isEditing
                      ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50'
                      : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50 transition-colors`}
                  placeholder="your.email@example.com"
                />
                
                {!isEditing ? (
                  <button
                    onClick={handleUpdateClick}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors text-sm font-medium"
                  >
                    Change Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !emailValue || !emailValue.includes('@')}
                      className="flex-1 px-4 py-2 rounded-lg bg-black dark:bg-zinc-50 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right section - Leadership Pipeline progress */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-black dark:text-zinc-50 mb-3">
                Leadership Pipeline Progress
              </h4>
              {lpItems.length > 0 ? (
                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                  {lpItems.map((item) => {
                    const isCompleted = item.lp_identifier && completionStatus[item.lp_identifier] === true;
                    const title = getItemTitle(item);
                    const icon = getItemIcon(item.item_type || '');

                    return (
                      <div
                        key={item.uuid}
                        className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                          {isCompleted ? (
                            <Check className="w-4 h-4 text-green-500 dark:text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 dark:text-red-400" />
                          )}
                        </div>
                        {icon && (
                          <div className="flex-shrink-0 text-zinc-600 dark:text-zinc-400">
                            {icon}
                          </div>
                        )}
                        <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1 truncate">
                          {title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No items available
                </p>
              )}
              {lpCategoryUuid && (
                <button
                  onClick={handleNavigateToLP}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors text-sm font-medium"
                >
                  View Leadership Pipeline
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

