import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const BillsHistory = () => {
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/bills');
            setBills(data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('WARNING: Deleting this bill will restore medicine stock. Continue?')) {
            try {
                await api.delete(`/bills/${id}`);
                fetchBills();
                setSelectedBill(null);
                alert('Bill deleted and stock reverted.');
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting bill');
            }
        }
    };

    const filteredBills = bills.filter(bill =>
        bill.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customerMobile?.includes(searchTerm) ||
        bill._id.slice(-6).includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
            {/* Nav Header */}
            <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/pharmacy-admin')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Sales History</h1>
                        <p className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-widest hidden sm:block">Archive of generated bills</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                {/* Search & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                    <div className="md:col-span-8 relative group">
                        <input
                            type="text"
                            placeholder="Find by Customer Name, Mobile, or Bill ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-4 pl-14 bg-white border-slate-200 border rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                        />
                        <svg className="w-6 h-6 absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <div className="md:col-span-4 flex items-center justify-center sm:justify-end gap-3 px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl">
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Record Count</p>
                            <p className="text-xl font-black text-blue-700">{filteredBills.length} Invoices Found</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Retrying History...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBills.length === 0 ? (
                            <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <p className="text-slate-400 font-black text-lg">No matching records</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBills.map((bill) => (
                                    <div key={bill._id} className="group bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-7 hover:shadow-2xl hover:shadow-slate-200/60 transition-all transform hover:-translate-y-1 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bill ID</p>
                                                <p className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">#{bill._id.slice(-6)}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                                                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">{bill.customerName}</h4>
                                                <p className="text-xs font-bold text-slate-500">{bill.customerMobile}</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                                    <p className="text-sm font-bold text-slate-700">{new Date(bill.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total</p>
                                                    <p className="text-2xl font-black text-emerald-600">₹{bill.totalAmount.toFixed(0)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                                            <button
                                                onClick={() => setSelectedBill(bill)}
                                                className="py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                                            >
                                                View Receipt
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bill._id)}
                                                className="py-3 bg-white text-red-500 border border-red-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                                            >
                                                Discard
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Bill Detail Modal - Modernized */}
            {selectedBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setSelectedBill(null)} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="text-center mb-8 border-b border-slate-100 pb-8">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-xl shadow-blue-200">
                                M
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedBill.pharmacyName}</h2>
                            {selectedBill.gstNumber && <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">GSTIN: {selectedBill.gstNumber}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Info</p>
                                <p className="font-extrabold text-slate-800 uppercase">{selectedBill.customerName}</p>
                                <p className="font-bold text-slate-500">{selectedBill.customerMobile}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invoice Info</p>
                                <p className="font-extrabold text-slate-800">#{selectedBill._id.slice(-8).toUpperCase()}</p>
                                <p className="font-bold text-slate-500">{new Date(selectedBill.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 mb-8 border border-slate-100">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-slate-400 font-extrabold uppercase tracking-widest border-b border-slate-200">
                                        <th className="text-left pb-4">Particulars</th>
                                        <th className="text-center pb-4">Qty</th>
                                        <th className="text-right pb-4">Net Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {selectedBill.items.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-100 last:border-0">
                                            <td className="py-4">
                                                <p className="font-black text-slate-900 uppercase">{item.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 tracking-widest">BATCH: {item.batchNumber}</p>
                                            </td>
                                            <td className="text-center font-bold text-slate-600">{item.quantity}</td>
                                            <td className="text-right font-black text-slate-900">₹{item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-200">
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>Item Total (Subtotal)</span>
                                <span className="text-slate-900">₹{selectedBill.subTotal?.toFixed(2)}</span>
                            </div>
                            {selectedBill.discountAmount > 0 && (
                                <div className="flex justify-between text-xs font-bold text-red-500 uppercase tracking-widest">
                                    <span>Applied Discount (₹)</span>
                                    <span>-₹{selectedBill.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                                <span>Includes Net GST (5%)</span>
                                <span>₹{(selectedBill.taxAmount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t-2 border-slate-900 border-dashed">
                                <div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Final Amount</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{selectedBill.totalAmount.toFixed(2)}</p>
                                </div>
                                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    Fully Paid
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-4 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2H7a2 2 0 00-2 2v4m14 4h.01"></path></svg>
                                Print Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillsHistory;
