import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";

interface SidebarProps {
  user: User | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  const menuItems = [
    { icon: "fas fa-tachometer-alt", label: "Dashboard", href: "/" },
    { icon: "fas fa-credit-card", label: "Payments", href: "/payments" },
    { icon: "fas fa-history", label: "Transaction History", href: "/history" },
    { icon: "fas fa-cog", label: "Account Settings", href: "/settings" },
    { icon: "fas fa-question-circle", label: "Support", href: "/support" },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen">
      <div className="p-5">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="font-bold text-xl text-primary-900 dark:text-white">AMKUSH</span>
        </div>

        {user && (
          <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                {user.firstName && user.lastName
                  ? `${user.firstName[0]}${user.lastName[0]}`
                  : user.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      location === item.href
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <i className={`${item.icon} w-5 h-5 flex-shrink-0`}></i>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {user && (
        <div className="absolute bottom-0 w-64 p-5 border-t border-gray-200 dark:border-gray-700">
          <Link href="/logout">
            <a className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              <i className="fas fa-sign-out-alt w-5 h-5 flex-shrink-0"></i>
              <span>Logout</span>
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}
