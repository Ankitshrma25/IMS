import React, { useState } from 'react';

interface UpdateStockModalProps {
  item: any;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
  token: string;
}

const typeOptions = [
  { value: 'received', label: 'Received (Add Stock)' },
  { value: 'issued', label: 'Issued (Remove Stock)' },
  { value: 'returned', label: 'Returned (Add Stock)' },
  { value: 'damaged', label: 'Damaged (Remove Stock)' },
  { value: 'calibrated', label: 'Calibrated (No Stock Change)' },
];

export default function UpdateStockModal({ item, onClose, onSuccess, user, token }: UpdateStockModalProps) {
  const [type, setType] = useState('received');
  const [quantity, setQuantity] = useState(1);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!type || !quantity || !reference) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/items/${item._id}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          quantity: Number(quantity),
          reference,
          notes,
          performedBy: user?.name || user?.id || 'Unknown',
        }),
      });
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to update stock');
      }
    } catch (err) {
      setError('Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Update Stock</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type *</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required>
              {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference *</label>
            <input value={reference} onChange={e => setReference(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" rows={2} />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
} 