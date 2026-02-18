import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CustomerLedger = () => {
    const [mobile, setMobile] = useState('');
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBills = async () => {
        if (!mobile) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/bills/customer/${mobile}`);
            setBills(data);
        } catch (error) {
            console.error(error);
            alert('Error fetching customer bills');
        } finally {
            setLoading(false);
        }
    };

    const handleSettle = async (billId, balanceAmount) => {
        const amount = prompt(`Enter amount to settle (Pending: ₹${balanceAmount}):`);
        if (!amount) return;

        try {
            await api.post(`/bills/${billId}/settle`, { amount });
            alert('Payment recorded!');
            fetchBills(); // Refresh
        } catch (error) {
            alert(error.response?.data?.message || 'Error settling bill');
        }
    };

    const totalDue = bills.reduce((acc, bill) => acc + (bill.balanceAmount || 0), 0);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Link to="/pharmacy-admin" className="text-gray-600 hover:text-gray-900 mb-4 inline-block font-bold">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer Ledger (Udhaar)</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter Customer Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="p-2 border rounded w-full md:w-1/3"
                    />
                    <button onClick={fetchBills} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                        Search
                    </button>
                </div>
            </div>

            {mobile && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Transaction History: {mobile}</h2>
                        <div className="bg-red-100 text-red-800 px-4 py-2 rounded font-bold">
                            Total Due: ₹{totalDue.toFixed(2)}
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Items</th>
                                        <th className="p-3 text-right">Bill Total</th>
                                        <th className="p-3 text-right">Paid</th>
                                        <th className="p-3 text-right">Balance</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map(bill => (
                                        <tr key={bill._id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3 text-sm text-gray-600">
                                                {bill.items.map(i => i.name).join(', ').substring(0, 30)}...
                                            </td>
                                            <td className="p-3 text-right font-medium">₹{bill.totalAmount}</td>
                                            <td className="p-3 text-right text-green-600">₹{bill.paidAmount}</td>
                                            <td className="p-3 text-right text-red-600 font-bold">₹{bill.balanceAmount}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                                    bill.paymentStatus === 'Unpaid' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {bill.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {bill.paymentStatus !== 'Paid' && (
                                                    <button
                                                        onClick={() => handleSettle(bill._id, bill.balanceAmount)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                    >
                                                        Settle
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {bills.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="p-4 text-center text-gray-500">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerLedger;
