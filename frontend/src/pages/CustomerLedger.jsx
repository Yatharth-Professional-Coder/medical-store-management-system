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
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);

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
        setIsMobileListOpen(false); // Close list on mobile to show details
        try {
            const { data: manual } = await api.get(`/customers/${customer._id}/transactions`);

            const formatted = manual.map(m => ({
                ...m,
                displayType: m.type === 'Credit' ? 'Manual Credit' : 'Payment Received',
                displayAmount: m.amount,
                displayDetails: m.description || 'N/A',
                date: m.date
            })).sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(formatted);
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

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link to="/pharmacy-admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Ledger</h1>
                                <p className="text-sm text-slate-500 font-medium hidden sm:block">Manage manual credits and payments</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 ${showAddForm ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {showAddForm ? (
                                <>Cancel</>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                                    Add Customer Card
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                {/* Registration Form (Premium) */}
                {showAddForm && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 mb-8 border border-blue-50 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                            </div>
                            <h2 className="text-xl font-black text-slate-800">New Ledger Card</h2>
                        </div>
                        <form onSubmit={(e) => handleAddCustomer(e)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Customer Name"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl font-bold text-slate-700 transition-all uppercase outline-none"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Mobile Number</label>
                                <input
                                    type="text"
                                    placeholder="10 digit number"
                                    value={newCustomer.mobile}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl font-bold text-slate-700 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-[0.98]">
                                    CREATE CARD
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-180px)]">
                    {/* Left Panel: Search & Cards */}
                    <div className={`lg:col-span-4 flex flex-col gap-4 ${!isMobileListOpen && 'hidden lg:flex'}`}>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-4 pl-12 bg-white border-slate-200 border rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                            />
                            <svg className="w-5 h-5 absolute left-4 top-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 slim-scroll">
                            {filteredCustomers.length === 0 && (
                                <div className="text-center py-12 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </div>
                                    <p className="text-slate-500 font-bold">No customers found</p>
                                    <p className="text-xs text-slate-400 mt-1">Try a different search term or add a new card.</p>
                                </div>
                            )}
                            {filteredCustomers.map(c => (
                                <div
                                    key={c._id}
                                    onClick={() => viewCustomerDetails(c)}
                                    className={`p-4 rounded-2xl transition-all cursor-pointer flex items-center border ${selectedCustomer?._id === c._id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]'
                                            : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md text-slate-700'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg mr-4 ${selectedCustomer?._id === c._id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {c.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <h3 className="font-bold truncate">{c.name}</h3>
                                        <p className={`text-xs font-medium ${selectedCustomer?._id === c._id ? 'text-blue-100' : 'text-slate-400'}`}>{c.mobile}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`font-black text-sm whitespace-nowrap ${selectedCustomer?._id === c._id ? 'text-white' : c.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'
                                            }`}>
                                            ₹{c.totalDue.toFixed(0)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Details (Responsive) */}
                    <div className={`lg:col-span-8 flex flex-col ${isMobileListOpen && 'hidden lg:flex'}`}>
                        {selectedCustomer ? (
                            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
                                {/* Details Header */}
                                <div className="p-6 sm:p-8 bg-slate-900 text-white">
                                    <button
                                        onClick={() => setIsMobileListOpen(true)}
                                        className="lg:hidden mb-4 flex items-center text-slate-400 font-bold text-sm"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                        Back to Cards
                                    </button>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/10 shadow-inner">
                                                {selectedCustomer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{selectedCustomer.name}</h2>
                                                <div className="flex items-center mt-1 flex-wrap gap-x-4 gap-y-1 text-slate-400">
                                                    <span className="flex items-center text-sm font-bold"><svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> {selectedCustomer.mobile}</span>
                                                    <span className="hidden sm:block text-slate-700">•</span>
                                                    <span className="text-xs font-bold uppercase tracking-widest">Active Card</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm text-center sm:text-right">
                                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1">TOTAL BALANCE</p>
                                            <p className={`text-3xl font-black ${selectedCustomer.totalDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>₹{selectedCustomer.totalDue.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Content */}
                                <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-slate-50/30 overflow-hidden">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                                            </div>
                                            Manual Entrance Records
                                        </h3>
                                        <button
                                            onClick={() => setShowTransactionForm(!showTransactionForm)}
                                            className="w-full sm:w-auto bg-white text-slate-900 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-slate-50 border border-slate-200 shadow-sm transition-all flex items-center justify-center"
                                        >
                                            {showTransactionForm ? 'Minimize Form' : '+ New Entry'}
                                        </button>
                                    </div>

                                    {showTransactionForm && (
                                        <form onSubmit={handleAddManualEntry} className="bg-white p-6 rounded-3xl border border-slate-200 mb-8 animate-in zoom-in-95 duration-200 shadow-xl shadow-slate-200/20">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Transaction Type</label>
                                                    <select
                                                        value={manualEntry.type}
                                                        onChange={(e) => setManualEntry({ ...manualEntry, type: e.target.value })}
                                                        className="w-full p-3.5 bg-slate-50 border-transparent rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                    >
                                                        <option value="Credit">Credit (Udhaar Given)</option>
                                                        <option value="Payment">Payment (Cash Recd)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Amount</label>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={manualEntry.amount}
                                                        onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                                                        className="w-full p-3.5 bg-slate-50 border-transparent rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div className="sm:col-span-2 space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Brief Remark</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Purpose of Credit/Payment"
                                                        value={manualEntry.description}
                                                        onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                                                        className="w-full p-3.5 bg-slate-50 border-transparent rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2 space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Entry Date</label>
                                                    <input
                                                        type="date"
                                                        value={manualEntry.date}
                                                        onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                                                        className="w-full p-3.5 bg-slate-50 border-transparent rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 uppercase tracking-widest text-xs transition-all active:scale-[0.98]">
                                                        Post Secure Entry
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {loading ? (
                                        <div className="flex flex-col justify-center items-center py-24 gap-4">
                                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                                            <p className="text-slate-400 font-bold text-sm">Synchronizing Card Records...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 pb-8">
                                            {transactions.length === 0 && (
                                                <div className="py-24 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                                    </div>
                                                    <p className="text-slate-400 font-bold text-lg italic">No manual entries found</p>
                                                    <button onClick={() => setShowTransactionForm(true)} className="mt-4 text-blue-600 font-black text-sm hover:underline uppercase tracking-widest">Initialize First Entry</button>
                                                </div>
                                            )}
                                            {transactions.map((entry, idx) => (
                                                <div key={idx} className="group bg-white border border-slate-100 p-4 sm:p-5 rounded-[1.5rem] hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-colors ${entry.displayType.includes('Payment') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                                                            }`}>
                                                            <span className="text-[10px] font-black uppercase leading-none opacity-60 mb-0.5">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                            <span className="text-xl font-black leading-none">{new Date(entry.date).getDate()}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-slate-800 break-words group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{entry.displayDetails}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${entry.displayType.includes('Payment') ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ENTRY Log • {entry.displayType}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">NET IMPACT</p>
                                                            <p className={`text-xl font-black ${entry.displayType.includes('Payment') ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {entry.displayType.includes('Payment') ? '-' : '+'}₹{entry.displayAmount.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 sm:p-24 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-slate-100 text-center">
                                <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-blue-500/5 rounded-[3rem] animate-ping duration-1000"></div>
                                    <svg className="w-14 h-14 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-300 mb-3 tracking-tight">Select a Ledger Card</h3>
                                <p className="text-slate-400 max-w-sm font-medium leading-relaxed">Choose a customer from the side menu to manage their manual Udhaar history, track payments, and view current outstanding balances.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .slim-scroll::-webkit-scrollbar { width: 6px; }
                .slim-scroll::-webkit-scrollbar-track { background: transparent; }
                .slim-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .slim-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};

export default CustomerLedger;
