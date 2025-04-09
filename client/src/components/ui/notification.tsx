import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

interface NotificationContextType {
  showNotification: (props: NotificationProps) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function Notification({ type, title, message, duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIconClass = () => {
    switch (type) {
      case "success":
        return "fas fa-check bg-green-100 dark:bg-green-900 text-green-500";
      case "error":
        return "fas fa-times bg-red-100 dark:bg-red-900 text-red-500";
      case "warning":
        return "fas fa-exclamation bg-yellow-100 dark:bg-yellow-900 text-yellow-500";
      case "info":
        return "fas fa-info bg-blue-100 dark:bg-blue-900 text-blue-500";
      default:
        return "fas fa-info bg-blue-100 dark:bg-blue-900 text-blue-500";
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-slide-up z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center">
            <i className={cn(getIconClass())}></i>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = (props: NotificationProps) => {
    setNotification(props);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notification && (
        <Notification
          {...notification}
          onClose={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
