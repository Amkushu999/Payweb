import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import logoImage from "../../assets/logo.jpg";

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/payments", label: "Payments" },
    { href: "/history", label: "History" },
    { href: "/support", label: "Support" },
    { href: "/settings", label: "Settings" },
  ];

  // Get initials from user name
  const getUserInitials = () => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary-600 to-purple-600 shadow-xl">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 border-white">
              <img src={logoImage} alt="AMKUSH Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl text-white tracking-wider">AMKUSH</span>
              <span className="text-xs text-blue-200">IT'S OKEY</span>
            </div>
          </div>
        </Link>
        
        <div className="flex items-center space-x-6">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={location === item.href ? "secondary" : "ghost"}
                className={`text-white hover:bg-white/20 ${
                  location === item.href ? "bg-white/20" : ""
                }`}
                onClick={() => window.location.href = item.href}
              >
                {item.label}
              </Button>
            ))}
          </nav>
          
          {/* Mobile Navigation (Hamburger Menu) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <i className="fas fa-bars text-lg"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} onClick={() => window.location.href = item.href}>
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Theme Toggle & User Profile */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/20"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <i className="fas fa-sun text-yellow-300 text-lg"></i>
              ) : (
                <i className="fas fa-moon text-white text-lg"></i>
              )}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <Avatar className="w-10 h-10 bg-white border-2 border-white">
                      <AvatarFallback className="font-medium text-primary-600">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium text-white">
                      {user.firstName || user.username}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => window.location.href = "/profile"}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/settings"}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/logout"}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className="font-medium"
                onClick={() => window.location.href = "/login"}
              >
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
