"use client";

import React from "react";

const mockInventory = [
  { id: 1, name: "Radio", quantity: 50, category: "Electronics" },
  { id: 2, name: "Night Gogle", quantity: 30, category: "Tech" },
  { id: 3, name: "Circuit Board", quantity: 15, category: "Electrical" },
];

const ManageInventoryPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Inventory</h1>

      <table className="w-full table-auto border-collapse rounded-md overflow-hidden shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Item Name</th>
            <th className="border px-4 py-2 text-left">Category</th>
            <th className="border px-4 py-2 text-left">Quantity</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockInventory.map((item) => (
            <tr key={item.id} className="even:bg-gray-50">
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2">{item.category}</td>
              <td className="border px-4 py-2">{item.quantity}</td>
              <td className="border px-4 py-2">
                <button className="text-blue-600 hover:underline mr-4">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageInventoryPage;
