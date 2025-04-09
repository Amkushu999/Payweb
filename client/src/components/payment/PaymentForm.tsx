import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Card validation schema
const paymentFormSchema = z.object({
  cardNumber: z.string()
    .min(16, "Card number must be 16 digits")
    .regex(/^[0-9 ]+$/, "Card number can only contain numbers"),
  cardExpiry: z.string()
    .min(5, "Expiry date must be in MM/YY format")
    .regex(/^(0[1-9]|1[0-2]) \/ [0-9]{2}$/, "Expiry date must be in MM/YY format"),
  cardCvc: z.string()
    .min(3, "CVC must be 3-4 digits")
    .regex(/^[0-9]{3,4}$/, "CVC must be 3-4 digits"),
  cardName: z.string().min(1, "Cardholder name is required"),
  saveCard: z.boolean().default(false),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (values: PaymentFormValues) => void;
  amount: number;
  loading?: boolean;
}

export default function PaymentForm({ onSubmit, amount, loading = false }: PaymentFormProps) {
  const { toast } = useToast();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      cardName: "",
      saveCard: false,
    },
  });

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date with slash
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)} / ${v.substring(2, 4)}`;
    }
    
    return v;
  };

  const handleSubmit = (values: PaymentFormValues) => {
    onSubmit(values);
  };

  return (
    <div className="mt-8 animate-fade-in">
      <h3 className="text-lg font-medium mb-4 text-primary-900 dark:text-white">Card Information</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="cardNumber">Card Number</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      onChange={(e) => {
                        field.onChange(formatCardNumber(e.target.value));
                      }}
                      maxLength={19} // 16 digits + 3 spaces
                      className="pr-10"
                    />
                  </FormControl>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <i className="fas fa-credit-card text-gray-400"></i>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cardExpiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="cardExpiry">Expiration Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="cardExpiry"
                      placeholder="MM / YY"
                      onChange={(e) => {
                        field.onChange(formatExpiry(e.target.value));
                      }}
                      maxLength={7} // MM / YY format
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardCvc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="cardCvc">CVC</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        id="cardCvc"
                        placeholder="123"
                        maxLength={4}
                        className="pr-10"
                      />
                    </FormControl>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <i className="fas fa-question-circle text-gray-400" title="The 3 or 4 digit security code on the back of your card"></i>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="cardName">Name on Card</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="cardName"
                    placeholder="John Doe"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saveCard"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="saveCard"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="saveCard">
                    Save card for future payments
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <i className="fas fa-lock mr-2"></i>
              <span>Your payment info is secure</span>
            </div>
            
            <Button type="submit" className="px-6 py-3" disabled={loading}>
              <span>Pay ${amount.toFixed(2)}</span>
              {!loading && <i className="fas fa-arrow-right ml-2"></i>}
              {loading && <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
