import { Invoice, Client, InvoiceStatus } from '../types';

const STORAGE_KEYS = {
  INVOICES: 'lumina_invoices',
  CLIENTS: 'lumina_clients',
};

// Seed data
const initialClients: Client[] = [
  { id: 'c1', name: 'Acme Corp', email: 'billing@acme.com', address: '123 Industrial Way, Tech City' },
  { id: 'c2', name: 'Globex Inc', email: 'accounts@globex.com', address: '456 Global Ave, Metropolis' },
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv_1',
    number: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: InvoiceStatus.PAID,
    clientId: 'c1',
    items: [
      { id: 'i1', description: 'Q1 Consultation', quantity: 10, price: 150 },
      { id: 'i2', description: 'Server Setup', quantity: 1, price: 500 },
    ],
    currency: 'USD',
    taxRate: 10,
    notes: 'Thank you for your business!',
  },
  {
    id: 'inv_2',
    number: 'INV-002',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: InvoiceStatus.PENDING,
    clientId: 'c2',
    items: [
      { id: 'i3', description: 'Frontend Development', quantity: 40, price: 85 },
    ],
    currency: 'USD',
    taxRate: 0,
    notes: 'Payment due within 14 days.',
  }
];

export const getClients = (): Client[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initialClients));
    return initialClients;
  }
  return JSON.parse(stored);
};

export const saveClient = (client: Client): void => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id);
  if (index >= 0) {
    clients[index] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const getInvoices = (): Invoice[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(initialInvoices));
    return initialInvoices;
  }
  return JSON.parse(stored);
};

export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.id === invoice.id);
  if (index >= 0) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const deleteInvoice = (id: string): void => {
  const invoices = getInvoices().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};
