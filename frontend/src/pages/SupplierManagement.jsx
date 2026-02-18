import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        companiesSupplied: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const handleChange = (e) => {
        const value = e.target.name === 'name' ? e.target.value.toUpperCase() : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const companies = formData.companiesSupplied.split(',').map(c => c.trim()).filter(c => c);
            await api.post('/suppliers', { ...formData, companiesSupplied: companies });
            alert('Supplier Added');
            setFormData({ name: '', contactNumber: '', companiesSupplied: '' });
            fetchSuppliers();
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding supplier');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this supplier?')) {
            try {
                await api.delete(`/suppliers/${id}`);
                fetchSuppliers();
            } catch (error) {
                alert('Error deleting supplier');
            }
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Supplier Management</h1>
                <Link to="/supplier-ledger" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold shadow">
                    View Ledger
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Supplier Form */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Add New Supplier</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Madan Distributors"
                                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                            <input
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="e.g., 9876543210"
                                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Companies Supplied</label>
                            <textarea
                                name="companiesSupplied"
                                value={formData.companiesSupplied}
                                onChange={handleChange}
                                placeholder="e.g., Cipla, Sun Pharma, Dr. Reddy (comma separated)"
                                className="w-full p-2 border rounded mt-1 h-24 focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate company names with commas.</p>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold transition">
                            Add Supplier
                        </button>
                    </form>
                </div>

                {/* Suppliers List */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Your Suppliers</h2>
                    {suppliers.length === 0 ? (
                        <p className="text-gray-500">No suppliers added yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {suppliers.map(supplier => (
                                <div key={supplier._id} className="border p-4 rounded hover:bg-gray-50 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{supplier.name}</h3>
                                        <p className="text-sm text-gray-600">📞 {supplier.contactNumber}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {supplier.companiesSupplied.map((company, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {company}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(supplier._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierManagement;
