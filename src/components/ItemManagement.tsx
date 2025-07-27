'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AddItemModal from './AddItemModal';
import ItemDetailsModal from './ItemDetailsModal';
import UpdateStockModal from './UpdateStockModal';

interface Transaction {
  date: string;
  type: 'received' | 'issued' | 'returned' | 'damaged' | 'calibrated';
  quantity: number;
  reference: string;
  notes?: string;
  performedBy: string;
}

interface Item {
  _id: string;
  itemName: string;
  description: string;
  category: 'ORDNANCE' | 'DGEME' | 'PMSE' | 'TTG';
  serialNumber: string;
  conditionStatus: 'serviceable' | 'unserviceable' | 'OBT' | 'OBE';
  location: 'localStore' | 'wsgStore' | 'cod';
  stockLevel: number;
  unit: string;
  supplier: string;
  dateReceived: string;
  lastIssued?: string;
  minStockLevel: number;
  leadTime: number;
  calibrationSchedule?: string;
  expirationDate?: string;
  section?: string;
  cost: number;
  transactionHistory: Transaction[];
}

export default function ItemManagement() {
  const { user, token } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [filter, conditionFilter, search]);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('category', filter);
      }
      if (conditionFilter !== 'all') {
        params.append('conditionStatus', conditionFilter);
      }
      if (search) {
        params.append('search', search);
      }
      if (user?.section) {
        params.append('section', user.section);
      }

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
      setLoading(false);
    }
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return 'bg-red-100 text-red-800';
    if (current <= minimum) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockText = (current: number, minimum: number) => {
    if (current === 0) return 'Out of Stock';
    if (current <= minimum) return 'Low Stock';
    return 'In Stock';
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'serviceable': return 'bg-green-100 text-green-800';
      case 'unserviceable': return 'bg-red-100 text-red-800';
      case 'OBT': return 'bg-yellow-100 text-yellow-800';
      case 'OBE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrantTypeColor = (category: string) => {
    switch (category) {
      case 'ORDNANCE': return 'bg-blue-100 text-blue-800';
      case 'DGEME': return 'bg-purple-100 text-purple-800';
      case 'PMSE': return 'bg-green-100 text-green-800';
      case 'TTG': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Manage inventory items and stock levels</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          onClick={() => setShowAddModal(true)}
        >
          Add New Item
        </button>
      </div>
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchItems();
          }}
          user={user}
          token={token}
        />
      )}

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search items by name, serial number, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
          >
            <option value="all">All Grant Types</option>
            <option value="ORDNANCE">ORDNANCE</option>
            <option value="DGEME">DGEME</option>
            <option value="PMSE">PMSE</option>
            <option value="TTG">TTG</option>
          </select>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
          >
            <option value="all">All Conditions</option>
            <option value="serviceable">Serviceable</option>
            <option value="unserviceable">Unserviceable</option>
            <option value="OBT">OBT (Obsolescent)</option>
            <option value="OBE">OBE (Overhaul by Equipment)</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.itemName}</h3>
                  <p className="text-sm text-gray-500">SN: {item.serialNumber}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(item.stockLevel, item.minStockLevel)}`}>
                    {getStockText(item.stockLevel, item.minStockLevel)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.conditionStatus)}`}>
                    {item.conditionStatus}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-black">{item.description}</p>
                </div>
                
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGrantTypeColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-black">Stock Level:</span>
                    <p className="font-medium text-black">{item.stockLevel} {item.unit}</p>
                  </div>
                  <div>
                    <span className="text-black">Min Stock:</span>
                    <p className="font-medium text-black">{item.minStockLevel} {item.unit}</p>
                  </div>
                  <div>
                    <span className="text-black">Location:</span>
                    <p className="font-medium text-black capitalize">{item.location}</p>
                  </div>
                  <div>
                    <span className="text-black">Cost:</span>
                    <p className="font-medium text-black">₹{item.cost}</p>
                  </div>
                  <div>
                    <span className="text-black">Supplier:</span>
                    <p className="font-medium text-black">{item.supplier}</p>
                  </div>
                  <div>
                    <span className="text-black">Lead Time:</span>
                    <p className="font-medium text-black">{item.leadTime} days</p>
                  </div>
                </div>
                
                {item.section && (
                  <div>
                    <span className="text-black text-sm">Section:</span>
                    <p className="font-medium text-black text-sm">{item.section}</p>
                  </div>
                )}

                {item.lastIssued && (
                  <div>
                    <span className="text-black text-sm">Last Issued:</span>
                    <p className="font-medium text-black text-sm">{new Date(item.lastIssued).toLocaleDateString()}</p>
                  </div>
                )}

                {item.expirationDate && (
                  <div>
                    <span className="text-black text-sm">Expires:</span>
                    <p className="font-medium text-black text-sm">{new Date(item.expirationDate).toLocaleDateString()}</p>
                  </div>
                )}

                {item.calibrationSchedule && (
                  <div>
                    <span className="text-black text-sm">Next Calibration:</span>
                    <p className="font-medium text-black text-sm">{new Date(item.calibrationSchedule).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowDetailsModal(true);
                  }}
                >
                  View Details
                </button>
                <button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowUpdateStockModal(true);
                  }}
                >
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showDetailsModal && selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedItem(null);
          }}
        />
      )}
      {showUpdateStockModal && selectedItem && (
        <UpdateStockModal
          item={selectedItem}
          onClose={() => {
            setShowUpdateStockModal(false);
            setSelectedItem(null);
          }}
          onSuccess={fetchItems}
          user={user}
          token={token}
        />
      )}
      
      {items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No items found</p>
        </div>
      )}
    </div>
  );
} 