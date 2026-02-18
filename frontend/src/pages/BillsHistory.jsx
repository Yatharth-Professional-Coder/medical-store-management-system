import { useState, useEffect } from 'react';
import api from '../api/axios';

const BillsHistory = () => {
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const { data } = await api.get('/bills');
            setBills(data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    return (
        <div className="p-8 h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold mb-6">Sales History</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {bills.map((bill) => (
                            <tr key={bill._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(bill.createdAt).toLocaleDateString()} {new Date(bill.createdAt).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{bill.customerName}</div>
                                    <div className="text-sm text-gray-500">{bill.customerMobile}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {bill.items.length} items
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    ₹{bill.totalAmount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setSelectedBill(bill)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bill Detail Modal */}
            {selectedBill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Bill Details</h2>
                            <button onClick={() => setSelectedBill(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>

                        <div className="mb-4 space-y-1">
                            <p><strong>Date:</strong> {new Date(selectedBill.createdAt).toLocaleString()}</p>
                            <p><strong>Customer:</strong> {selectedBill.customerName} ({selectedBill.customerMobile})</p>
                            <p><strong>Bill ID:</strong> {selectedBill._id}</p>
                        </div>

                        <table className="w-full mb-4">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Item</th>
                                    <th className="text-center py-2">Qty</th>
                                    <th className="text-right py-2">Price</th>
                                    <th className="text-right py-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedBill.items.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">{item.name} <span className="text-xs text-gray-500">({item.batchNumber})</span></td>
                                        <td className="text-center py-2">{item.quantity}</td>
                                        <td className="text-right py-2">₹{item.price}</td>
                                        <td className="text-right py-2">₹{item.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-black">
                            <span>Grand Total</span>
                            <span>₹{selectedBill.totalAmount}</span>
                        </div>

                        <div className="mt-6 text-center">
                            <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black">
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillsHistory;
