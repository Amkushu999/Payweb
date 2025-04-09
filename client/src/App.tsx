import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Payments from "@/pages/Payments";
import PaymentHistory from "@/pages/PaymentHistory";
import Support from "@/pages/Support";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Logout from "@/pages/Logout";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import { useState } from "react";
import { ThemeProvider } from "@/hooks/use-theme";

// Mock User for now
const defaultUser = {
  id: 1,
  username: "demo",
  email: "demo@example.com",
  firstName: "John",
  lastName: "Doe",
  plan: "free",
  credits: 0,
  createdAt: new Date().toISOString(),
};

function Router() {
  const [user, setUser] = useState(defaultUser);

  return (
    <Switch>
      <Route path="/" component={() => <Dashboard user={user} />} />
      <Route path="/payments" component={() => <Payments user={user} />} />
      <Route path="/history" component={() => <PaymentHistory user={user} />} />
      <Route path="/support" component={() => <Support user={user} />} />
      <Route path="/settings" component={() => <Settings user={user} />} />
      <Route path="/profile" component={() => <Profile user={user} />} />
      <Route path="/login" component={() => <Login setUser={setUser} />} />
      <Route path="/logout" component={() => <Logout setUser={setUser} />} />
      <Route path="/register" component={() => <Register setUser={setUser} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
