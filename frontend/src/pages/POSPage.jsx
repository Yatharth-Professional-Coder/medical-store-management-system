import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const POSPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [discount, setDiscount] = useState(0);
    const [showCart, setShowCart] = useState(false); // Mobile cart visibility
    const navigate = useNavigate();

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const { data } = await api.get('/medicines');
            setMedicines(data);
        } catch (error) {
            console.error('Error fetching medicines:', error);
        }
    };

    const addToCart = (medicine) => {
        const existingItem = cart.find(item => item.medicineId === medicine._id);
        if (existingItem) {
            if (existingItem.quantity + 1 > medicine.quantity) {
                alert(`Stock Alert: Only ${medicine.quantity} available.`);
                return;
            }
            setCart(cart.map(item =>
                item.medicineId === medicine._id
                    ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * item.price }
                    : item
            ));
        } else {
            if (medicine.quantity < 1) {
                alert('Out of Stock!');
                return;
            }
            setCart([...cart, {
                medicineId: medicine._id,
                name: medicine.name,
                batchNumber: medicine.batchNumber,
                price: medicine.mrp,
                quantity: 1,
                amount: medicine.mrp
            }]);
        }
    };

    const removeFromCart = (medicineId) => {
        setCart(cart.filter(item => item.medicineId !== medicineId));
    };

    const updateQuantity = (medicineId, newQty) => {
        if (newQty < 1) return;
        const medicine = medicines.find(m => m._id === medicineId);
        if (newQty > medicine.quantity) {
            alert(`Stock Alert: Only ${medicine.quantity} available.`);
            return;
        }
        setCart(cart.map(item =>
            item.medicineId === medicineId
                ? { ...item, quantity: newQty, amount: newQty * item.price }
                : item
        ));
    };

    const calculateTotals = () => {
        const subTotal = cart.reduce((total, item) => total + item.amount, 0);
        const discountAmount = parseFloat(discount) || 0;
        const grandTotal = Math.max(0, subTotal - discountAmount);
        const taxAmount = grandTotal - (grandTotal / 1.05);
        return { subTotal, discountAmount, taxAmount, grandTotal };
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Cart is empty!');
        if (!customerName || !customerMobile) return alert('Enter customer details');

        try {
            const { subTotal, discountAmount, grandTotal } = calculateTotals();
            await api.post('/bills', {
                customerName: customerName.toUpperCase(),
                customerMobile,
                items: cart,
                subTotal,
                discountAmount,
                grandTotal
            });
            alert('Bill generated successfully!');
            setCart([]);
            setCustomerName('');
            setCustomerMobile('');
            setDiscount(0);
            fetchMedicines();
            setShowCart(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Error generating bill');
        }
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totals = calculateTotals();

    return (
        <div className="h-screen bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
            {/* Nav Header */}
            <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/pharmacy-admin')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Point of Sale</h1>
                        <p className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-widest hidden sm:block">Digital Billing Terminal</p>
                    </div>
                </div>

                {/* Mobile Cart Toggle */}
                <button
                    onClick={() => setShowCart(!showCart)}
                    className="lg:hidden relative p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-white">
                            {cart.length}
                        </span>
                    )}
                </button>
            </header>

            <main className="flex-1 flex overflow-hidden relative">
                {/* Product Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 sm:p-8 bg-slate-50/50">
                        <div className="max-w-4xl mx-auto relative group">
                            <input
                                type="text"
                                placeholder="Search inventory by name, batch, or salt..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-4 sm:p-6 pl-14 sm:pl-16 bg-white border-slate-200 border rounded-[2rem] shadow-xl shadow-slate-200/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 text-base sm:text-lg"
                            />
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 absolute left-5 sm:left-6 top-4 sm:top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-0 slim-scrollbar">
                        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {filteredMedicines.map(medicine => {
                                const isExpired = new Date(medicine.expiryDate) < new Date();
                                const isCritical = medicine.quantity < (medicine.minStockLevel || 10);
                                const isCarted = cart.find(i => i.medicineId === medicine._id);

                                return (
                                    <div
                                        key={medicine._id}
                                        onClick={() => !isExpired && medicine.quantity > 0 && addToCart(medicine)}
                                        className={`group relative p-4 rounded-[2rem] border transition-all transform hover:-translate-y-1 ${isExpired || medicine.quantity === 0
                                                ? 'bg-slate-50 opacity-60 cursor-not-allowed border-slate-100'
                                                : isCarted
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200'
                                                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-200/50 cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex flex-col h-full gap-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-black text-sm sm:text-base uppercase tracking-tight line-clamp-2">{medicine.name}</h3>
                                                {isExpired && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase whitespace-nowrap">Expired</span>}
                                            </div>

                                            <div className={`mt-auto pt-3 border-t ${isCarted ? 'border-white/20' : 'border-slate-50'}`}>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isCarted ? 'text-blue-100' : 'text-slate-400'}`}>Unit Price</p>
                                                        <p className="text-lg sm:text-xl font-black">₹{medicine.mrp}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-[9px] font-black uppercase tracking-widest ${isCarted ? 'text-blue-100' : 'text-slate-400'}`}>Stock</p>
                                                        <p className={`text-xs font-black ${isCritical && !isCarted ? 'text-red-500' : ''}`}>{medicine.quantity} UNIT</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cart Badge */}
                                        {isCarted && (
                                            <div className="absolute -top-2 -right-2 bg-white text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg border-2 border-blue-600">
                                                {isCarted.quantity}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Cart Component (Desktop + Mobile Overlay) */}
                <aside className={`fixed lg:relative inset-y-0 right-0 w-full sm:w-[400px] lg:w-[450px] bg-white shadow-2xl z-[60] flex flex-col transition-transform duration-500 transform ${showCart || window.innerWidth >= 1024 ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Bill</h2>
                        </div>
                        <button onClick={() => setShowCart(false)} className="lg:hidden p-2 bg-slate-100 rounded-full text-slate-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="p-6 space-y-4 shrink-0 bg-slate-50/50">
                        <div className="relative">
                            <input
                                placeholder="CUSTOMER NAME"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full p-4 bg-white border-slate-200 border rounded-2xl font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none uppercase text-sm"
                            />
                            <svg className="w-4 h-4 absolute right-4 top-4.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div className="relative">
                            <input
                                placeholder="MOBILE NUMBER"
                                value={customerMobile}
                                onChange={(e) => setCustomerMobile(e.target.value)}
                                className="w-full p-4 bg-white border-slate-200 border rounded-2xl font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm"
                            />
                            <svg className="w-4 h-4 absolute right-4 top-4.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 slim-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                                <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Cart is Empty</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.medicineId} className="group bg-slate-50/50 p-4 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-800 text-sm uppercase truncate mb-1">{item.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Batch {item.batchNumber}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.medicineId)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100/50">
                                        <div className="flex items-center bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                            <button onClick={() => updateQuantity(item.medicineId, item.quantity - 1)} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M20 12H4"></path></svg>
                                            </button>
                                            <span className="w-8 text-center font-black text-sm text-slate-700">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.medicineId, item.quantity + 1)} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4"></path></svg>
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase mb-0.5">Item Total</p>
                                            <p className="text-base font-black text-slate-900">₹{item.amount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary Footer */}
                    <div className="p-8 bg-slate-900 text-white rounded-t-[2.5rem] shadow-2xl space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Subtotal</span>
                                <span className="font-bold">₹{totals.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Extra Discount</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500 text-xs">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className="w-24 p-2 pl-6 bg-white/5 border border-white/10 rounded-xl text-right font-black text-xs outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">GST Included (5%)</span>
                                <span className="font-bold text-slate-400">₹{totals.taxAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex flex-col">
                                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Payable Net Amount</span>
                                    <span className="text-4xl font-black tracking-tighter">₹{totals.grandTotal.toFixed(2)}</span>
                                </div>
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                            >
                                Generate Final Bill
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                </aside>
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

export default POSPage;
