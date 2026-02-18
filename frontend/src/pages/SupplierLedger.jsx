import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const SupplierLedger = () => {
    const location = useLocation();
    const navigate = useNavigate();
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
    const [loading, setLoading] = useState(false);

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
        } catch (error) { console.error('Error fetching suppliers'); }
    };

    const fetchLedger = async (supplierId) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/suppliers/${supplierId}/ledger`);
            setLedger(data);
        } catch (error) { console.error('Error fetching ledger'); }
        finally { setLoading(false); }
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSupplier) return alert('Select vendor first');

        try {
            await api.post('/suppliers/transaction', { ...formData, supplierId: selectedSupplier });
            alert('Ledger entry recorded');
            setFormData({ ...formData, amount: '', description: '' });
            fetchLedger(selectedSupplier);
        } catch (error) { alert(error.response?.data?.message || 'Error recording entry'); }
    };

    const netBalance = ledger.reduce((acc, entry) => {
        if (entry.type === 'Purchase') return acc + entry.amount;
        return acc - entry.amount;
    }, 0);

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
            {/* Nav Header */}
            <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/suppliers')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Vendor Ledger</h1>
                        <p className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-widest hidden sm:block">Financial Balance Statement</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Control Panel */}
                    <div className="lg:col-span-4 space-y-6 animate-slide-up">
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest mb-3 block">Active Vendor profile</label>
                            <select
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                            >
                                <option value="">Select Vendor...</option>
                                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>

                        {selectedSupplier && (
                            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                                    </div>
                                    Manual Record
                                </h3>

                                <form onSubmit={handleTransactionSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Nature of Entry</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                                        >
                                            <option value="Payment">Payment (Cash/UPI Out)</option>
                                            <option value="Purchase">Purchase (Stock In)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Amount</label>
                                        <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Execution Date</label>
                                        <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Narration</label>
                                        <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Inv #8832" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
                                    </div>
                                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-slate-100 mt-2 italic">
                                        Commit Entry
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Data Display */}
                    <div className="lg:col-span-8 animate-slide-up delay-100">
                        {selectedSupplier ? (
                            <div className="space-y-6">
                                {/* Balance Header */}
                                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                                    <div className="text-center sm:text-left z-10">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Live OS Balance</p>
                                        <h2 className="text-4xl font-black tracking-tighter">₹{Math.abs(netBalance).toFixed(2)}</h2>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-2 px-3 py-1 inline-block rounded-full ${netBalance > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                                            {netBalance > 0 ? 'Protocol: Debt Outstanding' : 'Protocol: Security Advance'}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 z-10">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-2xl border border-white/10 backdrop-blur-md">
                                            {suppliers.find(s => s._id === selectedSupplier)?.name.charAt(0)}
                                        </div>
                                    </div>
                                </div>

                                {/* History List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ledger Archive</h3>
                                        {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-blue-600"></div>}
                                    </div>

                                    {ledger.length === 0 ? (
                                        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                            <p className="text-slate-300 font-bold italic tracking-widest uppercase text-xs">No Records Synchronized</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {ledger.map((entry) => (
                                                <div key={entry._id} className="group bg-white p-4 sm:p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-5 min-w-0">
                                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black border transition-colors ${entry.type === 'Payment' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                                entry.type === 'Return' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                                                                    'bg-red-50 border-red-100 text-red-600'
                                                            }`}>
                                                            <span className="text-[9px] uppercase leading-none mb-1 opacity-60">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                            <span className="text-xl leading-none">{new Date(entry.date).getDate()}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm tracking-tight truncate group-hover:text-blue-600 transition-colors uppercase">{entry.description || 'GENERIC LEDGER ENTRY'}</h4>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction: {entry.type}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-10 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                                                        <div className="text-right">
                                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Quantum</p>
                                                            <p className={`text-xl font-black ${entry.type === 'Purchase' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                                {entry.type === 'Purchase' ? '+' : '-'}₹{entry.amount.toFixed(0)}
                                                            </p>
                                                        </div>
                                                        <div className="hidden sm:flex w-8 h-8 rounded-full bg-slate-50 items-center justify-center text-slate-200 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-24 sm:py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 text-center">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 bg-blue-500/5 rounded-[2.5rem] animate-ping duration-1000"></div>
                                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest mb-2">Select Account</h3>
                                <p className="text-slate-400 font-medium text-xs max-w-xs mx-auto leading-relaxed">Choose a vendor profile to visualize the complete financial history and execute manual ledger entries.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SupplierLedger;
