import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PayPalPaymentProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  loading?: boolean;
}

export default function PayPalPayment({ 
  amount, 
  onSuccess, 
  onError,
  loading = false
}: PayPalPaymentProps) {
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const { toast } = useToast();
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  
  if (!clientId) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
        <p className="font-medium">PayPal Client ID is missing</p>
        <p className="text-sm mt-1">
          Please make sure the VITE_PAYPAL_CLIENT_ID environment variable is set.
        </p>
      </div>
    );
  }

  // Configure PayPal with options to enable credit card direct payments
  // PayPal configuration optimized for direct card payments
  const initialOptions = {
    clientId: clientId,
    currency: "USD",
    intent: "capture",
    "enable-funding": "card",
    "disable-funding": "paylater,credit",
    commit: true,
    "data-pay-now-flow": "true", // Enables direct card payment flow
    components: "buttons,payment-fields,marks",
  };

  // Handle order creation - optimized for direct card payments
  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      intent: "CAPTURE",
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        brand_name: "AMKUSH Payments",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        },
        checkout_payment_flow: "GUEST_CHECKOUT", // Encourage guest checkout flow
      },
      purchase_units: [
        {
          amount: {
            value: amount.toFixed(2),
            currency_code: "USD",
            breakdown: {
              item_total: {
                value: amount.toFixed(2),
                currency_code: "USD"
              }
            }
          },
          description: "AMKUSH Payment Processing",
          soft_descriptor: "AMKUSH Store"
        },
      ],
    });
  };

  // Handle payment approval
  const handleApprove = async (data: any, actions: any) => {
    if (!actions.order) {
      toast({
        title: "Payment Error",
        description: "There was an issue with your payment.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First capture the funds
      const details = await actions.order.capture();
      
      // Log the payment details for debugging
      console.log("PayPal payment details:", JSON.stringify(details, null, 2));
      
      // Get payment method info - check if it's a card payment
      const paymentSource = details.payment_source || {};
      console.log("Payment source:", paymentSource);
      
      const isCardPayment = !!paymentSource.card;
      const cardInfo = isCardPayment ? paymentSource.card : null;
      
      if (isCardPayment) {
        console.log("Card payment detected:", cardInfo);
      } else {
        console.log("Regular PayPal payment detected");
      }
      
      // Then process on our backend (use guest checkout with userId=0 for anonymous users)
      const response = await fetch(`/api/payments/process-paypal-payment?userId=0`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          payerID: data.payerID,
          amount: amount,
          savePaymentMethod,
          paypalEmail: details.payer?.email_address,
          isCardPayment,
          // Include card details (masked) for the transaction record if it's a card payment
          cardInfo: cardInfo ? {
            last4: cardInfo.last_digits,
            brand: cardInfo.brand,
            paymentMethod: "card_via_paypal"
          } : null,
          description: isCardPayment ? "Credit Card Payment via PayPal" : "PayPal Account Payment"
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process payment on server');
      }
      
      const result = await response.json();
      onSuccess({
        ...details,
        ...result,
        savePaymentMethod
      });
    } catch (error) {
      console.error('PayPal payment processing error:', error);
      toast({
        title: "Payment Processing Error",
        description: error instanceof Error ? error.message : "There was an error processing your payment on our server.",
        variant: "destructive",
      });
      onError(error);
    }
  };

  // Handle payment errors
  const handleError = (err: any) => {
    toast({
      title: "PayPal Error",
      description: "There was an error processing your payment.",
      variant: "destructive",
    });
    onError(err);
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
        <i className="fas fa-credit-card text-blue-600 mr-2"></i>
        Pay with Card (via PayPal)
      </h3>
      
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center mb-2">
          <i className="fas fa-info-circle text-blue-500 mr-2"></i>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Direct Card Payment - No PayPal Account Needed
          </p>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Pay directly with your credit or debit card. All payments will be processed securely through
          PayPal, but <strong>you do NOT need to create or log into a PayPal account</strong>.
        </p>
        <div className="mt-3">
          <div className="flex flex-wrap gap-2 mb-2">
            <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/cc-badges-ppmcvdam.png" alt="Credit Card Badges" className="h-8" />
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 italic">
            When you click "Pay with Card" below, you'll have the option to enter your card details directly.
          </p>
        </div>
      </div>
      
      <div className="pt-4">
        <PayPalScriptProvider options={initialOptions}>
          <div className="min-h-[200px] flex items-center justify-center">
            {loading ? (
              <div className="animate-pulse flex flex-col items-center p-4">
                <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : (
              <>
                <div className="mb-4 text-center">
                  <span className="inline-block px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                    Click "Pay with Card" to enter your card details
                  </span>
                </div>
                <div className="border-2 border-green-500 rounded-md p-1">
                  <PayPalButtons
                    fundingSource="card"
                    style={{ 
                      layout: "vertical",
                      color: "black",
                      shape: "rect",
                      label: "pay",
                      height: 55,
                      tagline: false
                    }}
                    createOrder={createOrder}
                    onApprove={handleApprove}
                    onError={handleError}
                  />
                  <div className="text-center -mt-1 mb-1">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      Enter your card details directly ↑
                    </span>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">- OR -</p>
                  <PayPalButtons
                    fundingSource="paypal"
                    style={{ 
                      layout: "vertical",
                      color: "blue",
                      shape: "rect",
                      label: "paypal",
                      height: 40
                    }}
                    createOrder={createOrder}
                    onApprove={handleApprove}
                    onError={handleError}
                  />
                </div>
              </>
            )}
          </div>
        </PayPalScriptProvider>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="save-paypal" 
          checked={savePaymentMethod}
          onCheckedChange={(checked) => setSavePaymentMethod(checked as boolean)}
        />
        <Label htmlFor="save-paypal" className="text-sm text-gray-600 dark:text-gray-400">
          Save payment information for future purchases
        </Label>
      </div>
    </div>
  );
}