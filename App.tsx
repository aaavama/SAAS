import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Users, PlusCircle, Settings, Menu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceBuilder from './components/InvoiceBuilder';
import { getInvoices, getClients, deleteInvoice as deleteInvoiceService } from './services/storageService';
import { Invoice, Client } from './types';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

// Sidebar Navigation Component
const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800';

  return (
    <div className="w-64 bg-gray-950 min-h-screen flex flex-col fixed left-0 top-0 h-full text-white transition-all z-20 hidden md:flex">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2 text-indigo-500 font-bold text-xl">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">L</div>
          <span>Lumina</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/')}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link to="/invoices" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/invoices')}`}>
          <FileText size={20} />
          Invoices
        </Link>
        <Link to="/clients" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/clients')}`}>
          <Users size={20} />
          Clients
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/settings')}`}>
          <Settings size={20} />
          Settings
        </Link>
      </div>
    </div>
  );
};

// Main App Container
const MainContent = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const refreshData = () => {
    setInvoices(getInvoices());
    setClients(getClients());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsBuilderOpen(true);
  };

  const handleCreate = () => {
    setEditingId(undefined);
    setIsBuilderOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoiceService(id);
      refreshData();
    }
  };

  const handleCloseBuilder = () => {
    setIsBuilderOpen(false);
    setEditingId(undefined);
    refreshData();
  };

  if (isBuilderOpen) {
    return <InvoiceBuilder invoiceId={editingId} onClose={handleCloseBuilder} />;
  }

  return (
    <div className="md:ml-64 min-h-screen bg-gray-50">
       {/* Mobile Header */}
       <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
         <span className="font-bold text-lg">Lumina</span>
         <Menu />
       </div>

      <Routes>
        <Route path="/" element={
           <div className="relative">
             <Dashboard invoices={invoices} />
             <FloatingActionButton onClick={handleCreate} />
           </div>
        } />
        <Route path="/invoices" element={
          <div className="relative">
             <InvoiceList invoices={invoices} clients={clients} onEdit={handleEdit} onDelete={handleDelete} />
             <FloatingActionButton onClick={handleCreate} />
          </div>
        } />
        <Route path="/clients" element={
          <div className="p-8">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Clients</h2>
             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
               <p className="text-gray-500">Client management features coming soon. Current clients are managed via local storage seeds for demo.</p>
               <ul className="mt-4 space-y-2">
                 {clients.map(c => <li key={c.id} className="p-3 bg-gray-50 rounded-lg">{c.name} ({c.email})</li>)}
               </ul>
             </div>
          </div>
        } />
         <Route path="/settings" element={
          <div className="p-8">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
               <p className="text-gray-500">App version: 1.0.0 (Demo)</p>
             </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

const FloatingActionButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-8 right-8 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center z-10"
    title="Create New Invoice"
  >
    <PlusCircle size={28} />
  </button>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MainContent />
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
