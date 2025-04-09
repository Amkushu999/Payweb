import { users, type User, type InsertUser, transactions, type Transaction, type InsertTransaction, paymentMethods, type PaymentMethod, type InsertPaymentMethod } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  
  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByExternalId(transactionId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
  
  // Payment method operations
  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<boolean>;
  setDefaultPaymentMethod(userId: number, paymentMethodId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private paymentMethods: Map<number, PaymentMethod>;
  private userId: number;
  private transactionId: number;
  private paymentMethodId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.paymentMethods = new Map();
    this.userId = 1;
    this.transactionId = 1;
    this.paymentMethodId = 1;
    
    // Add some demo data
    this.createUser({
      username: "demo",
      email: "demo@example.com",
      password: "password123", // In a real app, this would be hashed
      firstName: "John",
      lastName: "Doe"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      stripeCustomerId: null,
      plan: "free",
      credits: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    return this.updateUser(userId, { stripeCustomerId });
  }

  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByExternalId(transactionId: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (transaction) => transaction.transactionId === transactionId,
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    
    const updatedTransaction = { ...transaction, status };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Payment method operations
  async getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(
      (paymentMethod) => paymentMethod.userId === userId,
    );
  }

  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async createPaymentMethod(insertPaymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.paymentMethodId++;
    const paymentMethod: PaymentMethod = {
      ...insertPaymentMethod,
      id,
      createdAt: new Date(),
    };
    this.paymentMethods.set(id, paymentMethod);
    
    // If this is set as default, unset any other defaults
    if (paymentMethod.isDefault) {
      await this.setDefaultPaymentMethod(paymentMethod.userId, id);
    }
    
    return paymentMethod;
  }

  async updatePaymentMethod(id: number, paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const paymentMethod = this.paymentMethods.get(id);
    if (!paymentMethod) {
      throw new Error(`Payment method with id ${id} not found`);
    }
    
    const updatedPaymentMethod = { ...paymentMethod, ...paymentMethodData };
    this.paymentMethods.set(id, updatedPaymentMethod);
    return updatedPaymentMethod;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }

  async setDefaultPaymentMethod(userId: number, paymentMethodId: number): Promise<boolean> {
    // First, unset any existing default
    for (const [id, method] of this.paymentMethods.entries()) {
      if (method.userId === userId && method.isDefault && id !== paymentMethodId) {
        this.paymentMethods.set(id, { ...method, isDefault: false });
      }
    }
    
    // Then set the new default
    const paymentMethod = this.paymentMethods.get(paymentMethodId);
    if (paymentMethod && paymentMethod.userId === userId) {
      this.paymentMethods.set(paymentMethodId, { ...paymentMethod, isDefault: true });
      return true;
    }
    
    return false;
  }
}

export const storage = new MemStorage();
