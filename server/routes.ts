import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, paymentSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { ZodError } from "zod";

function generateTransactionId() {
  return `TRX-${Math.floor(Math.random() * 100000)}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real app, we would check hashed password here
      if (user.password !== data.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Remove sensitive data
      const { password, ...safeUser } = user;
      
      return res.status(200).json({
        message: "Login successful",
        user: safeUser
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // In a real app, we would hash the password here
      const { confirmPassword, ...userData } = data;
      const user = await storage.createUser(userData);
      
      // Remove sensitive data
      const { password, ...safeUser } = user;
      
      return res.status(201).json({
        message: "User registered successfully",
        user: safeUser
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/user", async (req: Request, res: Response) => {
    // For demo purposes - in a real app, we would check the session
    const userId = parseInt(req.query.userId as string);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove sensitive data
    const { password, ...safeUser } = user;
    
    return res.status(200).json({ user: safeUser });
  });

  // Payment routes
  app.post("/api/payments/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const data = paymentSchema.parse(req.body);
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Generate unique transaction ID for tracking purposes
      const uniqueTransactionId = generateTransactionId();
      
      // Check for required Stripe API key
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("Missing STRIPE_SECRET_KEY environment variable");
        return res.status(500).json({ message: "Payment processor configuration error: Missing Stripe API key" });
      }
      
      // Load Stripe with API key
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      
      // Create a payment intent with Stripe API
      let paymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(data.amount.toString()) * 100), // Convert to cents
          currency: data.currency.toLowerCase(),
          description: data.description || "AMKUSH Store Purchase",
          metadata: {
            userId: userId.toString(),
            transactionId: uniqueTransactionId
          }
        });
      } catch (stripeErr: any) {
        console.error("Stripe payment intent creation error:", stripeErr);
        return res.status(400).json({ message: "Payment processor error", error: stripeErr.message });
      }
      
      // Extract payment intent details
      const stripePaymentIntentId = paymentIntent.id;
      const clientSecret = paymentIntent.client_secret;
      
      // Create a transaction record in our database
      const transaction = await storage.createTransaction({
        userId,
        transactionId: uniqueTransactionId,
        amount: data.amount.toString(),
        currency: data.currency,
        status: "processing", // Will be updated when payment is confirmed
        paymentMethod: data.paymentMethod,
        description: data.description || "AMKUSH Store Purchase",
        stripePaymentIntentId: stripePaymentIntentId,
      });
      
      // Log transaction creation for audit purposes
      console.log(`[Payment] Created payment intent for transaction ${uniqueTransactionId} | Amount: ${data.amount} ${data.currency} | Method: ${data.paymentMethod}`);
      
      // Return client secret to client for payment confirmation
      return res.status(200).json({
        clientSecret: clientSecret,
        transaction,
        transactionId: uniqueTransactionId
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("[Payment Error]", error);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // PayPal payment route
  app.post("/api/payments/process-paypal-payment", async (req: Request, res: Response) => {
    try {
      const { 
        orderID, 
        payerID, 
        amount, 
        savePaymentMethod, 
        description, 
        items,
        isCardPayment,
        cardInfo 
      } = req.body;
      
      // Parse userId from query string, defaulting to 0 for guest users
      const userId = parseInt(req.query.userId as string) || 0;
      
      if (!orderID || !amount) {
        return res.status(400).json({ message: "Order ID and amount are required" });
      }
      
      // Generate a unique transaction ID for consistent tracking
      const uniqueTransactionId = generateTransactionId();
      
      // Verify PayPal payment with the PayPal API
      if (!process.env.VITE_PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
        console.error("Missing PayPal API credentials");
        return res.status(500).json({ message: "Payment processor configuration error: Missing PayPal API credentials" });
      }
      
      try {
        // Construct PayPal API request
        const verifyEndpoint = 'https://api-m.paypal.com/v2/checkout/orders/' + orderID;
        const auth = Buffer.from(`${process.env.VITE_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
        
        console.log(`[PayPal] Verifying payment for order ${orderID} with amount ${amount}`);
        
        const verifyResponse = await fetch(verifyEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          }
        });
        
        if (!verifyResponse.ok) {
          const errorText = await verifyResponse.text();
          console.error(`[PayPal] API Error (${verifyResponse.status}):`, errorText);
          
          return res.status(400).json({ 
            message: "PayPal API error", 
            status: verifyResponse.status,
            details: errorText
          });
        }
        
        const verifyData = await verifyResponse.json();
        console.log('[PayPal] Verification response:', JSON.stringify(verifyData, null, 2));
        
        // Validate the payment status
        if (verifyData.status !== 'COMPLETED') {
          console.error(`[PayPal] Payment not completed. Status: ${verifyData.status}`);
          return res.status(400).json({ 
            message: "PayPal payment not completed", 
            status: verifyData.status 
          });
        }
        
        // Less strict amount checking (sometimes there are rounding differences)
        const paypalAmount = parseFloat(verifyData.purchase_units[0].amount.value);
        const requestAmount = parseFloat(amount);
        if (Math.abs(paypalAmount - requestAmount) > 0.01) {
          console.error(`[PayPal] Amount mismatch: ${paypalAmount} vs ${requestAmount}`);
          return res.status(400).json({ 
            message: "PayPal payment amount doesn't match", 
            paypalAmount,
            requestAmount
          });
        }
        
        console.log('[PayPal] Payment verification successful');
      } catch (paypalErr: any) {
        console.error('[PayPal] Error verifying payment:', paypalErr);
        return res.status(500).json({ 
          message: "Error verifying PayPal payment", 
          error: paypalErr.message,
          stack: paypalErr.stack
        });
      }
      
      // Create a transaction record in our database with correct payment method details
      const transaction = await storage.createTransaction({
        userId,
        transactionId: uniqueTransactionId,
        amount: amount.toString(),
        currency: "USD",
        status: "completed", // PayPal payments are typically completed immediately
        paymentMethod: isCardPayment ? "card_via_paypal" : "paypal", // Differentiate between card payments and PayPal account payments
        description: description || (isCardPayment ? 
          "Credit Card Payment via PayPal" : 
          "AMKUSH Store Purchase via PayPal"),
        // If this is a card payment, include the card details
        cardLast4: isCardPayment && cardInfo ? cardInfo.last4 || '****' : null,
        cardBrand: isCardPayment && cardInfo ? cardInfo.brand || 'Credit Card' : null,
        stripePaymentIntentId: null,
        paypalOrderId: orderID,
        paypalPayerId: payerID
      });
      
      // Log transaction details for audit purposes
      console.log(`[PayPal Payment] Processed transaction ${uniqueTransactionId} | Amount: $${amount} | Order ID: ${orderID}`);
      if (items && Array.isArray(items)) {
        console.log(`[PayPal Items] Transaction ${uniqueTransactionId} items:`, JSON.stringify(items));
      }
      
      // If user wants to save the payment method for future transactions
      if (savePaymentMethod) {
        // Different handling based on whether it's a card payment through PayPal or a regular PayPal payment
        if (isCardPayment && cardInfo) {
          const paymentMethod = await storage.createPaymentMethod({
            userId,
            type: "card_via_paypal",
            isDefault: false,
            cardLast4: cardInfo.last4 || null,
            cardBrand: cardInfo.brand || "Credit Card",
            paypalEmail: req.body.paypalEmail || null
          });
          
          console.log(`[PayPal Card Payment] Saved card payment method for user ${userId}`);
        } else {
          const paymentMethod = await storage.createPaymentMethod({
            userId,
            type: "paypal",
            isDefault: false,
            paypalEmail: req.body.paypalEmail || null
          });
          
          console.log(`[PayPal Payment] Saved PayPal account payment method for user ${userId}`);
        }
      }
      
      return res.status(200).json({
        success: true,
        transaction,
        transactionId: uniqueTransactionId
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      
      console.error("[PayPal Payment Error]", error);
      return res.status(500).json({ 
        message: "Internal server error processing PayPal payment", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.get("/api/payments/transactions", async (req: Request, res: Response) => {
    // Parse userId from query string, defaulting to 0 for guest users
    const userId = parseInt(req.query.userId as string) || 0;
    
    const transactions = await storage.getTransactions(userId);
    
    return res.status(200).json({ transactions });
  });
  
  app.post("/api/payments/update-transaction", async (req: Request, res: Response) => {
    const { transactionId, status } = req.body;
    const userId = parseInt(req.query.userId as string);
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (!transactionId || !status) {
      return res.status(400).json({ message: "Transaction ID and status are required" });
    }
    
    const transaction = await storage.getTransaction(parseInt(transactionId));
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    if (transaction.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this transaction" });
    }
    
    const updatedTransaction = await storage.updateTransactionStatus(transaction.id, status);
    
    return res.status(200).json({ 
      message: "Transaction updated successfully",
      transaction: updatedTransaction
    });
  });
  
  // Payment methods routes
  app.get("/api/payments/methods", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const paymentMethods = await storage.getPaymentMethods(userId);
    
    return res.status(200).json({ paymentMethods });
  });
  
  app.post("/api/payments/methods", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { type, cardLast4, cardBrand, expiryMonth, expiryYear, isDefault, stripePaymentMethodId } = req.body;
      
      if (!type) {
        return res.status(400).json({ message: "Payment method type is required" });
      }
      
      const paymentMethod = await storage.createPaymentMethod({
        userId,
        type,
        cardLast4,
        cardBrand,
        expiryMonth,
        expiryYear,
        isDefault: isDefault || false,
        stripePaymentMethodId
      });
      
      return res.status(201).json({
        message: "Payment method added successfully",
        paymentMethod
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/payments/methods/:id", async (req: Request, res: Response) => {
    const paymentMethodId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId as string);
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    
    if (paymentMethod.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this payment method" });
    }
    
    await storage.deletePaymentMethod(paymentMethodId);
    
    return res.status(200).json({ message: "Payment method deleted successfully" });
  });
  
  app.post("/api/payments/methods/:id/set-default", async (req: Request, res: Response) => {
    const paymentMethodId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId as string);
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    
    if (paymentMethod.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this payment method" });
    }
    
    await storage.setDefaultPaymentMethod(userId, paymentMethodId);
    
    return res.status(200).json({ message: "Default payment method updated successfully" });
  });

  // Enhanced guest checkout endpoint with better customer info handling
  app.post("/api/payments/guest-checkout", async (req: Request, res: Response) => {
    try {
      const { amount, currency, description, paymentMethod, paymentData, customerInfo } = req.body;
      
      if (!customerInfo) {
        return res.status(400).json({ message: "Customer information is required" });
      }
      
      if (!amount || !paymentMethod) {
        return res.status(400).json({ message: "Amount and payment method are required" });
      }
      
      // Validate customer info
      const { fullName, email, phone, address, city, country } = customerInfo;
      
      if (!fullName || !email) {
        return res.status(400).json({ message: "Customer name and email are required" });
      }
      
      // Format customer info for the transaction description
      const customerSummary = `${fullName} (${email})${phone ? ` • ${phone}` : ''}`;
      const addressSummary = address && city ? ` • ${address}, ${city}${country ? `, ${country}` : ''}` : '';
      
      // Generate transaction ID with more uniqueness
      const transactionId = `TRX-${Math.floor(10000 + Math.random() * 90000)}-${Date.now().toString().slice(-5)}`;
      
      // Determine transaction status based on payment method
      let status = "completed";
      if (paymentMethod === "bank") {
        status = "pending"; // Bank transfers require verification
      }
      
      // Create an enhanced description that includes customer info
      const enhancedDescription = `${description || "AMKUSH Store Purchase"} • Guest Checkout • ${customerSummary}${addressSummary}`;
      
      // Create a transaction in the database (using a dummy user ID for guest checkout)
      const transaction = await storage.createTransaction({
        transactionId,
        amount,
        currency: currency || "USD",
        status,
        paymentMethod,
        description: enhancedDescription,
        userId: 0,  // Using 0 to indicate this is a guest checkout
      });
      
      // If available, store payment-specific data
      if (paymentData) {
        // For specific payment methods, we could update the transaction with additional details
        if (paymentMethod === "stripe" && paymentData.paymentIntentId) {
          // We could update the transaction with the Stripe payment intent ID here
          // await storage.updateTransaction(transaction.id, { externalId: paymentData.paymentIntentId });
        }
        
        if (paymentMethod === "paypal" && paymentData.paypalOrderId) {
          // We could update the transaction with the PayPal order ID here
          // await storage.updateTransaction(transaction.id, { externalId: paymentData.paypalOrderId });
        }
      }
      
      // Log the transaction for debugging
      console.log(`Guest checkout processed: ${transactionId} • ${customerSummary} • Amount: ${amount} ${currency || "USD"} • Method: ${paymentMethod}`);
      
      return res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        transactionId,
        transaction,
        customerInfo: {
          name: fullName,
          email
        }
      });
    } catch (error) {
      console.error("Guest checkout error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error processing payment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
