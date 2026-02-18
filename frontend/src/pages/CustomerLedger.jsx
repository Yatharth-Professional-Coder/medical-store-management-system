import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CustomerLedger = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '' });
    const [manualEntry, setManualEntry] = useState({ type: 'Credit', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data } = await api.get('/customers');
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers');
        }
    };

    const handleAddCustomer = async (e, force = false) => {
        if (e) e.preventDefault();
        try {
            const { data } = await api.post('/customers', { ...newCustomer, force });
            if (data.exists && !force) {
                if (window.confirm(data.message)) {
                    handleAddCustomer(null, true);
                }
                return;
            }
            alert('Customer Card Created Successfully');
            setNewCustomer({ name: '', mobile: '' });
            setShowAddForm(false);
            fetchCustomers();
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding customer');
        }
    };

    const viewCustomerDetails = async (customer) => {
        setSelectedCustomer(customer);
        setLoading(true);
        try {
            // Fetch Bills
            const { data: bills } = await api.get(`/bills/customer/${customer.mobile}`);
            // Fetch Manual Transactions
            const { data: manual } = await api.get(`/customers/${customer._id}/transactions`);

            // Combine and format
            const combined = [
                ...bills.map(b => ({
                    ...b,
                    entryType: 'Bill',
                    displayType: 'Sales Credit',
                    displayAmount: b.balanceAmount,
                    displayDetails: b.items.map(i => i.name).join(', '),
                    date: b.createdAt
                })),
                ...manual.map(m => ({
                    ...m,
                    entryType: 'Manual',
                    displayType: m.type === 'Credit' ? 'Manual Credit' : 'Payment Received',
                    displayAmount: m.amount,
                    displayDetails: m.description || 'N/A',
                    date: m.date
                }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(combined);
        } catch (error) {
            alert('Error fetching history');
        } finally {
            setLoading(false);
        }
    };

    const handleAddManualEntry = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers/transaction', {
                customerId: selectedCustomer._id,
                ...manualEntry
            });
            alert('Transaction recorded!');
            setManualEntry({ type: 'Credit', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
            setShowTransactionForm(false);
            viewCustomerDetails(selectedCustomer);
            fetchCustomers(); // Refresh balances
        } catch (error) {
            alert(error.response?.data?.message || 'Error recording transaction');
        }
    };

    const handleSettle = async (billId, balanceAmount) => {
        const amount = prompt(`Enter amount to settle (Pending: ₹${balanceAmount}):`);
        if (!amount || isNaN(amount) || amount <= 0) return;

        try {
            await api.post(`/bills/${billId}/settle`, { amount });
            alert('Payment recorded!');
            if (selectedCustomer) viewCustomerDetails(selectedCustomer);
            fetchCustomers(); // Refresh card balances
        } catch (error) {
            alert(error.response?.data?.message || 'Error settling bill');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm)
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <Link to="/pharmacy-admin" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center font-bold transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Customer Ledger</h1>
                    <p className="text-gray-500 font-medium">Manage Udhaar credits and customer cards</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 ${showAddForm ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {showAddForm ? 'Cancel Registration' : '+ New Customer Card'}
                </button>
            </div>

            {/* Registration Form */}
            {showAddForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl mb-10 border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-black mb-6 text-gray-800 flex items-center">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        </span>
                        Register New Customer Card
                    </h2>
                    <form onSubmit={(e) => handleAddCustomer(e)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. RAHUL SHARMA"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                className="w-full p-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 uppercase font-bold text-gray-700 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                            <input
                                type="text"
                                placeholder="10 Digit Mobile"
                                value={newCustomer.mobile}
                                onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                                className="w-full p-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 transition-all"
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 shadow-md transition-all active:scale-95">
                                CREATE CARD
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Search & List */}
                <div className="lg:col-span-4 flex flex-col space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search cards by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-4 pl-12 bg-white border-0 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition-all"
                        />
                        <svg className="w-5 h-5 absolute left-4 top-4.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                        {filteredCustomers.length === 0 && (
                            <div className="text-center py-10 text-gray-400 font-medium bg-white rounded-2xl border-2 border-dashed">
                                No cards found
                            </div>
                        )}
                        {filteredCustomers.map(c => (
                            <div
                                key={c._id}
                                onClick={() => viewCustomerDetails(c)}
                                className={`p-4 rounded-2xl shadow-sm border transition-all cursor-pointer flex items-center justify-between ${selectedCustomer?._id === c._id ? 'bg-blue-600 border-blue-600 text-white transform scale-[1.02] shadow-blue-200 shadow-xl' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${selectedCustomer?._id === c._id ? 'bg-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${selectedCustomer?._id === c._id ? 'text-white' : 'text-gray-800'}`}>{c.name}</h3>
                                        <p className={`text-xs ${selectedCustomer?._id === c._id ? 'text-blue-100' : 'text-gray-400'}`}>{c.mobile}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black ${selectedCustomer?._id === c._id ? 'text-white' : c.totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        ₹{c.totalDue.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-8">
                    {selectedCustomer ? (
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
                            {/* Header */}
                            <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white flex justify-between items-center">
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center text-3xl font-black">
                                        {selectedCustomer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight">{selectedCustomer.name}</h2>
                                        <div className="flex items-center mt-1 space-x-3 text-gray-400">
                                            <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> {selectedCustomer.mobile}</span>
                                            <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                                            <span className="flex items-center font-medium">Joined {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/20 text-center backdrop-blur-sm">
                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-300 mb-1">Live OS Balance</p>
                                    <p className={`text-4xl font-black ${selectedCustomer.totalDue > 0 ? 'text-red-400' : 'text-green-400'}`}>₹{selectedCustomer.totalDue.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex-1 overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-black text-gray-800 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Unified Ledger (Manual + Bills)
                                    </h3>
                                    <button
                                        onClick={() => setShowTransactionForm(!showTransactionForm)}
                                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs font-black hover:bg-gray-200 transition-all border border-gray-200"
                                    >
                                        {showTransactionForm ? 'Cancel Entry' : '+ Manual Entry'}
                                    </button>
                                </div>

                                {showTransactionForm && (
                                    <form onSubmit={handleAddManualEntry} className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 mb-8 animate-in zoom-in duration-200 grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                        <div className="col-span-1 space-y-1">
                                            <label className="text-[10px] uppercase font-black text-gray-400 ml-1">Type</label>
                                            <select
                                                value={manualEntry.type}
                                                onChange={(e) => setManualEntry({ ...manualEntry, type: e.target.value })}
                                                className="w-full p-3 bg-white border-0 rounded-xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="Credit">Credit (Debit Customer)</option>
                                                <option value="Payment">Payment (Credit Customer)</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1 space-y-1">
                                            <label className="text-[10px] uppercase font-black text-gray-400 ml-1">Amount</label>
                                            <input
                                                type="number"
                                                placeholder="₹ 0.00"
                                                value={manualEntry.amount}
                                                onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                                                className="w-full p-3 bg-white border-0 rounded-xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-black text-gray-400 ml-1">Description</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Received cash at counter"
                                                value={manualEntry.description}
                                                onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                                                className="w-full p-3 bg-white border-0 rounded-xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-black text-gray-400 ml-1">Transaction Date</label>
                                            <input
                                                type="date"
                                                value={manualEntry.date}
                                                onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                                                className="w-full p-3 bg-white border-0 rounded-xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 uppercase tracking-wider text-xs">
                                                Post Transaction
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {loading ? (
                                    <div className="flex justify-center items-center py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transactions.length === 0 && (
                                            <div className="py-20 text-center text-gray-400 font-medium italic">
                                                No transactions recorded on this card.
                                            </div>
                                        )}
                                        {transactions.map((entry, idx) => (
                                            <div key={idx} className={`group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all flex items-center justify-between ${entry.entryType === 'Manual' ? 'border-l-4 border-l-blue-400' : ''}`}>
                                                <div className="flex items-center space-x-5">
                                                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                                        <span className="text-xs font-black text-gray-400 group-hover:text-blue-400 uppercase">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                        <span className="text-xl font-black text-gray-900 leading-none">{new Date(entry.date).getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`w-2 h-2 rounded-full ${entry.displayType.includes('Payment') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                            <h4 className="font-bold text-gray-800 truncate max-w-xs">{entry.displayDetails}</h4>
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase">
                                                            {entry.entryType} • {entry.displayType}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-8 text-right">
                                                    <div className="space-y-1 w-24">
                                                        <p className="text-[10px] font-black text-gray-300 uppercase leading-none">Net Amount</p>
                                                        <p className={`text-lg font-black ${entry.displayType.includes('Payment') ? 'text-green-600' : 'text-red-600'}`}>
                                                            {entry.displayType.includes('Payment') ? '-' : ''}₹{entry.displayAmount}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        {entry.entryType === 'Bill' && entry.paymentStatus !== 'Paid' && (
                                                            <button
                                                                onClick={() => handleSettle(entry._id, entry.displayAmount)}
                                                                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-blue-600 shadow-sm transition-all active:scale-95"
                                                            >
                                                                SETTLE BILL
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] shadow-sm border-4 border-dashed border-gray-100">
                            <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-gray-200">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-300 mb-2">No Customer Selected</h3>
                            <p className="text-gray-400 text-center max-w-xs font-medium">Please pick a credit card from the left list to view their udhaar history or settle dues.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerLedger;
