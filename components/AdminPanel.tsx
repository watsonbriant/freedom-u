'use client';

import { useState, useEffect } from 'react';
import { X, Check, X as XIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserRecord {
  email: string;
  intro_vid: boolean;
  track1_a: boolean;
  track1_b: boolean;
  track1_bonus: boolean;
  track1_quiz: boolean;
  track2_a: boolean;
  track2_b: boolean;
  track2_bonus: boolean;
  track2_quiz: boolean;
  track3_a: boolean;
  track3_b: boolean;
  track3_bonus: boolean;
  track3_quiz: boolean;
  track4_a: boolean;
  track4_b: boolean;
  track4_bonus: boolean;
  track4_quiz: boolean;
  bonustrack_vid: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [selectedNavItem, setSelectedNavItem] = useState('Users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [emailSearch, setEmailSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  const fetchUsers = async (page: number = 1, email: string = '', showLoading: boolean = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (email) {
        params.append('email', email);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await response.json();

      if (result.data) {
        setUsers(result.data);
        setPagination(result.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen && selectedNavItem === 'Users') {
      // Reset search when opening or switching nav items
      setEmailSearch('');
      fetchUsers(1, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedNavItem]);

  useEffect(() => {
    // Debounce search - only run if panel is open and Users is selected
    if (!isOpen || selectedNavItem !== 'Users') return;

    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      fetchUsers(1, emailSearch, false); // Don't show loading for search
    }, 300);

    setSearchDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailSearch, isOpen, selectedNavItem]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, emailSearch);
    }
  };

  const renderBooleanCell = (value: boolean) => {
    return (
      <div className="flex justify-center">
        {value ? (
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
        ) : (
          <XIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-900 z-50 flex flex-col">
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-10">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
            Admin Panel
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex">
        {/* Left Navigation */}
        <aside className="w-80 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedNavItem('Users')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  selectedNavItem === 'Users'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50 font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-700 dark:text-zinc-400'
                }`}
              >
                Users
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full p-6">
            {selectedNavItem === 'Users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                    Users
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search by email..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="border-collapse" style={{ minWidth: '2000px' }}>
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <th className="sticky left-0 z-20 bg-white dark:bg-zinc-900 text-left px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-[200px]">
                              Email
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              Intro
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              1-A
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              1-B
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              1-Bonus
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              1-Quiz
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              2-A
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              2-B
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              2-Bonus
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              2-Quiz
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              3-A
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              3-B
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              3-Bonus
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              3-Quiz
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              4-A
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              4-B
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              4-Bonus
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              4-Quiz
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              Bonus
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan={19} className="text-center px-4 py-8 text-zinc-600 dark:text-zinc-400">
                                No users found
                              </td>
                            </tr>
                          ) : (
                            users.map((user, index) => (
                              <tr
                                key={index}
                                className="border-b border-zinc-200 dark:border-zinc-800 group"
                              >
                                <td className="sticky left-0 z-10 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950 px-4 py-3 text-sm text-black dark:text-zinc-50 min-w-[200px]">
                                  {user.email}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.intro_vid)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track1_a)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track1_b)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track1_bonus)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track1_quiz)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track2_a)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track2_b)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track2_bonus)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track2_quiz)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track3_a)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track3_b)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track3_bonus)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track3_quiz)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track4_a)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track4_b)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track4_bonus)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track4_quiz)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.bonustrack_vid)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                          {pagination.total} users
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400 px-4">
                            Page {pagination.page} of {pagination.totalPages}
                          </span>
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

