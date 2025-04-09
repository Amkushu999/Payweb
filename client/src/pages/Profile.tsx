import { useState } from "react";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ProfileProps {
  user: User | null;
}

export default function Profile({ user }: ProfileProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button variant="default" onClick={() => window.location.href = "/login"}>
              Log In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} />
                  <AvatarFallback>{getInitials(user.firstName)}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user.firstName} {user.lastName}</CardTitle>
              <CardDescription className="text-center">{user.email}</CardDescription>
              <CardDescription className="text-center mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {user.plan ? `${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan` : 'Free Plan'}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Username</span>
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Credits</span>
                  <span className="text-sm font-medium">{user.credits}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = "/settings"}
              >
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View and manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Personal Information</h3>
                      <div className="rounded-md border border-border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">First Name</div>
                            <div className="font-medium">{user.firstName}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Last Name</div>
                            <div className="font-medium">{user.lastName}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Email</div>
                            <div className="font-medium">{user.email}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Username</div>
                            <div className="font-medium">{user.username}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="payments" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Payment Methods</h3>
                      <div className="rounded-md border border-border p-4">
                        <div className="text-center p-4">
                          <p className="text-muted-foreground mb-4">No saved payment methods found</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = "/payments"}
                          >
                            Add Payment Method
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Recent Transactions</h3>
                      <div className="rounded-md border border-border p-4">
                        <div className="text-center p-4">
                          <p className="text-muted-foreground mb-4">No transaction history found</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = "/history"}
                          >
                            View All Transactions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Password</h3>
                      <div className="rounded-md border border-border p-4">
                        <div className="text-center p-4">
                          <p className="text-muted-foreground mb-4">Change your password regularly for better security</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: "This feature will be available soon.",
                              });
                            }}
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                      <div className="rounded-md border border-border p-4">
                        <div className="text-center p-4">
                          <p className="text-muted-foreground mb-4">Enable two-factor authentication for added security</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: "This feature will be available soon.",
                              });
                            }}
                          >
                            Enable 2FA
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}