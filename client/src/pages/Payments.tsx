import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";
import PayPalPayment from "@/components/payment/PayPalPayment";
import CustomChargeForm from "@/components/payment/CustomChargeForm";
import BankTransferForm from "@/components/payment/BankTransferForm";
import StripePayment from "@/components/payment/StripePayment";
import GuestCheckout from "@/components/payment/GuestCheckout";
import { PaymentMethodOption } from "@/lib/types";
import { User } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentsProps {
  user: User | null;
}

export default function Payments({ user }: PaymentsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodOption | null>(null);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [paymentMode, setPaymentMode] = useState<'standard' | 'custom'>('standard');
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'guest-info' | 'payment'>('selection');
  const [guestInfo, setGuestInfo] = useState<any>(null);

  // Define available payment methods
  const paymentMethods: PaymentMethodOption[] = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Credit/Debit Card Processing",
      icon: "fab fa-stripe",
      iconColor: "primary",
      isAvailable: true
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pay with your PayPal account",
      icon: "fab fa-paypal",
      iconColor: "blue",
      isAvailable: true
    },
    {
      id: "crypto",
      name: "Cryptocurrency",
      description: "Pay with crypto currencies",
      icon: "fab fa-bitcoin",
      iconColor: "yellow",
      isAvailable: false,
      comingSoon: true
    },
    {
      id: "bank",
      name: "Bank Transfer",
      description: "Direct bank transfer with instant verification",
      icon: "fas fa-university",
      iconColor: "green",
      isAvailable: true
    }
  ];

  // Simple payment amount state
  const [paymentAmount, setPaymentAmount] = useState(999.99);

  // Bank transfer mutation
  const bankTransferMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!user) throw new Error("User not authenticated");

      // Calculate the amount based on the payment mode
      const amount = paymentMode === 'custom' && customAmount ? customAmount : paymentAmount;
      const description = paymentMode === 'custom' ? "Custom charge via Bank Transfer" : "AMKUSH Store Purchase via Bank Transfer";
      
      // For bank transfers, we directly create a transaction on the server
      const response = await apiRequest("POST", `/api/payments/create-payment-intent?userId=${user.id}`, {
        amount: amount,
        currency: "USD",
        description: description,
        paymentMethod: "bank",
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
        accountHolder: formData.accountHolder,
        saveDetails: formData.saveDetails
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bank Transfer Initiated!",
        description: `Transaction #${data.transactionId.substring(0,8)} has been initiated. Please allow 1-3 business days for processing.`,
        variant: "default",
      });
      
      setTimeout(() => {
        setLocation("/history");
      }, 2000);
    },
    onError: (error) => {
      // Detailed error handling with specific error messages
      let errorMessage = "An error occurred during payment processing.";
      
      if (error instanceof Error) {
        if (error.message.includes("bank")) {
          errorMessage = "Bank transfer failed. Please check your bank details and try again.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("authentication")) {
          errorMessage = "Authentication failed. Please try a different payment method.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });
  
  // Guest checkout helper functions are defined later in the file

  const handleMethodSelect = (method: PaymentMethodOption) => {
    setSelectedMethod(method);
  };
  
  const handleCustomAmountChange = (amount: number) => {
    setCustomAmount(amount);
    // When a custom amount is selected, make sure we're in the custom payment mode
    setPaymentMode('custom');
    
    toast({
      title: "Custom Amount Set",
      description: `Custom charge amount set to $${amount.toFixed(2)}`,
    });
  };
  
  // Handle guest checkout information submission
  const handleGuestInfoSubmit = (customerInfo: any) => {
    setGuestInfo(customerInfo);
    setCheckoutStep('payment');
    
    toast({
      title: "Customer Information Saved",
      description: "Your information has been saved. Please proceed with payment.",
    });
  };
  
  // Cancel guest checkout and return to method selection
  const handleGuestInfoCancel = () => {
    setCheckoutStep('selection');
    
    toast({
      title: "Checkout Cancelled",
      description: "Guest checkout has been cancelled.",
      variant: "destructive",
    });
  };
  
  // Guest checkout mutation
  const guestCheckoutMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      if (!guestInfo) throw new Error("Customer information is required");
      
      // Calculate the amount based on the payment mode
      const amount = paymentMode === 'custom' && customAmount ? customAmount : paymentAmount;
      const description = paymentMode === 'custom' ? "Custom charge" : "AMKUSH Store Purchase";
      
      // Send payment request with guest info instead of user ID
      const response = await apiRequest("POST", "/api/payments/guest-checkout", {
        amount,
        currency: "USD",
        description,
        paymentMethod: selectedMethod?.id,
        paymentData,
        customerInfo: guestInfo
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Successful!",
        description: `Transaction #${data.transactionId || '0000000'} has been processed successfully.`,
        variant: "default",
      });
      
      // Reset form after successful payment
      setCheckoutStep('selection');
      setGuestInfo(null);
      setSelectedMethod(null);
    },
    onError: (error) => {
      let errorMessage = "An error occurred during payment processing.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-indigo-700 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
        </div>
        
        {/* Animation elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-24 h-24 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-[40%] right-[10%] w-32 h-32 bg-pink-500/10 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-[15%] left-[30%] w-36 h-36 bg-blue-500/10 rounded-full blur-3xl animate-float-slower"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block p-1.5 px-3 rounded-full bg-white/10 backdrop-blur-sm mb-6 border border-white/20">
              <span className="text-sm font-medium text-white flex items-center">
                <i className="fas fa-shield-alt mr-2 text-primary-300"></i>
                Secure & Trusted Payment Platform
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-fade-in-down leading-tight">
              AMKUSH <span className="text-primary-300">Payment</span> Processing
            </h1>
            <p className="text-lg md:text-xl text-white/80 md:max-w-xl mx-auto animate-fade-in-up mb-8">
              Secure, reliable payment solutions with multiple payment options and customizable charges
            </p>
            <div className="inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <i className="fab fa-paypal text-sm"></i>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  <i className="fab fa-cc-visa text-sm"></i>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                  <i className="fab fa-cc-mastercard text-sm"></i>
                </div>
              </div>
              <span className="text-xs text-white ml-2">Multiple payment methods supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="bg-white dark:bg-gray-800 py-6 md:py-8 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="p-4 rounded-xl hover-lift bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border border-gray-100 dark:border-gray-700 flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                <i className="fas fa-shield-alt text-primary-500 text-xl"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Secure Transactions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">End-to-end encryption & security</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl hover-lift bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border border-gray-100 dark:border-gray-700 flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                <i className="fas fa-globe text-primary-500 text-xl"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Global Support</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Multiple currencies & languages</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl hover-lift bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border border-gray-100 dark:border-gray-700 flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                <i className="fas fa-bolt text-primary-500 text-xl"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Fast Processing</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Instant payment confirmation</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl hover-lift bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border border-gray-100 dark:border-gray-700 flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                <i className="fas fa-headset text-primary-500 text-xl"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">24/7 Support</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Always available customer service</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-12 flex-grow max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-12 animate-slide-up">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700 overflow-hidden">
              <Tabs defaultValue="standard" className="mb-8" onValueChange={(value) => setPaymentMode(value as 'standard' | 'custom')}>
                <TabsList className="grid w-full grid-cols-2 mb-6 p-1.5 gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <TabsTrigger value="standard" className="text-base py-3 px-4 rounded-lg data-[state=active]:shadow-md overflow-hidden whitespace-nowrap">
                    <i className="fas fa-credit-card mr-2"></i> Standard Payment
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="text-base py-3 px-4 rounded-lg data-[state=active]:shadow-md overflow-hidden whitespace-nowrap">
                    <i className="fas fa-sliders-h mr-2"></i> Custom Charge
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="standard" className="pt-4 animate-fade-in">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
                      Standard Payment
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Complete your transaction using our standard payment options
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300">
                      <div className="flex items-center">
                        <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                        <span className="font-medium">Payment Amount: ${paymentAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <PaymentMethodSelector
                    methods={paymentMethods}
                    onMethodSelect={handleMethodSelect}
                    selectedMethod={selectedMethod?.id}
                  />
                  
                  {selectedMethod && selectedMethod.id === "stripe" && (
                    <div className="mt-8 p-6 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <h3 className="text-lg font-semibold mb-4 text-primary-900 dark:text-white">
                        <i className="fab fa-stripe text-blue-500 mr-2"></i> Card Payment Details
                      </h3>
                      <div className="pb-10">
                        {/* Show guest checkout flow if user is not logged in and not already in checkout step */}
                        {!user && checkoutStep === 'selection' && (
                          <div className="text-center py-6">
                            <p className="mb-4 text-gray-600 dark:text-gray-300">
                              Continue as a guest to complete your payment
                            </p>
                            <button
                              onClick={() => setCheckoutStep('guest-info')}
                              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <i className="fas fa-user-alt mr-2"></i> Continue as Guest
                            </button>
                          </div>
                        )}
                        
                        {/* Guest information form */}
                        {!user && checkoutStep === 'guest-info' && (
                          <div className="py-4">
                            <GuestCheckout
                              onComplete={handleGuestInfoSubmit}
                              onCancel={handleGuestInfoCancel}
                            />
                          </div>
                        )}
                        
                        {/* Payment form for guests after they've entered their info */}
                        {!user && checkoutStep === 'payment' && guestInfo && (
                          <div className="py-4">
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300">
                              <h3 className="font-medium mb-2">Customer Information</h3>
                              <p className="text-sm">{guestInfo.fullName} • {guestInfo.email} • {guestInfo.phone}</p>
                              <p className="text-xs mt-2">{guestInfo.address}, {guestInfo.city}, {guestInfo.country}</p>
                            </div>
                            
                            <StripePayment
                              amount={paymentAmount}
                              onSuccess={(paymentIntent) => {
                                // Process guest checkout using the mutation
                                guestCheckoutMutation.mutate({
                                  paymentIntentId: paymentIntent.id,
                                  amount: paymentAmount
                                });
                              }}
                              onError={(error) => {
                                toast({
                                  title: "Payment Failed",
                                  description: error.message || "There was an error processing your payment. Please try again.",
                                  variant: "destructive",
                                });
                              }}
                              loading={guestCheckoutMutation.isPending}
                            />
                          </div>
                        )}
                        
                        {/* Regular payment form for logged in users */}
                        {user && (
                          <StripePayment
                            amount={paymentAmount}
                            userId={user.id}
                            onSuccess={(paymentIntent) => {
                              toast({
                                title: "Payment Successful!",
                                description: `Transaction #${paymentIntent.id.substring(0,8)} has been processed successfully. A confirmation email will be sent shortly.`,
                                variant: "default",
                              });
                              
                              setTimeout(() => {
                                setLocation("/history");
                              }, 2000);
                            }}
                            onError={(error) => {
                              toast({
                                title: "Payment Failed",
                                description: error.message || "There was an error processing your payment. Please try again.",
                                variant: "destructive",
                              });
                            }}
                            loading={false}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedMethod && selectedMethod.id === "paypal" && (
                    <div className="mt-8 p-6 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <h3 className="text-lg font-semibold mb-4 text-primary-900 dark:text-white">
                        <i className="fab fa-paypal text-blue-600 mr-2"></i> PayPal Payment
                      </h3>
                      {/* Show guest checkout flow if user is not logged in and not already in checkout step */}
                      {!user && checkoutStep === 'selection' && (
                        <div className="text-center py-6">
                          <p className="mb-4 text-gray-600 dark:text-gray-300">
                            Continue as a guest to complete your payment
                          </p>
                          <button
                            onClick={() => setCheckoutStep('guest-info')}
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <i className="fas fa-user-alt mr-2"></i> Continue as Guest
                          </button>
                        </div>
                      )}
                      
                      {/* Guest information form */}
                      {!user && checkoutStep === 'guest-info' && (
                        <div className="py-4">
                          <GuestCheckout
                            onComplete={handleGuestInfoSubmit}
                            onCancel={handleGuestInfoCancel}
                          />
                        </div>
                      )}
                      
                      {/* Payment form for guests after they've entered their info */}
                      {!user && checkoutStep === 'payment' && guestInfo && (
                        <div className="py-4">
                          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300">
                            <h3 className="font-medium mb-2">Customer Information</h3>
                            <p className="text-sm">{guestInfo.fullName} • {guestInfo.email} • {guestInfo.phone}</p>
                            <p className="text-xs mt-2">{guestInfo.address}, {guestInfo.city}, {guestInfo.country}</p>
                          </div>
                          
                          <PayPalPayment 
                            amount={paymentAmount}
                            onSuccess={async (details) => {
                              // Process guest checkout using the mutation
                              guestCheckoutMutation.mutate({
                                orderID: details.id,
                                payerID: details.payer.payer_id,
                                amount: paymentAmount
                              });
                            }}
                            onError={(error) => {
                              toast({
                                title: "Payment Failed",
                                description: error.message || "There was an error processing your payment. Please try again.",
                                variant: "destructive",
                              });
                            }}
                            loading={guestCheckoutMutation.isPending}
                          />
                        </div>
                      )}
                      
                      {/* Regular payment form for logged in users */}
                      {user && (
                        <PayPalPayment 
                          amount={paymentAmount}
                          onSuccess={async (details) => {
                            try {
                              // Process the PayPal payment on the server
                              const response = await apiRequest("POST", `/api/payments/process-paypal-payment?userId=${user.id}`, {
                                orderID: details.id,
                                payerID: details.payer.payer_id,
                                amount: paymentAmount,
                                description: "AMKUSH Store Purchase via PayPal",
                                savePaymentMethod: false
                              });
                              
                              const data = await response.json();

                              if (data.success) {
                                toast({
                                  title: "PayPal Payment Successful",
                                  description: `Transaction #${data.transactionId.substring(0,8)} has been processed successfully. A confirmation email will be sent shortly.`,
                                  variant: "default",
                                });
                                
                                setTimeout(() => {
                                  setLocation("/history");
                                }, 2000);
                              } else {
                                throw new Error(data.message || "Payment processing failed");
                              }
                            } catch (err) {
                              console.error("Error processing PayPal payment", err);
                              toast({
                                title: "Payment Processing Error",
                                description: err instanceof Error ? err.message : "An error occurred during payment processing.",
                                variant: "destructive",
                              });
                            }
                          }}
                          onError={(error) => {
                            // Detailed PayPal error handling
                            let errorMessage = "An error occurred during PayPal payment processing.";
                            
                            if (error && typeof error === 'object') {
                              if ('message' in error) {
                                errorMessage = error.message as string;
                              } else if ('details' in error) {
                                errorMessage = "PayPal error: " + (error.details as any);
                              }
                            }
                            
                            toast({
                              title: "PayPal Payment Failed",
                              description: errorMessage,
                              variant: "destructive",
                            });
                          }}
                          loading={false}
                        />
                      )}
                    </div>
                  )}
                  
                  {selectedMethod && selectedMethod.id === "bank" && (
                    <div className="mt-8 p-6 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <h3 className="text-lg font-semibold mb-4 text-primary-900 dark:text-white">
                        <i className="fas fa-university text-green-600 mr-2"></i> Bank Transfer
                      </h3>
                      <BankTransferForm 
                        onSubmit={(values) => {
                          bankTransferMutation.mutate({ 
                            ...values, 
                            saveCard: values.saveDetails 
                          });
                        }}
                        amount={paymentAmount}
                        loading={bankTransferMutation.isPending}
                      />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="custom" className="pt-4 animate-fade-in">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
                      Custom Charge
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Set your own payment amount and complete your transaction
                    </p>
                  </div>
                  
                  <CustomChargeForm 
                    onSubmit={handleCustomAmountChange}
                    minAmount={10}
                    maxAmount={10000}
                    defaultAmount={100}
                  />
                  
                  {customAmount && (
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 animate-fade-in">
                      <h3 className="text-xl font-semibold mb-4 text-primary-900 dark:text-white">
                        Select Payment Method for Custom Charge
                      </h3>
                      
                      <PaymentMethodSelector
                        methods={paymentMethods}
                        onMethodSelect={handleMethodSelect}
                        selectedMethod={selectedMethod?.id}
                      />
                      
                      {selectedMethod && selectedMethod.id === "stripe" && (
                        <div className="mt-8 p-6 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <h3 className="text-lg font-semibold mb-4 text-primary-900 dark:text-white">
                            <i className="fab fa-stripe text-blue-500 mr-2"></i> Card Payment Details
                          </h3>
                          <div className="pb-10">
                            {user && customAmount && (
                              <StripePayment
                                amount={customAmount}
                                userId={user.id}
                                onSuccess={(paymentIntent) => {
                                  toast({
                                    title: "Payment Successful!",
                                    description: `Transaction #${paymentIntent.id.substring(0,8)} has been processed successfully. A confirmation email will be sent shortly.`,
                                    variant: "default",
                                  });
                                  
                                  setTimeout(() => {
                                    setLocation("/history");
                                  }, 2000);
                                }}
                                onError={(error) => {
                                  toast({
                                    title: "Payment Failed",
                                    description: error.message || "There was an error processing your payment. Please try again.",
                                    variant: "destructive",
                                  });
                                }}
                                loading={false}
                              />
                            )}
                          </div>
                        </div>
                      )}
                      
                      {selectedMethod && selectedMethod.id === "bank" && (
                        <div className="mt-8 p-6 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <h3 className="text-lg font-semibold mb-4 text-primary-900 dark:text-white">
                            <i className="fas fa-university text-green-600 mr-2"></i> Bank Transfer
                          </h3>
                          <BankTransferForm 
                            onSubmit={(values) => {
                              bankTransferMutation.mutate({ 
                                ...values, 
                                saveCard: values.saveDetails 
                              });
                            }}
                            amount={customAmount || 0}
                            loading={bankTransferMutation.isPending}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}