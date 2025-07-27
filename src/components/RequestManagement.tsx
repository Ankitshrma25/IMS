'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NewRequestForm from './NewRequestForm';

interface RequestItem {
  itemId: string;
  itemName: string;
  serialNumber: string;
  category: string;
  quantity: number;
  unit: string;
  purpose: string;
  estimatedCost: number;
  stockLevel?: number; // Added for stock level
}

interface Request {
  _id: string;
  requestNumber: string;
  requesterName: string;
  requesterSection: string;
  requesterRank?: string;
  items: RequestItem[];
  status: 'pending' | 'approved' | 'rejected' | 'allocated' | 'inTransit' | 'completed' | 'cancelled' | 'forwardedToWSG' | 'forwardedToCOD';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: string;
  totalCost: number;
  notes: string;
  currentLocation: 'localStore' | 'wsgStore' | 'cod';
  sourceLocation: 'localStore' | 'wsgStore' | 'cod';
  allocatedFrom?: 'localStore' | 'wsgStore' | 'cod';
  allocationDate?: string;
  allocatedBy?: {
    name: string;
    username: string;
  };
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

export default function RequestManagement() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [actionModal, setActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [viewRequest, setViewRequest] = useState<Request | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filter, locationFilter]);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (locationFilter !== 'all') {
        params.append('location', locationFilter);
      }
      if (user?.section) {
        params.append('section', user.section);
      }

      const response = await fetch(`/api/requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const req = data.requests as Request[];
        setRequests(req);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      const response = await fetch(`/api/requests/${selectedRequest._id}/actions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionType,
          performedBy: user?.id, // <-- changed from user?.name to user?.id
          notes: actionNotes,
          allocatedFrom: actionType === 'allocate' ? user?.role === 'wsgStoreManager' ? 'wsgStore' : 'localStore' : undefined,
        }),
      });

      if (response.ok) {
        await fetchRequests();
        setActionModal(false);
        setSelectedRequest(null);
        setActionType('');
        setActionNotes('');
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'allocated': return 'bg-blue-100 text-blue-800';
      case 'inTransit': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'forwardedToWSG': return 'bg-orange-100 text-orange-800';
      case 'forwardedToCOD': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = (request: Request) => {
    const actions = [];
    
    if (request.status === 'pending') {
      if (user?.role === 'localStoreManager') {
        // Only show 'approve' if all items are in stock; otherwise, only show 'forwardToWSG' and 'reject'
        const allInStock = request.items.every(item =>
          typeof item.stockLevel === 'number' ? item.stockLevel >= item.quantity : true
        );
        if (allInStock) {
          actions.push('approve', 'reject');
        } else {
          actions.push('forwardToWSG', 'reject');
        }
      }
    }
    
    if (request.status === 'forwardedToWSG') {
      if (user?.role === 'wsgStoreManager') {
        actions.push('allocate', 'forwardToCOD');
      }
    }
    
    if (request.status === 'allocated') {
      actions.push('complete');
    }
    
    return actions;
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
          <h2 className="text-2xl font-bold text-gray-900">Request Management</h2>
          <p className="text-gray-600">Manage inventory requests and allocations</p>
        </div>
        <button 
          onClick={() => setShowNewRequestForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="allocated">Allocated</option>
            <option value="inTransit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="forwardedToWSG">Forwarded to WSG</option>
            <option value="forwardedToCOD">Forwarded to COD</option>
          </select>
          
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
          >
            <option value="all">All Locations</option>
            <option value="localStore">Local Store</option>
            <option value="wsgStore">WSG Store</option>
            <option value="cod">COD</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests
                  .slice() // create a shallow copy to avoid mutating state
                  .sort((a, b) => {
                    // Define custom order: pending first, rejected last
                    const statusOrder = {
                      pending: 0,
                      approved: 1,
                      allocated: 2,
                      inTransit: 3,
                      completed: 4,
                      cancelled: 5,
                      forwardedToWSG: 6,
                      forwardedToCOD: 7,
                      rejected: 99, // rejected last
                    };
                    const aOrder = statusOrder[a.status] ?? 50;
                    const bOrder = statusOrder[b.status] ?? 50;
                    if (aOrder !== bOrder) return aOrder - bOrder;
                    // If same status, sort by requestDate descending (most recent first)
                    return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
                  })
                  .map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.requestNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{request.requesterName}</div>
                        <div className="text-gray-500">{request.requesterSection}</div>
                        {request.requesterRank && (
                          <div className="text-gray-500 text-xs">{request.requesterRank}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {request.items.map((item, index) => (
                          <div key={index} className="text-xs">
                            {item.itemName} - {item.quantity} {item.unit}
                            <br />
                            <span className="text-gray-500">SN: {item.serialNumber}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium capitalize">{request.currentLocation}</div>
                        {request.allocatedFrom && (
                          <div className="text-gray-500 text-xs">
                            Allocated from: {request.allocatedFrom}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionModal(true);
                        }}
                      >
                        Actions
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => setViewRequest(request)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {requests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Perform Action on Request {selectedRequest.requestNumber}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                >
                  <option value="">Select Action</option>
                  {getAvailableActions(selectedRequest).map((action) => (
                    <option key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                  rows={3}
                  placeholder="Add any notes about this action..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setActionModal(false);
                    setSelectedRequest(null);
                    setActionType('');
                    setActionNotes('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={!actionType}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  Perform Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {viewRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white text-black">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Request Details: {viewRequest.requestNumber}
            </h3>
            <div className="mb-2 text-black">
              <strong>Status:</strong> {viewRequest.status}<br />
              <strong>Requester:</strong> {viewRequest.requesterName}<br />
              <strong>Section:</strong> {viewRequest.requesterSection}<br />
              <strong>Rank:</strong> {viewRequest.requesterRank}<br />
              <strong>Priority:</strong> {viewRequest.priority}<br />
              <strong>Date:</strong> {new Date(viewRequest.requestDate).toLocaleDateString()}<br />
              <strong>Location:</strong> {viewRequest.currentLocation}<br />
              <strong>Notes:</strong> {viewRequest.notes}<br />
            </div>
            <div className="mb-2 text-black">
              <strong>Items:</strong>
              <ul className="list-disc ml-5">
                {viewRequest.items.map((item, idx) => (
                  <li key={idx}>
                    {item.itemName} - {item.quantity} {item.unit} (SN: {item.serialNumber})
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setViewRequest(null)}
              className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* New Request Form */}
      {showNewRequestForm && (
        <NewRequestForm
          onClose={() => setShowNewRequestForm(false)}
          onSuccess={() => {
            fetchRequests();
            setShowNewRequestForm(false);
          }}
        />
      )}
    </div>
  );
} 