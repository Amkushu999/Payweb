import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const bankTransferSchema = z.object({
  accountName: z.string().min(3, "Account name is required"),
  accountNumber: z.string().min(8, "Valid account number is required"),
  routingNumber: z.string().min(9, "Valid routing number is required"),
  bankName: z.string().min(2, "Bank name is required"),
  saveDetails: z.boolean().default(false),
  accountType: z.string().optional(),
});

type BankTransferFormValues = z.infer<typeof bankTransferSchema>;

interface BankTransferFormProps {
  onSubmit: (values: BankTransferFormValues) => void;
  amount: number;
  loading?: boolean;
}

export default function BankTransferForm({ onSubmit, amount, loading = false }: BankTransferFormProps) {
  const [bankType, setBankType] = useState("checking");
  
  const form = useForm<BankTransferFormValues>({
    resolver: zodResolver(bankTransferSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: "",
      saveDetails: false,
      accountType: "checking",
    },
  });

  const handleSubmit = (values: BankTransferFormValues) => {
    onSubmit({ ...values, accountType: bankType });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-info-circle text-blue-600 dark:text-blue-400"></i>
            </div>
            <div className="ml-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Instant Bank Transfer</h4>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Your account will be charged immediately and funds will be transferred securely.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="accountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="Bank of America" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="routingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Routing Number</FormLabel>
                <FormControl>
                  <Input placeholder="123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4 mt-2">
          <Label>Account Type</Label>
          <div className="flex space-x-4">
            <Button
              type="button"
              variant={bankType === "checking" ? "default" : "outline"}
              onClick={() => setBankType("checking")}
              className="flex-1"
            >
              <i className="fas fa-university mr-2"></i> Checking
            </Button>
            <Button
              type="button"
              variant={bankType === "savings" ? "default" : "outline"}
              onClick={() => setBankType("savings")}
              className="flex-1"
            >
              <i className="fas fa-piggy-bank mr-2"></i> Savings
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="saveDetails"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm mt-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Save bank details</FormLabel>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Save your bank information for future payments
                </p>
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

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm mt-4 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-xl font-bold mb-2 flex justify-between">
            <span>Amount to Pay:</span>
            <span className="text-primary-600 dark:text-primary-400">${amount.toFixed(2)}</span>
          </h3>
        </div>

        <Button
          type="submit"
          className="w-full py-6 text-lg font-semibold mt-4"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-university mr-2"></i> Pay with Bank Transfer
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}