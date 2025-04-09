import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CustomChargeFormProps {
  onSubmit: (amount: number) => void;
  minAmount?: number;
  maxAmount?: number;
  defaultAmount?: number;
}

export default function CustomChargeForm({
  onSubmit,
  minAmount = 5,
  maxAmount = 10000,
  defaultAmount = 100
}: CustomChargeFormProps) {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [customAmount, setCustomAmount] = useState<string>(defaultAmount.toString());
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const { toast } = useToast();

  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  const handleAmountChange = (newValue: number[]) => {
    setAmount(newValue[0]);
    setCustomAmount(newValue[0].toString());
    setIsCustom(false);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= minAmount && numValue <= maxAmount) {
      setAmount(numValue);
    }
    
    setIsCustom(true);
  };

  const handlePresetClick = (presetAmount: number) => {
    setAmount(presetAmount);
    setCustomAmount(presetAmount.toString());
    setIsCustom(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = isCustom ? parseFloat(customAmount) : amount;
    
    if (isNaN(finalAmount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }
    
    if (finalAmount < minAmount) {
      toast({
        title: "Amount Too Low",
        description: `Minimum amount is $${minAmount.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }
    
    if (finalAmount > maxAmount) {
      toast({
        title: "Amount Too High",
        description: `Maximum amount is $${maxAmount.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(finalAmount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary-900 dark:text-white">Custom Charge Amount</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {presetAmounts.map((presetAmount) => (
                <Button
                  key={presetAmount}
                  type="button"
                  variant={amount === presetAmount && !isCustom ? "default" : "secondary"}
                  onClick={() => handlePresetClick(presetAmount)}
                  className="w-full"
                >
                  ${presetAmount}
                </Button>
              ))}
            </div>
            
            <div className="mb-6">
              <Label htmlFor="custom-amount" className="mb-2 block">Custom Amount:</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</div>
                <Input
                  id="custom-amount"
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="pl-8"
                  placeholder="Enter custom amount"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <Label className="mb-2 block">Adjust Amount:</Label>
              <Slider
                value={[amount]}
                min={minAmount}
                max={maxAmount}
                step={1}
                onValueChange={handleAmountChange}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>${minAmount}</span>
                <span>${maxAmount}</span>
              </div>
            </div>
          </div>
          
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              You will be charged: <strong className="text-lg">${parseFloat(isCustom ? customAmount : amount.toString()).toFixed(2)}</strong>
            </AlertDescription>
          </Alert>
          
          <Button type="submit" className="w-full">
            Proceed with Custom Charge
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}