import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SupportProps {
  user: User | null;
}

const supportFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

export default function Support({ user }: SupportProps) {
  const { toast } = useToast();
  
  // FAQ data
  const faqs = [
    {
      question: "How do I process a payment?",
      answer: "To process a payment, navigate to the Payments page, select your preferred payment method, fill in the required details, and click on the 'Pay' button. You'll receive a confirmation once the payment is processed successfully."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We currently accept credit/debit cards through Stripe. PayPal, cryptocurrency, and bank transfer options will be available soon."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, all payment information is securely processed through our payment partners. We use SSL encryption for all transactions and do not store your full credit card details on our servers."
    },
    {
      question: "How do I view my transaction history?",
      answer: "You can view your complete transaction history by navigating to the 'History' page from the main navigation menu. There, you can filter transactions by status and view details for each transaction."
    },
    {
      question: "What should I do if a payment fails?",
      answer: "If a payment fails, first check that your payment details are correct. If the issue persists, you can retry the payment from the transaction history page or contact our support team for assistance."
    },
    {
      question: "How do I get a receipt for my payment?",
      answer: "Receipts are automatically generated for completed transactions. You can view and download receipts by clicking on the 'Receipt' button next to the transaction in your transaction history."
    }
  ];
  
  // Initialize form with user data if available
  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      subject: '',
      message: '',
    },
  });
  
  const onSubmit = (values: SupportFormValues) => {
    // In a real app, this would send the support request to the server
    toast({
      title: "Support Request Submitted",
      description: "We'll get back to you as soon as possible.",
    });
    
    form.reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white">
            Support
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            We're here to help with any questions or issues
          </p>
        </div>
        
        {/* FAQ Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          <div className="md:col-span-7 animate-slide-up">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Form */}
          <div className="md:col-span-5 animate-slide-up">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Fill out the form below to get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Subject of your inquiry" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="How can we help you?" 
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Contact Info */}
            <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Contact Us Directly</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <i className="fas fa-envelope w-5 h-5 text-primary-500 mr-3"></i>
                  <a href="mailto:Amkushu999@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline transition-colors">
                    Email Support
                  </a>
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full">Click to Contact</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-phone w-5 h-5 text-primary-500 mr-3"></i>
                  <a href="tel:+254723203194" className="text-primary-600 dark:text-primary-400 hover:underline transition-colors">
                    Phone Support
                  </a>
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full">Click to Call</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock w-5 h-5 text-primary-500 mr-3"></i>
                  <span className="text-gray-600 dark:text-gray-300">Available 24/7 for your support needs</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-globe w-5 h-5 text-primary-500 mr-3"></i>
                  <span className="text-gray-600 dark:text-gray-300">Based in Kenya, serving customers worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
