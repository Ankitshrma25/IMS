'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import InventoryOverview from './InventoryOverview';
import RequestManagement from './RequestManagement';
import ItemManagement from './ItemManagement';
import UserProfile from './UserProfile';
import Reports from './Reports';
import NewRequestForm from './NewRequestForm';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);

  const tabs = [
    { id: 'overview', name: 'Section Overview', icon: '📊' },
    { id: 'requests', name: 'Section Requests', icon: '📋' },
    { id: 'items', name: 'Section Inventory', icon: '📦' },
    { id: 'reports', name: 'Section Reports', icon: '📈' },
    { id: 'profile', name: 'Profile', icon: '👤' },
  ];

  const handleNewRequest = () => setShowNewRequestForm(true);
  const handleAddItem = () => setActiveTab('items');
  const handleViewReports = () => setActiveTab('reports');
  const handleAlerts = () => setActiveTab('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <LocalStoreOverview onNewRequest={handleNewRequest} onAddItem={handleAddItem} onViewReports={handleViewReports} onAlerts={handleAlerts} />;
      case 'requests':
        return <LocalRequestManagement />;
      case 'items':
        return <LocalItemManagement />;
      case 'reports':
        return <LocalReports />;
      case 'profile':
        return <UserProfile />;
      default:
        return <LocalStoreOverview onNewRequest={handleNewRequest} onAddItem={handleAddItem} onViewReports={handleViewReports} onAlerts={handleAlerts} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.section} Section - Local Store
                </h1>
                <p className="text-sm text-gray-600">Local Inventory Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  Local Store Manager - {user?.section}
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>
      {showNewRequestForm && (
        <NewRequestForm
          onClose={() => setShowNewRequestForm(false)}
          onSuccess={() => setShowNewRequestForm(false)}
        />
      )}
    </div>
  );
}

// Local Store Overview Component
function LocalStoreOverview({ onNewRequest, onAddItem, onViewReports, onAlerts }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Local Store Overview</h2>
        <p className="text-gray-600">Section-specific inventory and request management</p>
      </div>
      <InventoryOverview
        onNewRequest={onNewRequest}
        onAddItem={onAddItem}
        onViewReports={onViewReports}
        onAlerts={onAlerts}
      />
    </div>
  );
}

// Local Request Management Component
function LocalRequestManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Section Request Management</h2>
        <p className="text-gray-600">Manage requests for your section</p>
      </div>
      <RequestManagement />
    </div>
  );
}

// Local Item Management Component
function LocalItemManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Section Inventory Management</h2>
        <p className="text-gray-600">Manage inventory for your section</p>
      </div>
      <ItemManagement />
    </div>
  );
}

// Local Reports Component
function LocalReports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Section Reports & Analytics</h2>
        <p className="text-gray-600">Section-specific reporting and analysis</p>
      </div>
      <Reports />
    </div>
  );
} 