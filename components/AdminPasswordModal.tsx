'use client';

import { useState } from 'react';
import Image from "next/image";

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPasswordModal({ isOpen, onClose, onSuccess }: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setPassword('');
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image 
              src="/Logo.jpg" 
              alt="FreedomU Logo" 
              width={32} 
              height={32}
              className="rounded"
            />
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
              Admin Access
            </h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Please enter the admin password to access the Admin Panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50 transition-colors"
              placeholder="Enter admin password"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 rounded-lg bg-black dark:bg-zinc-50 text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

