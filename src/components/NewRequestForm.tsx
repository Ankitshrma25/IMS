'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Item {
  _id: string;
  itemName: string;
  serialNumber: string;
  category: string;
  stockLevel: number;
  unit: string;
  cost: number;
  location: string;
}

interface RequestItem {
  itemId: string;
  itemName: string;
  serialNumber: string;
  category: string;
  quantity: number;
  unit: string;
  purpose: string;
  estimatedCost: number;
}

export default function NewRequestForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user, token } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<RequestItem[]>([]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.section) {
        params.append('section', user.section);
      }
      params.append('location', 'localStore');

      const response = await fetch(`/api/items?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setFetchingItems(false);
    }
  };

  const addItem = () => {
    setSelectedItems([...selectedItems, {
      itemId: '',
      itemName: '',
      serialNumber: '',
      category: '',
      quantity: 1,
      unit: '',
      purpose: '',
      estimatedCost: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof RequestItem, value: any) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // If itemId changed, update other fields
    if (field === 'itemId') {
      const selectedItem = items.find(item => item._id === value);
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          itemName: selectedItem.itemName,
          serialNumber: selectedItem.serialNumber,
          category: selectedItem.category,
          unit: selectedItem.unit,
          estimatedCost: selectedItem.cost * updatedItems[index].quantity,
        };
      }
    }
    
    // If quantity changed, update estimated cost
    if (field === 'quantity') {
      const selectedItem = items.find(item => item._id === updatedItems[index].itemId);
      if (selectedItem) {
        updatedItems[index].estimatedCost = selectedItem.cost * value;
      }
    }
    
    setSelectedItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert('Please add at least one item to the request');
      return;
    }

    // Validate items
    for (const item of selectedItems) {
      if (!item.itemId || !item.purpose || item.quantity <= 0) {
        alert('Please fill in all required fields for all items');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId: user?.id,
          requesterName: user?.name,
          requesterSection: user?.section,
          requesterRank: user?.rank,
          items: selectedItems,
          priority,
          notes,
          sourceLocation: 'localStore',
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create request');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingItems) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading items...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Request</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
              rows={3}
              placeholder="Add any notes about this request..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Add Item
              </button>
            </div>

            {selectedItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Item {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Item *
                    </label>
                    <select
                      value={item.itemId}
                      onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                      required
                    >
                      <option value="">Select Item</option>
                      {items.map((availableItem) => (
                        <option key={availableItem._id} value={availableItem._id}>
                          {availableItem.itemName} (SN: {availableItem.serialNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                      min="1"
                      required
                    />
                    {(() => {
                      const selectedItem = items.find(i => i._id === item.itemId);
                      if (selectedItem && item.quantity === selectedItem.stockLevel) {
                        return (
                          <div className="text-yellow-600 text-xs mt-1">
                            Warning: This request will use up all available stock for this item.
                          </div>
                        );
                      }
                      if (selectedItem && item.quantity > selectedItem.stockLevel) {
                        return (
                          <div className="text-red-600 text-xs mt-1">
                            Error: Requested quantity exceeds available stock!
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Purpose *
                    </label>
                    <input
                      type="text"
                      value={item.purpose}
                      onChange={(e) => updateItem(index, 'purpose', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                      placeholder="e.g., Repair job, Maintenance"
                      required
                    />
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <span>Unit: {item.unit}</span>
                  <span className="ml-4">Category: {item.category}</span>
                  <span className="ml-4">Estimated Cost: ₹{item.estimatedCost.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedItems.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 