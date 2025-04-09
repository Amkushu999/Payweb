import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TransactionList from "@/components/transaction/TransactionList";
import { User, Transaction } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentHistoryProps {
  user: User | null;
}

export default function PaymentHistory({ user }: PaymentHistoryProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ['/api/payments/transactions', user?.id],
    queryFn: async () => {
      if (!user) return { transactions: [] };
      const res = await fetch(`/api/payments/transactions?userId=${user.id}`);
      return await res.json();
    },
    enabled: !!user,
  });

  const transactions = transactionsData?.transactions || [];

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === "all") return true;
    return transaction.status.toLowerCase() === activeTab;
  });

  const handleViewReceipt = (transaction: Transaction) => {
    toast({
      title: "Receipt",
      description: `Viewing receipt for transaction ${transaction.transactionId}`,
    });
  };

  const handleRetry = (transaction: Transaction) => {
    toast({
      title: "Retry Payment",
      description: `Retrying payment for transaction ${transaction.transactionId}`,
    });
  };

  // Calculate stats
  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const processingCount = transactions.filter(t => t.status === 'processing').length;
  const failedCount = transactions.filter(t => t.status === 'failed').length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white">
            Payment History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            View and manage your transaction history
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900 dark:text-white">{completedCount}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900 dark:text-white">{processingCount}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900 dark:text-white">{failedCount}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Transaction Tabs and List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-8">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <TransactionList 
                  transactions={filteredTransactions} 
                  onViewReceipt={handleViewReceipt}
                  onRetry={handleRetry}
                />
              )}
              
              {!isLoading && filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No transactions found</p>
                  <Button>Make a Payment</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
