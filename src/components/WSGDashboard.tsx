'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import InventoryOverview from './InventoryOverview';
import RequestManagement from './RequestManagement';
import ItemManagement from './ItemManagement';
import UserProfile from './UserProfile';
import Reports from './Reports';

export default function WSGDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    pendingRequests: 0,
    lowStockItems: 0,
    expiringItems: 0,
    sections: [],
  });

  const tabs = [
    { id: 'overview', name: 'WSG Overview', icon: '🏢' },
    { id: 'requests', name: 'Central Requests', icon: '📋' },
    { id: 'items', name: 'WSG Inventory', icon: '📦' },
    { id: 'reports', name: 'WSG Reports', icon: '📈' },
    { id: 'profile', name: 'Profile', icon: '👤' },
  ];

  useEffect(() => {
    fetchWSGStats();
  }, []);

  const fetchWSGStats = async () => {
    try {
      const response = await fetch('/api/stats?location=wsgStore', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching WSG stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <WSGOverview stats={stats} />;
      case 'requests':
        return <WSGRequestManagement />;
      case 'items':
        return <WSGItemManagement />;
      case 'reports':
        return <WSGReports />;
      case 'profile':
        return <UserProfile />;
      default:
        return <WSGOverview stats={stats} />;
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
                  509 Army Based Workshop - WSG Store
                </h1>
                <p className="text-sm text-gray-600">Central Inventory Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">WSG Store Manager</p>
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
    </div>
  );
}

// WSG Overview Component
function WSGOverview({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">WSG Store Overview</h2>
        <p className="text-gray-600">Central inventory management and coordination</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Items</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalItems}</p>
          <p className="text-sm text-gray-500">In WSG store</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Value</h3>
          <p className="text-3xl font-bold text-green-600">₹{stats.totalValue?.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Inventory value</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests}</p>
          <p className="text-sm text-gray-500">From local stores</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
          <p className="text-sm text-gray-500">Need attention</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium">
            Process Pending Requests
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium">
            Generate Stock Report
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-sm font-medium">
            View COD Requests
          </button>
        </div>
      </div>

      {/* Section Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Section Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['ORDNANCE', 'DGEME', 'PMSE', 'TTG'].map((section) => (
            <div key={section} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">{section}</h4>
              <p className="text-2xl font-bold text-gray-600">
                {stats.sections?.find((s: any) => s.section === section)?.count || 0}
              </p>
              <p className="text-sm text-gray-500">items</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// WSG Request Management Component
function WSGRequestManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Central Request Management</h2>
        <p className="text-gray-600">Manage requests from all local stores</p>
      </div>
      <RequestManagement />
    </div>
  );
}

// WSG Item Management Component
function WSGItemManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">WSG Inventory Management</h2>
        <p className="text-gray-600">Manage central store inventory</p>
      </div>
      <ItemManagement />
    </div>
  );
}

// WSG Reports Component
function WSGReports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">WSG Reports & Analytics</h2>
        <p className="text-gray-600">Comprehensive reporting for central operations</p>
      </div>
      <Reports />
    </div>
  );
} 