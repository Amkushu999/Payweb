import { PaymentMethodOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PaymentMethodSelectorProps {
  methods: PaymentMethodOption[];
  onMethodSelect: (method: PaymentMethodOption) => void;
  selectedMethod?: string;
}

export default function PaymentMethodSelector({
  methods,
  onMethodSelect,
  selectedMethod,
}: PaymentMethodSelectorProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-primary-900 dark:text-white flex items-center">
        <i className="fas fa-credit-card text-primary-500 mr-2"></i>
        Select Payment Method
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => method.isAvailable && onMethodSelect(method)}
            className={cn(
              "border rounded-xl p-4 md:p-5 flex items-start space-x-3 md:space-x-4 relative group transition-all duration-300",
              method.isAvailable 
                ? "cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1" 
                : "opacity-60",
              selectedMethod === method.id
                ? "border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            )}
          >
            {/* Selection Indicator */}
            <div className="absolute top-4 right-4">
              {selectedMethod === method.id ? (
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  <i className="fas fa-check text-xs"></i>
                </div>
              ) : (
                <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
              )}
            </div>
            
            {/* Method Icon */}
            <div className={
              cn(
                "flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center shadow-sm",
                method.id === "stripe" ? "bg-blue-50 dark:bg-blue-900/30" :
                method.id === "paypal" ? "bg-blue-50 dark:bg-blue-900/30" :
                method.id === "crypto" ? "bg-yellow-50 dark:bg-yellow-900/30" :
                "bg-green-50 dark:bg-green-900/30"
              )
            }>
              <i className={cn(
                method.icon, "text-2xl",
                method.id === "stripe" ? "text-blue-500" :
                method.id === "paypal" ? "text-blue-700" :
                method.id === "crypto" ? "text-yellow-500" :
                "text-green-500"
              )}></i>
            </div>
            
            {/* Method Details */}
            <div className="flex-1 pt-1 pr-8">
              <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-white">
                {method.name}
                
                {!method.isAvailable && (
                  <Badge variant="outline" className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {method.comingSoon ? 'Coming Soon' : 'Unavailable'}
                  </Badge>
                )}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 md:line-clamp-none">{method.description}</p>
              
              {/* Benefits Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {method.id === "stripe" && (
                  <>
                    <Badge variant="secondary" className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                      <i className="fas fa-lock text-xs mr-1"></i> Secure
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                      <i className="fas fa-bolt text-xs mr-1"></i> Fast
                    </Badge>
                  </>
                )}
                
                {method.id === "paypal" && (
                  <>
                    <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                      <i className="fas fa-shield-alt text-xs mr-1"></i> Protected
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                      <i className="fas fa-globe text-xs mr-1"></i> Global
                    </Badge>
                  </>
                )}
                
                {method.id === "crypto" && method.comingSoon && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                    <i className="fas fa-clock text-xs mr-1"></i> Q2 2025
                  </Badge>
                )}
                
                {method.id === "bank" && (
                  <>
                    <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                      <i className="fas fa-shield-alt text-xs mr-1"></i> Secure
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                      <i className="fas fa-bolt text-xs mr-1"></i> Instant
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Info Message */}
      {selectedMethod && (
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <i className="fas fa-info-circle text-primary-500 mr-2"></i>
            <p className="font-medium text-gray-900 dark:text-white">
              {selectedMethod === "stripe" 
                ? "Card payments are processed securely through Stripe"
                : selectedMethod === "paypal"
                ? "You'll be redirected to PayPal to complete your payment"
                : selectedMethod === "bank"
                ? "Direct bank transfer with instant verification"
                : "You've selected a payment option"}
            </p>
          </div>
          <p>
            {selectedMethod === "stripe" 
              ? "Your card details are encrypted and never stored on our servers."
              : selectedMethod === "paypal"
              ? "You can use your PayPal balance, bank account, or credit card."
              : selectedMethod === "bank"
              ? "Your bank details are protected with enterprise-grade security."
              : "Continue to complete your payment."}
          </p>
        </div>
      )}
    </div>
  );
}
