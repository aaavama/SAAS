import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Invoice, InvoiceStatus } from '../types';
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
}

const Dashboard: React.FC<DashboardProps> = ({ invoices }) => {
  const totalRevenue = invoices
    .filter(i => i.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => {
        const sub = inv.items.reduce((s, item) => s + (item.quantity * item.price), 0);
        return sum + (sub * (1 + inv.taxRate / 100));
    }, 0);

  const pendingAmount = invoices
    .filter(i => i.status === InvoiceStatus.PENDING || i.status === InvoiceStatus.OVERDUE)
    .reduce((sum, inv) => {
        const sub = inv.items.reduce((s, item) => s + (item.quantity * item.price), 0);
        return sum + (sub * (1 + inv.taxRate / 100));
    }, 0);

  const pendingCount = invoices.filter(i => i.status === InvoiceStatus.PENDING).length;
  const overdueCount = invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length;

  // Mock data for the chart based on current invoices + some randomization for demo visualization
  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
    { name: 'Aug', revenue: totalRevenue > 5000 ? totalRevenue / 2 : 4000 }, // Dynamic-ish
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={<DollarSign className="text-green-600 dark:text-green-400" />} 
          bg="bg-green-50 dark:bg-green-900/30"
        />
        <StatCard 
          title="Pending Amount" 
          value={`$${pendingAmount.toLocaleString()}`} 
          icon={<Clock className="text-orange-600 dark:text-orange-400" />} 
          bg="bg-orange-50 dark:bg-orange-900/30"
        />
        <StatCard 
          title="Pending Invoices" 
          value={pendingCount.toString()} 
          icon={<FileText className="text-blue-600 dark:text-blue-400" />} 
          bg="bg-blue-50 dark:bg-blue-900/30"
        />
        <StatCard 
          title="Overdue" 
          value={overdueCount.toString()} 
          icon={<CheckCircle className="text-red-600 dark:text-red-400" />} 
          bg="bg-red-50 dark:bg-red-900/30"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Revenue Overview</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-gray-700" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} prefix="$" />
              <Tooltip 
                cursor={{fill: 'rgba(248, 250, 252, 0.5)'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg }: { title: string, value: string, icon: React.ReactNode, bg: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between transition-colors">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${bg}`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;