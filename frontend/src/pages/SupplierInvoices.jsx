import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const SupplierInvoices = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (selectedSupplier) {
            fetchInvoices(selectedSupplier);
            setSelectedInvoice(null);
            setInvoiceItems([]);
        }
    }, [selectedSupplier]);

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (error) { console.error('Error fetching suppliers'); }
    };

    const fetchInvoices = async (supplierId) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/medicines/supplier/${supplierId}/invoices`);
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices');
            setInvoices([]);
        } finally { setLoading(false); }
    };

    const fetchInvoiceItems = async (invoiceNumber) => {
        try {
            const { data } = await api.get(`/medicines/supplier/${selectedSupplier}/invoice/${invoiceNumber}`);
            setInvoiceItems(data);
            setSelectedInvoice(invoiceNumber);
        } catch (error) { console.error('Error fetching invoice items'); }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
            {/* Nav Header */}
            <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/suppliers')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Supplier Invoices</h1>
                        <p className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-widest hidden sm:block">Purchase Documentation History</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 animate-slide-up">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest mb-3 block">Filter by Active Vendor</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="w-full sm:w-1/3 p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                        >
                            <option value="">Select Vendor Profile...</option>
                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <div className="hidden sm:flex flex-1 items-center justify-end px-6 border-l border-slate-100">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed max-w-[200px] text-right">Records are archived automatically when bulk stock is uploaded.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Invoices List */}
                    <div className="lg:col-span-4 space-y-4 animate-slide-up delay-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 mb-2">Available Invoices</h3>
                        {!selectedSupplier ? (
                            <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                                <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest italic px-8">Awaiting Vendor Selection</p>
                            </div>
                        ) : invoices.length === 0 ? (
                            <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">Zero Records Found</p>
                            </div>
                        ) : (
                            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 slim-scrollbar">
                                {invoices.map((inv, index) => (
                                    <div
                                        key={index}
                                        onClick={() => fetchInvoiceItems(inv)}
                                        className={`group p-5 rounded-[2rem] cursor-pointer border transition-all transform hover:-translate-y-1 ${selectedInvoice === inv
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                                : 'bg-white border-slate-100 hover:border-blue-200 text-slate-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${selectedInvoice === inv ? 'bg-white/10' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>#</div>
                                                <p className="font-black uppercase tracking-tight">Inv {inv}</p>
                                            </div>
                                            <svg className={`w-5 h-5 transition-transform ${selectedInvoice === inv ? 'translate-x-1' : 'text-slate-200 group-hover:translate-x-1 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="lg:col-span-8 animate-slide-up delay-200">
                        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="p-8 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                    </div>
                                    {selectedInvoice ? `Consignment: #${selectedInvoice}` : 'Consignment Manifest'}
                                </h3>
                                {selectedInvoice && (
                                    <div className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                                        Verified Receipt
                                    </div>
                                )}
                            </div>

                            {!selectedInvoice ? (
                                <div className="py-32 text-center opacity-40">
                                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Manifest Placeholder</p>
                                    <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase">Select specific invoice to visualize items</p>
                                </div>
                            ) : (
                                <div className="p-4 sm:p-8 overflow-x-auto">
                                    <table className="w-full text-left text-xs sm:text-sm">
                                        <thead>
                                            <tr className="text-slate-400 font-extrabold uppercase tracking-widest border-b border-slate-100 pb-4">
                                                <th className="p-4">Particulars</th>
                                                <th className="p-4">Net Expiry</th>
                                                <th className="p-4 text-center">Batch Index</th>
                                                <th className="p-4 text-right">Stock</th>
                                                <th className="p-4 text-right">Cost Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-700">
                                            {invoiceItems.map(item => (
                                                <tr key={item._id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                                    <td className="p-4 font-black text-slate-900 uppercase tracking-tight">{item.name}</td>
                                                    <td className="p-4 font-bold text-slate-500">{new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</td>
                                                    <td className="p-4 text-center font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{item.batchNumber}</td>
                                                    <td className="p-4 text-right font-black text-slate-900">{item.quantity} UNIT</td>
                                                    <td className="p-4 text-right">
                                                        <span className="font-black text-emerald-600">₹{item.supplierPrice.toFixed(2)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .slim-scrollbar::-webkit-scrollbar { width: 5px; }
                .slim-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .slim-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .slim-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};

export default SupplierInvoices;
