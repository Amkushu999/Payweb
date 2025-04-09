import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LogoutProps {
  setUser: (user: null) => void;
}

export default function Logout({ setUser }: LogoutProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the server to logout (clear session)
        await apiRequest("POST", "/api/auth/logout");
        
        // Clear user from local state
        setUser(null);

        // Show success message
        toast({
          title: "Logged Out Successfully",
          description: "You have been logged out of your account.",
        });

        // Redirect to home page
        setTimeout(() => {
          setLocation("/");
        }, 500);
      } catch (error) {
        console.error("Logout error:", error);
        
        // Still log out locally even if server fails
        setUser(null);
        
        toast({
          title: "Logout Issue",
          description: "There was an issue with the logout process, but you've been logged out of this device.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          setLocation("/");
        }, 1500);
      }
    };

    performLogout();
  }, [setUser, setLocation, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <i className="fas fa-sign-out-alt text-primary-600 dark:text-primary-300 text-2xl"></i>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Logging Out...
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Please wait while we securely log you out of your account
        </p>
      </div>
    </div>
  );
}