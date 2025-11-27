import React from 'react';
import { Invoice, InvoiceStatus, Client } from '../types';
import { Edit2, Trash2, Eye } from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  clients: Client[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, clients, onEdit, onDelete }) => {
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown Client';
  const getAmount = (inv: Invoice) => {
    const sub = inv.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    return (sub * (1 + inv.taxRate / 100)).toFixed(2);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case InvoiceStatus.PENDING: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Invoices</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Number</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Client</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Date</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Total</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Status</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500 dark:text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">No invoices found. Create one to get started!</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{inv.number}</td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{getClientName(inv.clientId)}</td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{inv.date}</td>
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">${getAmount(inv)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(inv.id)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                       <button onClick={() => onDelete(inv.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;