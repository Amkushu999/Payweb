import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderSummary as OrderSummaryType, OrderItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, MinusCircle, Edit2, Save } from "lucide-react";

interface OrderSummaryProps {
  orderSummary: OrderSummaryType;
  onPromoApply?: (code: string) => void;
  onOrderChange?: (items: OrderItem[]) => void;
}

export default function OrderSummary({ orderSummary, onPromoApply, onOrderChange }: OrderSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableItems, setEditableItems] = useState<OrderItem[]>(orderSummary.items);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim() && onPromoApply) {
      onPromoApply(promoCode);
    }
  };
  
  const saveChanges = () => {
    setIsEditing(false);
    if (onOrderChange) {
      onOrderChange(editableItems);
    }
  };
  
  const handleItemNameChange = (id: string, newName: string) => {
    setEditableItems(items => 
      items.map(item => 
        item.id === id ? { ...item, name: newName } : item
      )
    );
  };
  
  const handleItemPriceChange = (id: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price)) {
      setEditableItems(items => 
        items.map(item => 
          item.id === id ? { ...item, price } : item
        )
      );
    }
  };
  
  const addNewItem = () => {
    const price = parseFloat(newItemPrice);
    if (newItemName.trim() && !isNaN(price) && price > 0) {
      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        name: newItemName,
        price: price
      };
      setEditableItems([...editableItems, newItem]);
      setNewItemName("");
      setNewItemPrice("");
    }
  };
  
  const removeItem = (id: string) => {
    setEditableItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 overflow-hidden relative">
      <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary-100/30 dark:bg-primary-900/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 right-0 w-24 h-48 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-xl"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-purple-700 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">Order Summary</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Review your order details</p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="flex items-center text-xs"
              >
                <Edit2 className="mr-1 h-3 w-3" /> Edit Items
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={saveChanges}
                className="flex items-center text-xs"
              >
                <Save className="mr-1 h-3 w-3" /> Save Changes
              </Button>
            )}
            <Badge variant="secondary" className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 badge-glow">
              <i className="fas fa-shield-alt mr-1"></i> Secure
            </Badge>
          </div>
        </div>
      
        <div className="space-y-5 mb-6">
          {isEditing ? (
            // Editable items list
            <>
              {editableItems.map((item) => (
                <div key={item.id} className="flex justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center flex-grow mr-2">
                    <Input
                      value={item.name}
                      onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                      className="text-sm h-8 mr-2 w-full max-w-[180px]"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">$</span>
                    <Input
                      type="number"
                      value={item.price.toString()}
                      onChange={(e) => handleItemPriceChange(item.id, e.target.value)}
                      className="text-sm h-8 w-20"
                      min="0"
                      step="0.01"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2 h-8 w-8 text-red-500" 
                      onClick={() => removeItem(item.id)}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Add new item form */}
              <div className="flex items-center justify-between mt-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center flex-grow mr-2">
                  <Input
                    placeholder="New item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="text-sm h-8 mr-2 w-full max-w-[180px]"
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-1">$</span>
                  <Input
                    type="number"
                    placeholder="Price"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="text-sm h-8 w-20"
                    min="0"
                    step="0.01"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2 h-8 w-8 text-green-500" 
                    onClick={addNewItem}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Read-only items list
            editableItems.map((item) => (
              <div key={item.id} className="flex justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <i className="fas fa-info-circle ml-2 text-gray-400 cursor-help"></i>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">{item.id === 'premium' ? 'Premium plan includes all features and prioritized support' : 'Exclusive advanced features'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">${item.price.toFixed(2)}</span>
              </div>
            ))
          )}
          
          <div className="flex justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Subtotal</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">${orderSummary.subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Taxes</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <i className="fas fa-info-circle ml-2 text-gray-400 cursor-help"></i>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Taxes are calculated based on your location</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">${orderSummary.taxes.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between py-4 bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 rounded-lg px-5 border border-primary-100 dark:border-primary-800/30">
            <span className="text-gray-900 dark:text-white font-bold flex items-center">
              <i className="fas fa-calculator text-primary-500 mr-2"></i>
              Total Amount
            </span>
            <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">${orderSummary.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg p-5 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <i className="fas fa-tag text-primary-500 mr-2"></i>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Promotional Code</span>
            </div>
            <Badge variant="outline" className="text-xs bg-primary-100/50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800">
              Save up to 20%
            </Badge>
          </div>
          <form className="flex" onSubmit={handlePromoSubmit}>
            <Input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-grow rounded-r-none border-primary-100 dark:border-primary-900/30 focus:ring-primary-300 dark:bg-gray-800"
            />
            <Button type="submit" className="rounded-l-none">
              Apply
            </Button>
          </form>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            *Enter promo code to get special discounts and offers
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-4">
          <h3 className="font-bold text-base text-primary-900 dark:text-white mb-4 flex items-center">
            <i className="fas fa-headset text-primary-500 mr-2"></i> Customer Support
          </h3>
          <div className="space-y-3">
            <a href="#" className="flex items-center p-3 text-sm text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                <i className="fas fa-question-circle text-primary-500"></i>
              </div>
              <span>Frequently Asked Questions</span>
            </a>
            <a href="#" className="flex items-center p-3 text-sm text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                <i className="fas fa-envelope text-primary-500"></i>
              </div>
              <span>Contact Support Team</span>
            </a>
            <a href="#" className="flex items-center p-3 text-sm text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                <i className="fas fa-phone text-primary-500"></i>
              </div>
              <div>
                <span className="block">Call Us 24/7</span>
                <span className="text-primary-600 dark:text-primary-400">+1 234 567 8900</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}