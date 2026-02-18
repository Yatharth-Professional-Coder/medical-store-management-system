import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPharmacy = () => {
    const [formData, setFormData] = useState({
        adminName: '', adminEmail: '', adminPassword: '', pharmacyName: '', address: '', licenseNumber: '', contactNumber: '', gstNumber: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pharmacies/register', formData);
            alert('Registration successful! Please wait for Super Admin approval.');
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Error registering pharmacy');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-lg relative">
                <Link to="/" className="absolute top-4 left-4 text-gray-500 hover:text-gray-700">&larr; Back</Link>
                <h2 className="text-2xl mb-6 font-bold text-center text-blue-800">Register Pharmacy</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="pharmacyName" placeholder="Pharmacy Name" value={formData.pharmacyName} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="licenseNumber" placeholder="License Number" value={formData.licenseNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="gstNumber" placeholder="GST Number (Optional)" value={formData.gstNumber} onChange={handleChange} className="w-full p-2 border rounded" />

                    <h3 className="font-semibold text-gray-700 pt-2">Admin Account Details</h3>
                    <input name="adminName" placeholder="Admin Name" value={formData.adminName} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="adminEmail" placeholder="Admin Email" type="email" value={formData.adminEmail} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="adminPassword" placeholder="Admin Password" type="password" value={formData.adminPassword} onChange={handleChange} className="w-full p-2 border rounded" required />

                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold">Register</button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/" className="text-blue-500 hover:underline">Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPharmacy;
