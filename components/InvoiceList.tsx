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
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-700';
      case InvoiceStatus.PENDING: return 'bg-orange-100 text-orange-700';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500">Number</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500">Client</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500">Date</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500">Total</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500">Status</th>
              <th className="py-4 px-6 text-xs uppercase font-bold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No invoices found. Create one to get started!</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{inv.number}</td>
                  <td className="py-4 px-6 text-gray-600">{getClientName(inv.clientId)}</td>
                  <td className="py-4 px-6 text-gray-600">{inv.date}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">${getAmount(inv)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(inv.id)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                       <button onClick={() => onDelete(inv.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
