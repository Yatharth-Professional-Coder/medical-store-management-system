import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const POSPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [discount, setDiscount] = useState(0);

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
                alert(`Only ${medicine.quantity} items available in stock!`);
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
                price: medicine.mrp, // Use MRP for billing
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
            alert(`Only ${medicine.quantity} items available in stock!`);
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
        const grandTotal = Math.max(0, subTotal - discountAmount); // Total to pay (Inclusive of Tax)
        const taxableAmount = grandTotal / 1.05;
        const taxAmount = grandTotal - taxableAmount; // Extract 5% GST
        return { subTotal, discountAmount, taxAmount, grandTotal };
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }
        if (!customerName || !customerMobile) {
            alert('Please enter customer details');
            return;
        }

        try {
            const { subTotal, discountAmount, grandTotal } = calculateTotals();
            await api.post('/bills', {
                customerName,
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
            fetchMedicines(); // Refresh stock
        } catch (error) {
            alert(error.response?.data?.message || 'Error generating bill');
        }
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left: Product Selection */}
            <div className="w-2/3 p-6 overflow-y-auto">
                <Link to="/pharmacy-admin" className="text-gray-600 hover:text-gray-900 mb-4 inline-block font-bold">&larr; Back to Dashboard</Link>
                <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
                <input
                    type="text"
                    placeholder="Search by Name or Batch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border rounded mb-6 shadow-sm"
                />

                <div className="grid grid-cols-3 gap-4">
                    {filteredMedicines.map(medicine => {
                        const isExpired = new Date(medicine.expiryDate) < new Date();
                        return (
                            <div key={medicine._id}
                                className={`p-4 rounded shadow transition ${isExpired || medicine.quantity === 0 ? 'bg-red-50 opacity-60 cursor-not-allowed' : 'bg-white hover:shadow-lg cursor-pointer'}`}
                                onClick={() => !isExpired && addToCart(medicine)}
                            >
                                <h3 className="font-bold text-lg flex justify-between">
                                    {medicine.name}
                                    {isExpired && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">EXPIRED</span>}
                                </h3>
                                <p className="text-sm text-gray-500">Batch: {medicine.batchNumber}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-green-600 font-bold">MRP: ₹{medicine.mrp}</span>
                                    <span className={`text-sm ${medicine.stock < 10 ? 'text-red-500' : 'text-gray-600'}`}>
                                        Stock: {medicine.quantity}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="w-1/3 bg-white p-6 shadow-xl flex flex-col">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Current Bill</h2>

                <div className="mb-4 space-y-2">
                    <input
                        placeholder="Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        placeholder="Mobile Number"
                        value={customerMobile}
                        onChange={(e) => setCustomerMobile(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                    {cart.map(item => (
                        <div key={item.medicineId} className="flex justify-between items-center border-b pb-2">
                            <div>
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-xs text-gray-500">@{item.price} x {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">₹{item.amount}</span>
                                <div className="flex flex-col gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.medicineId, item.quantity + 1); }} className="px-2 bg-gray-200 rounded text-xs">+</button>
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.medicineId, item.quantity - 1); }} className="px-2 bg-gray-200 rounded text-xs">-</button>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.medicineId); }} className="text-red-500 text-xl font-bold ml-2">&times;</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{calculateTotals().subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                        <span>Discount (₹)</span>
                        <input
                            type="number"
                            min="0"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="w-20 p-1 border rounded text-right"
                        />
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>GST (5%)</span>
                        <span>₹{calculateTotals().taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-2">
                        <span>Grand Total</span>
                        <span>₹{calculateTotals().grandTotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50 mt-4"
                        disabled={cart.length === 0}
                    >
                        COMPLETE SALE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POSPage;
