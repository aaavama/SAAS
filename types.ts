export enum InvoiceStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  clientId: string;
  items: InvoiceItem[];
  notes?: string;
  currency: string;
  taxRate: number; // Percentage
}

export interface AppSettings {
  // Profile
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  companyLogoUrl?: string;
  
  // Currency
  currency: string;
  currencySymbol: string;

  // Sequence - Sales
  invoicePrefix: string;
  nextInvoiceNumber: number;

  estimatePrefix: string;
  nextEstimateNumber: number;

  proformaPrefix: string;
  nextProformaNumber: number;

  salesReturnPrefix: string;
  nextSalesReturnNumber: number;

  // Sequence - Purchase
  purchaseOrderPrefix: string;
  nextPurchaseOrderNumber: number;

  purchaseReturnPrefix: string;
  nextPurchaseReturnNumber: number;

  // Print / Appearance
  accentColor: string; // hex code
  showLogo: boolean;
  theme: 'light' | 'dark';
}

// Helper types for AI
export interface AIInvoiceExtraction {
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  suggestedNotes?: string;
}