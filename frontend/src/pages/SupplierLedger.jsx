import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useLocation } from 'react-router-dom';

const SupplierLedger = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSupplierId = queryParams.get('supplierId') || '';

    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(initialSupplierId);
    const [ledger, setLedger] = useState([]);
    const [formData, setFormData] = useState({
        type: 'Payment',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (selectedSupplier) {
            fetchLedger(selectedSupplier);
        } else {
            setLedger([]);
        }
    }, [selectedSupplier]);

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers');
        }
    };

    const fetchLedger = async (supplierId) => {
        try {
            const { data } = await api.get(`/suppliers/${supplierId}/ledger`);
            setLedger(data);
        } catch (error) {
            console.error('Error fetching ledger');
        }
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSupplier) {
            alert('Please select a supplier first');
            return;
        }

        try {
            await api.post('/suppliers/transaction', {
                ...formData,
                supplierId: selectedSupplier
            });
            alert('Transaction Added');
            setFormData({ ...formData, amount: '', description: '' });
            fetchLedger(selectedSupplier);
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding transaction');
        }
    };

    // Calculate Net Balance
    // Purchase adds to balance (We owe them)
    // Payment reduces balance (We paid them)
    const netBalance = ledger.reduce((acc, entry) => {
        return entry.type === 'Purchase' ? acc + entry.amount : acc - entry.amount;
    }, 0);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Supplier Ledger</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Selection & Add Entry */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier</label>
                        <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Select Supplier --</option>
                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>

                    {selectedSupplier && (
                        <div>
                            <h2 className="text-lg font-bold mb-4 border-b pb-2">Add Transaction</h2>
                            <form onSubmit={handleTransactionSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-600">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="Payment">Payment (Debit)</option>
                                        <option value="Purchase">Purchase (Credit)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Amount</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g. Invoice #123"
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                                    Add Entry
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Ledger Table */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    {selectedSupplier ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Transaction History</h2>
                                <div className={`px-4 py-2 rounded font-bold ${netBalance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    Net Balance: ₹{Math.abs(netBalance)} {netBalance > 0 ? '(Due)' : '(Advance)'}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Description</th>
                                            <th className="p-3 text-center">Type</th>
                                            <th className="p-3 text-right">Debit (Paid)</th>
                                            <th className="p-3 text-right">Credit (item)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledger.map((entry) => (
                                            <tr key={entry._id} className="border-b">
                                                <td className="p-3">{new Date(entry.date).toLocaleDateString()}</td>
                                                <td className="p-3">{entry.description}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${entry.type === 'Payment' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {entry.type}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-medium text-green-600">
                                                    {entry.type === 'Payment' ? `₹${entry.amount}` : '-'}
                                                </td>
                                                <td className="p-3 text-right font-medium text-red-600">
                                                    {entry.type === 'Purchase' ? `₹${entry.amount}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {ledger.length === 0 && (
                                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No transactions recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a supplier to view ledger.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierLedger;
