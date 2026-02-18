import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [formData, setFormData] = useState({
        adminName: '', adminEmail: '', adminPassword: '', pharmacyName: '', address: '', licenseNumber: '', contactNumber: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || userInfo.role !== 'SuperAdmin') {
            navigate('/');
        } else {
            fetchPharmacies();
        }
    }, [navigate]);

    const fetchPharmacies = async () => {
        try {
            const { data } = await api.get('/pharmacies');
            setPharmacies(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pharmacies', formData);
            fetchPharmacies();
            setFormData({ adminName: '', adminEmail: '', adminPassword: '', pharmacyName: '', address: '', licenseNumber: '', contactNumber: '' });
            alert('Pharmacy Added Successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding pharmacy');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/pharmacies/${id}`);
                fetchPharmacies();
            } catch (error) {
                alert('Error deleting pharmacy');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-gray-100 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Add New Pharmacy</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input name="pharmacyName" placeholder="Pharmacy Name" value={formData.pharmacyName} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <input name="licenseNumber" placeholder="License Number" value={formData.licenseNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <h3 className="font-semibold mt-2">Admin Details</h3>
                        <input name="adminName" placeholder="Admin Name" value={formData.adminName} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <input name="adminEmail" placeholder="Admin Email" type="email" value={formData.adminEmail} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <input name="adminPassword" placeholder="Admin Password" type="password" value={formData.adminPassword} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Create Pharmacy</button>
                    </form>
                </div>

                {/* List Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Existing Pharmacies</h2>
                    {pharmacies.length === 0 ? <p>No pharmacies found.</p> : (
                        <ul className="space-y-4">
                            {pharmacies.map((pharmacy) => (
                                <li key={pharmacy._id} className="border p-4 rounded flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold">{pharmacy.name}</h3>
                                        <p className="text-sm text-gray-600">License: {pharmacy.licenseNumber}</p>
                                        <p className="text-sm text-gray-600">Owner: {pharmacy.owner?.name} ({pharmacy.owner?.email})</p>
                                    </div>
                                    <button onClick={() => handleDelete(pharmacy._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
