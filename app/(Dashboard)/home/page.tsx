// @app/(Dashboard)/home/page.tsx

"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Mock inventory for demo
const mockInventory = [
  { id: 1, name: "Wrench Set", quantity: 50, category: "Tools" },
  { id: 2, name: "Engine Oil", quantity: 12, category: "Consumables" },
  { id: 3, name: "Circuit Board", quantity: 15, category: "Electronics" },
  { id: 4, name: "Paint Bucket", quantity: 5, category: "Paint" },
];

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = mockInventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Welcome to 509 ABW Inventory System</h1>

      {/* Search */}
      <div className="mb-6 flex items-center gap-2 border border-gray-200 rounded-md bg-white px-4 py-2 shadow-sm max-w-xl">
        <Search className="text-gray-400" />
        <Input
          placeholder="Search inventory..."
          className="border-0 focus:ring-0 focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Total Items</h2>
          <p className="text-3xl mt-2 text-green-700 font-bold">812</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Low Stock</h2>
          <p className="text-3xl mt-2 text-red-600 font-bold">12</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Issued Today</h2>
          <p className="text-3xl mt-2 text-blue-600 font-bold">28</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Pending Requests</h2>
          <p className="text-3xl mt-2 text-yellow-600 font-bold">5</p>
        </div>
      </div>

      {/* Search Results */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Search Results</h2>
        {filteredItems.length === 0 ? (
          <p className="text-gray-500">No items found.</p>
        ) : (
          <ul className="space-y-4">
            {filteredItems.map((item) => (
              <li
                key={item.id}
                className="border rounded-md bg-white p-4 shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-lg">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Category: {item.category} | Quantity: {item.quantity}
                  </p>
                </div>
                <button className="text-sm text-blue-600 hover:underline">
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomePage;
