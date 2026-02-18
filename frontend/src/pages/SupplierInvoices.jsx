import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const SupplierInvoices = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);

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
        } catch (error) {
            console.error('Error fetching suppliers');
        }
    };

    const fetchInvoices = async (supplierId) => {
        try {
            const { data } = await api.get(`/medicines/supplier/${supplierId}/invoices`);
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices');
            setInvoices([]);
        }
    };

    const fetchInvoiceItems = async (invoiceNumber) => {
        try {
            const { data } = await api.get(`/medicines/supplier/${selectedSupplier}/invoice/${invoiceNumber}`);
            setInvoiceItems(data);
            setSelectedInvoice(invoiceNumber);
        } catch (error) {
            console.error('Error fetching invoice items');
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Link to="/pharmacy-admin" className="text-gray-600 hover:text-gray-900 mb-4 inline-block font-bold">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold mb-6 text-blue-800">Supplier Invoices</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier</label>
                <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full md:w-1/3 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Invoices List */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">Invoices</h2>
                    {!selectedSupplier ? (
                        <p className="text-gray-500 italic">Select a supplier to see invoices.</p>
                    ) : invoices.length === 0 ? (
                        <p className="text-gray-500">No invoices found for this supplier.</p>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {invoices.map((inv, index) => (
                                <div
                                    key={index}
                                    onClick={() => fetchInvoiceItems(inv)}
                                    className={`p-3 rounded cursor-pointer border hover:shadow-md transition ${selectedInvoice === inv ? 'bg-blue-100 border-blue-500 font-bold' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    Invoice #{inv}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Items List */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">
                        {selectedInvoice ? `Items in Invoice #${selectedInvoice}` : 'Invoice Details'}
                    </h2>

                    {!selectedInvoice ? (
                        <p className="text-gray-500 italic">Select an invoice to view items.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3">Item Name</th>
                                        <th className="p-3">Batch</th>
                                        <th className="p-3">Expiry</th>
                                        <th className="p-3">Qty</th>
                                        <th className="p-3">Cost</th>
                                        <th className="p-3">Added/Edited On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceItems.map(item => (
                                        <tr key={item._id} className="border-b">
                                            <td className="p-3 font-medium">{item.name}</td>
                                            <td className="p-3">{item.batchNumber}</td>
                                            <td className="p-3">{new Date(item.expiryDate).toLocaleDateString()}</td>
                                            <td className="p-3 font-bold">{item.quantity}</td>
                                            <td className="p-3">₹{item.supplierPrice}</td>
                                            <td className="p-3 text-gray-500">
                                                {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                                                <br />
                                                <span className="text-xs">{new Date(item.updatedAt || item.createdAt).toLocaleTimeString()}</span>
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
    );
};

export default SupplierInvoices;
