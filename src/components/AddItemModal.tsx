import React, { useState } from 'react';

interface AddItemModalProps {
  onClose: () => void;
  onSuccess: () => void;
  user: any;
  token: string;
}

const initialState = {
  itemName: '',
  description: '',
  category: 'ORDNANCE',
  serialNumber: '',
  conditionStatus: 'serviceable',
  location: 'localStore',
  stockLevel: 0,
  unit: 'Pieces',
  supplier: '',
  dateReceived: '',
  minStockLevel: 0,
  leadTime: 30,
  calibrationSchedule: '',
  expirationDate: '',
  section: '',
  cost: 0,
};

const categoryOptions = ['ORDNANCE', 'DGEME', 'PMSE', 'TTG'];
const conditionOptions = ['serviceable', 'unserviceable', 'OBT', 'OBE'];
const locationOptions = [
  { value: 'localStore', label: 'Local Store' },
  { value: 'wsgStore', label: 'WSG Store' },
  { value: 'cod', label: 'COD' },
];
const unitOptions = ['Pieces', 'Kilos', 'Liters', 'Meters', 'Boxes', 'Sets', 'Units'];

export default function AddItemModal({ onClose, onSuccess, user, token }: AddItemModalProps) {
  const [form, setForm] = useState({
    ...initialState,
    location: user?.role === 'wsgStoreManager' ? 'wsgStore' : 'localStore',
    section: user?.section || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Improved Validation
    const requiredFields = [
      'itemName', 'category', 'serialNumber', 'conditionStatus',
      'location', 'stockLevel', 'unit', 'supplier', 'minStockLevel', 'leadTime', 'cost',
    ];
    for (const field of requiredFields) {
      const value = form[field];
      console.log('Checking field', field, 'value:', value, 'type:', typeof value);
      if (
        (typeof value === 'string' && value.trim() === '') ||
        (typeof value === 'undefined') ||
        (typeof value === 'number' && isNaN(value))
      ) {
        console.log('Validation failed for', field, value);
        setError('Please fill all required fields.');
        return;
      }
    }
    if (form.location === 'localStore' && !user?.section) {
      setError('Section is required for local store items.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        dateReceived: form.dateReceived ? new Date(form.dateReceived) : undefined,
        calibrationSchedule: form.calibrationSchedule ? new Date(form.calibrationSchedule) : undefined,
        expirationDate: form.expirationDate ? new Date(form.expirationDate) : undefined,
        section: form.location === 'localStore' ? user?.section : undefined,
      };
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        onSuccess();
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to add item');
      }
    } catch (err) {
      setError('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add New Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input name="itemName" value={form.itemName} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required>
                {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
              <input name="serialNumber" value={form.serialNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
              <select name="conditionStatus" value={form.conditionStatus} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required>
                {conditionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <select name="location" value={form.location} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required>
                {locationOptions.map((loc) => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
              </select>
            </div>
            {form.location === 'localStore' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                <input name="section" value={user?.section || ''} disabled className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-gray-100" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Level *</label>
              <input name="stockLevel" type="number" min={0} value={form.stockLevel} onChange={handleNumberChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required>
                {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <input name="supplier" value={form.supplier} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
              <input name="dateReceived" type="date" value={form.dateReceived} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level *</label>
              <input name="minStockLevel" type="number" min={0} value={form.minStockLevel} onChange={handleNumberChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days) *</label>
              <input name="leadTime" type="number" min={0} value={form.leadTime} onChange={handleNumberChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calibration Schedule</label>
              <input name="calibrationSchedule" type="date" value={form.calibrationSchedule} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input name="expirationDate" type="date" value={form.expirationDate} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost (₹) *</label>
              <input name="cost" type="number" min={0} value={form.cost} onChange={handleNumberChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
} 