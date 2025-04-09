import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckout from './StripeCheckout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe with public key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface StripePaymentProps {
  amount: number;
  userId?: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
  loading?: boolean;
}

const StripePayment: React.FC<StripePaymentProps> = ({ 
  amount, 
  userId, 
  onSuccess, 
  onError,
  loading = false
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!stripePromise) {
      setError('Stripe API key is not configured');
      return;
    }

    const fetchPaymentIntent = async () => {
      try {
        const response = await apiRequest(
          'POST',
          `/api/payments/create-payment-intent${userId ? `?userId=${userId}` : ''}`,
          {
            amount,
            currency: 'USD',
            description: 'AMKUSH Store Purchase',
            paymentMethod: 'stripe'
          }
        );

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
        if (err instanceof Error) {
          onError(err);
        } else {
          onError(new Error('Failed to initialize payment'));
        }
      }
    };

    fetchPaymentIntent();
  }, [amount, userId, onError]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <p className="font-medium">Payment Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <div className="w-full py-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckout 
        clientSecret={clientSecret}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        loading={loading}
      />
    </Elements>
  );
};

export default StripePayment;