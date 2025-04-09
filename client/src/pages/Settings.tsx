import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface SettingsProps {
  user: User | null;
}

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type NotificationValues = z.infer<typeof notificationSchema>;

export default function Settings({ user }: SettingsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<NotificationValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      securityAlerts: true,
    },
  });

  const onProfileSubmit = (values: ProfileFormValues) => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const onSecuritySubmit = (values: SecurityFormValues) => {
    toast({
      title: "Password Changed",
      description: "Your password has been changed successfully.",
    });
    
    securityForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const onNotificationSubmit = (values: NotificationValues) => {
    toast({
      title: "Notification Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your account preferences and settings
          </p>
        </div>
        
        <Tabs 
          defaultValue="profile" 
          className="w-full" 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <Card className="lg:w-64 h-fit flex-shrink-0">
              <CardContent className="p-4">
                <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1">
                  <TabsTrigger 
                    value="profile" 
                    className="justify-start w-full py-2 px-4 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900 text-left"
                  >
                    <i className="far fa-user mr-2 w-4 text-center"></i>
                    Profile Information
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="justify-start w-full py-2 px-4 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900 text-left"
                  >
                    <i className="fas fa-lock mr-2 w-4 text-center"></i>
                    Password & Security
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payment-methods" 
                    className="justify-start w-full py-2 px-4 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900 text-left"
                  >
                    <i className="fas fa-credit-card mr-2 w-4 text-center"></i>
                    Payment Methods
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="justify-start w-full py-2 px-4 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900 text-left"
                  >
                    <i className="fas fa-bell mr-2 w-4 text-center"></i>
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger 
                    value="api-keys" 
                    className="justify-start w-full py-2 px-4 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900 text-left"
                  >
                    <i className="fas fa-key mr-2 w-4 text-center"></i>
                    API Keys
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>
            
            <div className="flex-grow">
              <TabsContent value="profile" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your first name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your last name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email address" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit">
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                    <CardDescription>
                      Update your password and secure your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...securityForm}>
                      <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                        <FormField
                          control={securityForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input placeholder="••••••••" type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input placeholder="••••••••" type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 8 characters long
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input placeholder="••••••••" type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Enable Two-Factor Authentication
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Switch id="2fa" aria-label="Toggle 2FA" />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit">
                            Update Password
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payment-methods" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your payment methods and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Saved Payment Methods */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Saved Payment Methods</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                          <p className="text-gray-500 dark:text-gray-400">
                            No payment methods have been saved yet.
                          </p>
                          <Button className="mt-4">
                            <i className="fas fa-plus mr-2"></i>
                            Add Payment Method
                          </Button>
                        </div>
                      </div>
                      
                      {/* Billing Address */}
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium mb-4">Default Billing Address</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                          <p className="text-gray-500 dark:text-gray-400">
                            No billing address has been added yet.
                          </p>
                          <Button variant="outline" className="mt-4">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            Add Billing Address
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Configure when and how you'd like to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <FormField
                            control={notificationForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium">
                                    Email Notifications
                                  </FormLabel>
                                  <FormDescription>
                                    Receive email notifications about your account activity
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="smsNotifications"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium">
                                    SMS Notifications
                                  </FormLabel>
                                  <FormDescription>
                                    Receive text message notifications for important updates
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="marketingEmails"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium">
                                    Marketing Emails
                                  </FormLabel>
                                  <FormDescription>
                                    Receive emails about new features and special offers
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="securityAlerts"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium">
                                    Security Alerts
                                  </FormLabel>
                                  <FormDescription>
                                    Receive notifications about security-related events
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit">
                            Save Preferences
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="api-keys" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage API keys for integrating with our payment platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-4 text-yellow-800 dark:text-yellow-300">
                        <div className="flex items-start">
                          <i className="fas fa-exclamation-triangle mr-3 mt-0.5"></i>
                          <div>
                            <p className="font-medium">API keys are sensitive information</p>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                              Treat your API keys like passwords. Do not share them in publicly accessible areas such as GitHub, client-side code, etc.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          No API keys have been created yet
                        </p>
                        <Button className="mt-4">
                          <i className="fas fa-key mr-2"></i>
                          Generate New API Key
                        </Button>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium mb-4">API Documentation</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Learn how to integrate with our payment platform using our APIs
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <Button variant="outline">
                            <i className="fas fa-book mr-2"></i>
                            View Documentation
                          </Button>
                          <Button variant="outline">
                            <i className="fas fa-code mr-2"></i>
                            Code Examples
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}