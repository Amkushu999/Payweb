import { Transaction } from "@shared/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  onViewReceipt?: (transaction: Transaction) => void;
  onRetry?: (transaction: Transaction) => void;
}

export default function TransactionList({ 
  transactions, 
  onViewReceipt, 
  onRetry 
}: TransactionListProps) {
  const [visibleTransactions, setVisibleTransactions] = useState(5);
  
  const loadMore = () => {
    setVisibleTransactions(prev => prev + 5);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getPaymentMethodIcon = (paymentMethod: string, cardBrand?: string | null) => {
    if (paymentMethod === 'stripe' && cardBrand) {
      switch (cardBrand.toLowerCase()) {
        case 'visa':
          return <i className="fab fa-cc-visa text-blue-800 mr-2"></i>;
        case 'mastercard':
          return <i className="fab fa-cc-mastercard text-red-500 mr-2"></i>;
        case 'amex':
          return <i className="fab fa-cc-amex text-blue-500 mr-2"></i>;
        case 'discover':
          return <i className="fab fa-cc-discover text-orange-500 mr-2"></i>;
        default:
          return <i className="fas fa-credit-card text-gray-500 mr-2"></i>;
      }
    }
    
    if (paymentMethod === 'paypal') {
      return <i className="fab fa-paypal text-blue-500 mr-2"></i>;
    }
    
    return <i className="fas fa-credit-card text-gray-500 mr-2"></i>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="animate-slide-up">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-primary-900 dark:text-white">Recent Transactions</h2>
        {transactions.length > visibleTransactions && (
          <Button variant="link" onClick={() => setVisibleTransactions(transactions.length)}>
            View All
          </Button>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Payment Method</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.slice(0, visibleTransactions).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.createdAt.toString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${parseFloat(transaction.amount.toString()).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(transaction.paymentMethod, transaction.cardBrand)}
                      <span>
                        {transaction.cardLast4 ? `•••• ${transaction.cardLast4}` : transaction.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      getStatusBadgeClass(transaction.status)
                    )}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.status.toLowerCase() === 'completed' && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                        onClick={() => onViewReceipt && onViewReceipt(transaction)}
                      >
                        <i className="fas fa-file-alt mr-1"></i> Receipt
                      </Button>
                    )}
                    {transaction.status.toLowerCase() === 'failed' && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        onClick={() => onRetry && onRetry(transaction)}
                      >
                        <i className="fas fa-redo mr-1"></i> Retry
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {transactions.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
          </div>
        )}
        
        {transactions.length > visibleTransactions && (
          <div className="p-4 text-center">
            <Button variant="outline" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
