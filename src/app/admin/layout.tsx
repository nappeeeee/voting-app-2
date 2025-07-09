"use client";

import { useState } from "react"; // Import useState for sidebar toggle
import { useRouter, usePathname } from "next/navigation"; // usePathname for active link
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon, // Changed from UserIcon to UserGroupIcon for candidates
  ArrowLeftOnRectangleIcon, // Logout icon
  Bars3Icon, // Menu icon for mobile
  XMarkIcon, // Close icon for mobile
} from "@heroicons/react/24/outline"; // Import icons

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Hook to get current path
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  const handleLogout = () => {
    document.cookie = "adminSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { name: "Kandidat", href: "/admin/candidates", icon: UserGroupIcon },
    { name: "User", href: "/admin/users", icon: UsersIcon },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-700 bg-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isSidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white p-6 flex flex-col justify-between 
                   transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                   lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 lg:static lg:shadow-xl`}
      >
        <div>
          {/* Logo/Title Section */}
          <div className="mb-8 text-center">
            {/* You can replace this with an actual logo image */}
            <h2 className="text-3xl font-extrabold text-indigo-400">
              Admin <span className="text-white">Panel</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">Sistem Pemilihan Online</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-lg text-lg font-medium 
                            ${
                              pathname === item.href
                                ? "bg-indigo-600 text-white shadow-md"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            } 
                            transition duration-150 ease-in-out`}
                onClick={() => setIsSidebarOpen(false)} // Close sidebar on nav click (mobile)
              >
                <item.icon className="h-6 w-6 mr-3" aria-hidden="true" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md 
                     transition duration-150 ease-in-out mt-8"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

console.log("🧱 Admin layout (with modern sidebar) loaded");