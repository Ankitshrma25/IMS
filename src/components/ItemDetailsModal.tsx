import React from 'react';

interface ItemDetailsModalProps {
  item: any;
  onClose: () => void;
}

export default function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2 mb-6">
          <div><b className="text-black">Name:</b> <span className="text-black">{item.itemName}</span></div>
          <div><b className="text-black">Category:</b> <span className="text-black">{item.category}</span></div>
          <div><b className="text-black">Serial Number:</b> <span className="text-black">{item.serialNumber}</span></div>
          <div><b className="text-black">Description:</b> <span className="text-black">{item.description}</span></div>
          <div><b className="text-black">Condition:</b> <span className="text-black">{item.conditionStatus}</span></div>
          <div><b className="text-black">Location:</b> <span className="text-black">{item.location}</span></div>
          <div><b className="text-black">Stock Level:</b> <span className="text-black">{item.stockLevel} {item.unit}</span></div>
          <div><b className="text-black">Min Stock Level:</b> <span className="text-black">{item.minStockLevel} {item.unit}</span></div>
          <div><b className="text-black">Supplier:</b> <span className="text-black">{item.supplier}</span></div>
          <div><b className="text-black">Date Received:</b> <span className="text-black">{item.dateReceived ? new Date(item.dateReceived).toLocaleDateString() : '-'}</span></div>
          <div><b className="text-black">Lead Time:</b> <span className="text-black">{item.leadTime} days</span></div>
          <div><b className="text-black">Cost:</b> <span className="text-black">₹{item.cost}</span></div>
          {item.section && <div><b className="text-black">Section:</b> <span className="text-black">{item.section}</span></div>}
          {item.lastIssued && <div><b className="text-black">Last Issued:</b> <span className="text-black">{new Date(item.lastIssued).toLocaleDateString()}</span></div>}
          {item.expirationDate && <div><b className="text-black">Expires:</b> <span className="text-black">{new Date(item.expirationDate).toLocaleDateString()}</span></div>}
          {item.calibrationSchedule && <div><b className="text-black">Next Calibration:</b> <span className="text-black">{new Date(item.calibrationSchedule).toLocaleDateString()}</span></div>}
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-black">Transaction History</h4>
          <div className="max-h-48 overflow-y-auto border rounded-md">
            <table className="min-w-full text-xs text-black">
              <thead className="text-black">
                <tr>
                  <th className="px-2 py-1 text-black">Date</th>
                  <th className="px-2 py-1 text-black">Type</th>
                  <th className="px-2 py-1 text-black">Qty</th>
                  <th className="px-2 py-1 text-black">Ref</th>
                  <th className="px-2 py-1 text-black">By</th>
                  <th className="px-2 py-1 text-black">Notes</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {item.transactionHistory && item.transactionHistory.length > 0 ? (
                  item.transactionHistory.slice().reverse().map((tx: any, idx: number) => (
                    <tr key={idx} className="border-t text-black">
                      <td className="px-2 py-1 text-black">{tx.date ? new Date(tx.date).toLocaleDateString() : '-'}</td>
                      <td className="px-2 py-1 text-black">{tx.type}</td>
                      <td className="px-2 py-1 text-black">{tx.quantity}</td>
                      <td className="px-2 py-1 text-black">{tx.reference}</td>
                      <td className="px-2 py-1 text-black">{tx.performedBy}</td>
                      <td className="px-2 py-1 text-black">{tx.notes}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center py-2 text-black">No transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 