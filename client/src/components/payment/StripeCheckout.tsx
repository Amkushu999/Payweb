import React, { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface StripeCheckoutProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
  loading?: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError,
  loading = false 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [saveCard, setSaveCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    if (loading || processing) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // These can be collected from the customer if needed
            name: 'AMKUSH Customer',
          },
        },
        save_payment_method: saveCard,
      });

      if (result.error) {
        setCardError(result.error.message || 'An error occurred with your payment');
        onError(new Error(result.error.message || 'Payment failed'));
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess(result.paymentIntent);
      } else {
        // Handle other statuses (requires_action, requires_confirmation, etc.)
        setCardError('Payment processing incomplete. Please try again.');
        onError(new Error('Payment processing incomplete'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      setCardError(error instanceof Error ? error.message : 'An unexpected error occurred');
      onError(error instanceof Error ? error : new Error('Payment processing error'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <CardElement 
          options={CARD_ELEMENT_OPTIONS} 
          onChange={(e) => {
            setCardComplete(e.complete);
            if (e.error) {
              setCardError(e.error.message);
            } else {
              setCardError(null);
            }
          }}
          className="py-3"
        />
      </div>
      
      {cardError && (
        <div className="text-red-600 text-sm mt-1">{cardError}</div>
      )}
      
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="save-card" 
          checked={saveCard} 
          onCheckedChange={(checked) => setSaveCard(checked === true)}
        />
        <Label htmlFor="save-card" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Save card for future payments
        </Label>
      </div>
      
      <div className="mt-6">
        <Button 
          type="submit" 
          disabled={!stripe || !elements || !cardComplete || processing || loading}
          className="w-full"
        >
          {(processing || loading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Pay ${amount.toFixed(2)}
        </Button>
      </div>
    </form>
  );
};

export default StripeCheckout;