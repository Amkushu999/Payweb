import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TransactionList from "@/components/transaction/TransactionList";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface DashboardProps {
  user: User | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const { toast } = useToast();

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

  // Calculate totals
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Welcome to your AMKUSH payment dashboard
          </p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900 dark:text-white">{totalTransactions}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {completedTransactions} completed transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900 dark:text-white">
                ${totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                From completed transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Link href="/payments">
                  <Button size="sm" className="w-full">
                    <i className="fas fa-credit-card mr-2"></i> New Payment
                  </Button>
                </Link>
                <Link href="/history">
                  <Button size="sm" variant="outline" className="w-full">
                    <i className="fas fa-history mr-2"></i> History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Transactions */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <TransactionList 
            transactions={transactions}
            onViewReceipt={handleViewReceipt}
            onRetry={handleRetry}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
