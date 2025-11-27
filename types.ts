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

// Helper types for AI
export interface AIInvoiceExtraction {
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  suggestedNotes?: string;
}
