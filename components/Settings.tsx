import React, { useState, useEffect } from 'react';
import { Save, User, CreditCard, Printer, ListOrdered, Check, ChevronDown } from 'lucide-react';
import { AppSettings } from '../types';
import { getSettings, saveSettings } from '../services/storageService';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  headerColorClass: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ 
  title, 
  icon, 
  headerColorClass, 
  children,
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${headerColorClass}`}>
            {icon}
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
           {children}
        </div>
      )}
    </div>
  );
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    if (settings) {
      saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!settings) return <div>Loading...</div>;

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const SequenceRow = ({ 
    label, 
    prefixKey, 
    numberKey 
  }: { 
    label: string, 
    prefixKey: keyof AppSettings, 
    numberKey: keyof AppSettings 
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="md:col-span-4 font-medium text-gray-700">{label}</div>
      <div className="md:col-span-4">
        <label className="block text-xs text-gray-500 mb-1">Prefix</label>
        <input
          type="text"
          value={settings[prefixKey] as string}
          onChange={(e) => handleChange(prefixKey, e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
        />
      </div>
      <div className="md:col-span-4">
        <label className="block text-xs text-gray-500 mb-1">Next Number</label>
        <input
          type="number"
          value={settings[numberKey] as number}
          onChange={(e) => handleChange(numberKey, parseInt(e.target.value) || 0)}
          className="w-full p-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-medium transition-colors shadow-lg shadow-gray-900/20"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Profile Section */}
        <SettingsSection 
          title="Business Profile" 
          icon={<User size={20} />} 
          headerColorClass="bg-indigo-100 text-indigo-600"
        >
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={settings.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Currency Section */}
        <SettingsSection 
          title="Currency & Formats" 
          icon={<CreditCard size={20} />} 
          headerColorClass="bg-emerald-100 text-emerald-600"
        >
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency Code</label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Sequence Section */}
        <SettingsSection 
          title="Document Sequences" 
          icon={<ListOrdered size={20} />} 
          headerColorClass="bg-orange-100 text-orange-600"
        >
          <div className="p-6 space-y-8">
            {/* Sales Documents */}
            <div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Sales Documents</h4>
              <div className="space-y-3">
                <SequenceRow label="Invoice" prefixKey="invoicePrefix" numberKey="nextInvoiceNumber" />
                <SequenceRow label="Estimate" prefixKey="estimatePrefix" numberKey="nextEstimateNumber" />
                <SequenceRow label="Proforma Invoice" prefixKey="proformaPrefix" numberKey="nextProformaNumber" />
                <SequenceRow label="Sales Return" prefixKey="salesReturnPrefix" numberKey="nextSalesReturnNumber" />
              </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Purchase Documents */}
            <div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Purchase Documents</h4>
              <div className="space-y-3">
                <SequenceRow label="Purchase Order" prefixKey="purchaseOrderPrefix" numberKey="nextPurchaseOrderNumber" />
                <SequenceRow label="Purchase Return" prefixKey="purchaseReturnPrefix" numberKey="nextPurchaseReturnNumber" />
              </div>
            </div>
          </div>
        </SettingsSection>

         {/* Print / Appearance Section */}
         <SettingsSection 
          title="Print & Appearance" 
          icon={<Printer size={20} />} 
          headerColorClass="bg-pink-100 text-pink-600"
        >
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Brand Accent Color</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Indigo', hex: '#4f46e5' },
                  { name: 'Blue', hex: '#2563eb' },
                  { name: 'Emerald', hex: '#059669' },
                  { name: 'Red', hex: '#dc2626' },
                  { name: 'Violet', hex: '#7c3aed' },
                  { name: 'Black', hex: '#111827' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => handleChange('accentColor', color.hex)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      settings.accentColor === color.hex ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {settings.accentColor === color.hex && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                id="showLogo"
                type="checkbox"
                checked={settings.showLogo}
                onChange={(e) => handleChange('showLogo', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="showLogo" className="text-sm text-gray-700 select-none">
                Show Company Name/Logo on Invoices
              </label>
            </div>
          </div>
        </SettingsSection>

      </div>
    </div>
  );
};

export default Settings;