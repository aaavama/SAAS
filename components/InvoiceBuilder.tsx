import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wand2, Save, Printer, ArrowLeft, Mail } from 'lucide-react';
import { Invoice, InvoiceItem, Client, InvoiceStatus, AppSettings } from '../types';
import { parseInvoiceText, generateEmailReminder } from '../services/geminiService';
import { getClients, saveInvoice, getInvoices, getSettings, incrementInvoiceNumber } from '../services/storageService';

interface InvoiceBuilderProps {
  invoiceId?: string;
  onClose: () => void;
}

const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ invoiceId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  // Form State
  const [invoice, setInvoice] = useState<Invoice>({
    id: crypto.randomUUID(),
    number: '...', // Placeholder until settings load
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: InvoiceStatus.DRAFT,
    clientId: '',
    items: [{ id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }],
    currency: 'USD',
    taxRate: 0,
    notes: '',
  });

  const [emailDraft, setEmailDraft] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
    setClients(getClients());

    if (invoiceId) {
      const existing = getInvoices().find(i => i.id === invoiceId);
      if (existing) setInvoice(existing);
    } else {
      // New Invoice: Set defaults from settings
      setInvoice(prev => ({
        ...prev,
        number: `${loadedSettings.invoicePrefix}${loadedSettings.nextInvoiceNumber}`,
        currency: loadedSettings.currency
      }));
    }
  }, [invoiceId]);

  const calculateSubtotal = () => invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const calculateTax = () => calculateSubtotal() * (invoice.taxRate / 100);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleAddItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleSave = () => {
    saveInvoice(invoice);
    
    // If this is a new invoice (we determined that by checking if invoiceId prop was passed), increment sequence
    if (!invoiceId) {
      incrementInvoiceNumber();
    }
    
    onClose();
  };

  const handleAiParse = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    try {
      const result = await parseInvoiceText(aiPrompt);
      const newItems = result.items.map(item => ({
        id: crypto.randomUUID(),
        description: item.description,
        quantity: item.quantity,
        price: item.price
      }));
      
      setInvoice(prev => ({
        ...prev,
        items: [...prev.items.filter(i => i.description), ...newItems],
        notes: result.suggestedNotes ? `${prev.notes ? prev.notes + '\n' : ''}${result.suggestedNotes}` : prev.notes
      }));
      setAiPrompt('');
      setShowAiModal(false);
    } catch (e) {
      alert('Failed to generate items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmail = async () => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client) {
      alert("Please select a client first.");
      return;
    }
    setLoading(true);
    const email = await generateEmailReminder(client.name, invoice.number, `${settings?.currencySymbol || '$'}${calculateTotal().toFixed(2)}`, invoice.dueDate);
    setEmailDraft(email);
    setLoading(false);
  };

  const getClientDetails = () => clients.find(c => c.id === invoice.clientId);
  
  // Styles based on settings
  const accentColor = settings?.accentColor || '#4f46e5';

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 no-print shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">{invoiceId ? 'Edit Invoice' : 'New Invoice'}</h1>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium transition-colors text-gray-700"
          >
            <Wand2 size={18} style={{ color: accentColor }} />
            <span className="hidden sm:inline">Magic Fill</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-white hover:opacity-90 rounded-lg font-medium transition-colors shadow-lg"
            style={{ backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}40` }}
          >
            <Save size={18} />
            <span>Save Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Paper */}
      <div className="max-w-4xl mx-auto mt-8 bg-white shadow-xl rounded-xl p-8 md:p-12 print:shadow-none print:mt-0 print:p-0 print:w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">INVOICE</div>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="font-medium">#</span>
              <input 
                type="text" 
                value={invoice.number} 
                onChange={e => setInvoice(prev => ({...prev, number: e.target.value}))}
                className="bg-transparent border-b border-dashed border-gray-300 outline-none w-32 font-medium"
                style={{ borderColor: 'focus-within' ? accentColor : undefined }} // Simple dynamic style not supported for pseudo-classes inline
              />
            </div>
          </div>
          
          <div className="text-right">
             {settings.showLogo && (
               <div className="text-2xl font-bold mb-1" style={{ color: accentColor }}>
                 {settings.companyName}
               </div>
             )}
             <div className="text-gray-500 text-sm whitespace-pre-wrap">{settings.companyAddress}</div>
             <div className="text-gray-500 text-sm mt-1">{settings.companyEmail}</div>
          </div>
        </div>

        {/* Client & Date Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Bill To</label>
            <select 
              value={invoice.clientId} 
              onChange={e => setInvoice(prev => ({...prev, clientId: e.target.value}))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 outline-none transition-all mb-2"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            >
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {invoice.clientId && (
              <div className="text-sm text-gray-600 pl-1 whitespace-pre-wrap">
                {getClientDetails()?.address}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Issue Date</label>
                <input 
                  type="date"
                  value={invoice.date}
                  onChange={e => setInvoice(prev => ({...prev, date: e.target.value}))}
                  className="w-full p-2 border-b border-gray-200 outline-none bg-transparent"
                />
             </div>
             <div>
                <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Due Date</label>
                <input 
                  type="date"
                  value={invoice.dueDate}
                  onChange={e => setInvoice(prev => ({...prev, dueDate: e.target.value}))}
                  className="w-full p-2 border-b border-gray-200 outline-none bg-transparent"
                />
             </div>
             <div>
                <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Status</label>
                <select
                  value={invoice.status}
                  onChange={e => setInvoice(prev => ({...prev, status: e.target.value as InvoiceStatus}))}
                   className="w-full p-2 border-b border-gray-200 outline-none bg-transparent"
                >
                  {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Currency</label>
                <select
                  value={invoice.currency}
                  onChange={e => setInvoice(prev => ({...prev, currency: e.target.value}))}
                   className="w-full p-2 border-b border-gray-200 outline-none bg-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="CAD">CAD</option>
                </select>
             </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="text-left py-3 text-xs uppercase font-bold text-gray-500 w-1/2">Description</th>
                <th className="text-center py-3 text-xs uppercase font-bold text-gray-500 w-20">Qty</th>
                <th className="text-right py-3 text-xs uppercase font-bold text-gray-500 w-32">Price</th>
                <th className="text-right py-3 text-xs uppercase font-bold text-gray-500 w-32">Amount</th>
                <th className="w-10 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="group border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2">
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full p-2 bg-transparent outline-none"
                    />
                  </td>
                  <td className="py-2">
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={e => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-transparent outline-none text-center"
                    />
                  </td>
                  <td className="py-2">
                    <input 
                      type="number" 
                      value={item.price}
                      onChange={e => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-transparent outline-none text-right"
                    />
                  </td>
                  <td className="py-2 text-right font-medium text-gray-700">
                    {(item.quantity * item.price).toFixed(2)}
                  </td>
                  <td className="py-2 text-center no-print">
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            onClick={handleAddItem}
            className="mt-4 flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-colors no-print"
            style={{ color: accentColor }}
          >
            <Plus size={16} />
            Add Line Item
          </button>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-12">
          <div className="w-full md:w-1/3 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{invoice.currency} {calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-2">
                Tax 
                <input 
                  type="number" 
                  value={invoice.taxRate}
                  onChange={e => setInvoice(prev => ({...prev, taxRate: parseFloat(e.target.value) || 0}))}
                  className="w-12 text-xs border border-gray-200 rounded p-1 text-center outline-none focus:border-indigo-500"
                />
                %
              </span>
              <span>{calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Total</span>
              <span>{invoice.currency} {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Notes</label>
          <textarea 
            value={invoice.notes}
            onChange={e => setInvoice(prev => ({...prev, notes: e.target.value}))}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all h-24 resize-none focus:ring-2"
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            placeholder="Additional notes, payment terms..."
          />
        </div>

        {/* AI Actions (Reminder) */}
        {invoice.clientId && (
           <div className="border-t border-gray-100 pt-6 no-print">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-bold text-gray-700">AI Actions</h3>
                <div className="h-px flex-1 bg-gray-100"></div>
              </div>
              <button 
                onClick={handleGenerateEmail}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors border border-gray-200 rounded-md px-3 py-2 bg-white"
              >
                <Mail size={16} />
                Draft Payment Reminder Email
              </button>

              {emailDraft && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100 relative">
                  <div className="text-xs uppercase font-bold text-indigo-400 mb-2">Draft Email</div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{emailDraft}</pre>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(emailDraft);
                        alert("Email copied to clipboard!");
                    }}
                    className="absolute top-4 right-4 text-xs bg-white text-indigo-600 px-2 py-1 rounded shadow-sm hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
              )}
           </div>
        )}
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4" style={{ color: accentColor }}>
              <Wand2 className="w-6 h-6" />
              <h2 className="text-xl font-bold">Magic Fill Invoice</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Describe the work you did in plain English, and AI will automatically format it into line items.
            </p>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 outline-none resize-none mb-4 text-sm"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              placeholder="E.g. I did 15 hours of consulting at $80/hr, sold 2 software licenses for $500 each, and added a $50 setup fee."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAiParse}
                disabled={loading || !aiPrompt.trim()}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: accentColor }}
              >
                {loading ? 'Processing...' : 'Generate Items'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceBuilder;