'use client';

import { Menu } from 'lucide-react';

interface EmailPillProps {
  email: string;
  onEmailChange: () => void;
}

export default function EmailPill({ email, onEmailChange }: EmailPillProps) {
  const displayEmail = email || 'No email set';

  return (
    <button
      onClick={onEmailChange}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
      title="Click to change email"
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
  );
}

