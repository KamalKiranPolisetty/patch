"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  username?: string | null;
}

export default function Navbar({ username }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
  }

  return (
    <nav
      data-testid="navbar"
      className="fixed top-0 left-0 right-0 z-50 bg-blue-700 text-white shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          data-testid="navbar-brand"
        >
          <svg
            data-testid="navbar-logo"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.2" />
            <path
              d="M8 16C8 11.58 11.58 8 16 8s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8z"
              fill="white"
              fillOpacity="0.9"
            />
            <circle cx="16" cy="16" r="4" fill="#1d4ed8" />
          </svg>
          <span className="text-xl font-bold tracking-tight" data-testid="navbar-title">
            Patch
          </span>
        </Link>

        <div className="flex items-center gap-6" data-testid="navbar-right">
          {username && (
            <span className="text-sm font-medium" data-testid="navbar-welcome">
              Welcome, {username}
            </span>
          )}
          <Link
            href="/incidents"
            data-testid="navbar-incidents-link"
            className="text-sm font-medium hover:text-blue-200 transition-colors"
          >
            Incidents
          </Link>
          <button
            onClick={handleLogout}
            data-testid="navbar-logout-btn"
            className="bg-white text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
