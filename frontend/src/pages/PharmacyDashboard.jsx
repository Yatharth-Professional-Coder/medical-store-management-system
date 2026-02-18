import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const PharmacyDashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [formData, setFormData] = useState({
        name: '', batchNumber: '', expiryDate: '', price: '', quantity: '', supplier: '', minStockLevel: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || (userInfo.role !== 'PharmacyAdmin' && userInfo.role !== 'PharmacyStaff')) {
            navigate('/');
        } else {
            fetchMedicines();
        }
    }, [navigate]);

    const fetchMedicines = async () => {
        try {
            const { data } = await api.get('/medicines');
            setMedicines(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"&limit=5`);
            const data = await response.json();
            if (data.results) {
                const names = data.results.map(item => item.openfda.brand_name ? item.openfda.brand_name[0] : null).filter(Boolean);
                // Remove duplicates using Set
                setSuggestions([...new Set(names)]);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'name') {
            fetchSuggestions(e.target.value);
        }
    };

    const getDaysToExpiry = (expiryDate) => {
        const today = new Date();
        const exp = new Date(expiryDate);
        const diffTime = exp - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medicines', formData);
            fetchMedicines();
            setFormData({ name: '', batchNumber: '', expiryDate: '', price: '', quantity: '', supplier: '', minStockLevel: '' });
            alert('Medicine Added');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding medicine');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this medicine?')) {
            try {
                await api.delete(`/medicines/${id}`);
                fetchMedicines();
            } catch (error) {
                alert('Error deleting medicine');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const expiringSoonCount = medicines.filter(m => getDaysToExpiry(m.expiryDate) <= 30).length;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-blue-800">Pharmacy Dashboard</h1>
                    {expiringSoonCount > 0 && (
                        <div className="mt-2 bg-red-100 text-red-800 px-4 py-2 rounded-md font-bold shadow-sm inline-block animate-pulse">
                            ⚠️ {expiringSoonCount} Medicine(s) Expiring Soon!
                        </div>
                    )}
                </div>
                <div className='flex gap-4'>
                    <Link to="/pos" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold shadow">
                        POS / Billing
                    </Link>
                    <Link to="/sales-history" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-bold shadow">
                        Sales History
                    </Link>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inventory Form */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Add Medicine</h2>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            name="name"
                            placeholder="Medicine Name"
                            value={formData.name}
                            onChange={handleChange}
                            list="medicine-suggestions"
                            className="w-full p-2 border rounded"
                            required
                        />
                        <datalist id="medicine-suggestions">
                            {suggestions.map((name, index) => (
                                <option key={index} value={name} />
                            ))}
                        </datalist>
                        <div className="flex gap-2">
                            <input name="batchNumber" placeholder="Batch No" value={formData.batchNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
                            <input name="quantity" type="number" placeholder="Qty" value={formData.quantity} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                        <div className="flex gap-2">
                            <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required />
                            <input name="minStockLevel" type="number" placeholder="Min Stock" value={formData.minStockLevel} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <label className="block text-sm text-gray-600">Expiry Date</label>
                        <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <input name="supplier" placeholder="Supplier" value={formData.supplier} onChange={handleChange} className="w-full p-2 border rounded" />
                        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 font-semibold">Add to Inventory</button>
                    </form>
                </div>

                {/* Inventory List */}
                <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Current Inventory</h2>
                        <input
                            type="text"
                            placeholder="Search by Name or Batch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 border rounded w-64"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-100 uppercase">
                                <tr>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Batch</th>
                                    <th className="px-4 py-2">Expiry</th>
                                    <th className="px-4 py-2">Price</th>
                                    <th className="px-4 py-2">Qty</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredMedicines.map((item) => {
                                    const daysToExpiry = getDaysToExpiry(item.expiryDate);
                                    let rowClass = '';
                                    if (daysToExpiry <= 30) rowClass = 'bg-red-100'; // Critical
                                    else if (daysToExpiry <= 90) rowClass = 'bg-yellow-50'; // Warning
                                    else if (item.quantity <= item.minStockLevel) rowClass = 'bg-gray-100'; // Low Stock

                                    return (
                                        <tr key={item._id} className={rowClass}>
                                            <td className="px-4 py-2 font-medium">
                                                {item.name}
                                                {daysToExpiry <= 30 && <span className="ml-2 text-xs bg-red-500 text-white px-1 rounded">Expiring</span>}
                                            </td>
                                            <td className="px-4 py-2">{item.batchNumber}</td>
                                            <td className="px-4 py-2">
                                                {new Date(item.expiryDate).toLocaleDateString()}
                                                <div className="text-xs text-gray-500">{daysToExpiry} days left</div>
                                            </td>
                                            <td className="px-4 py-2">₹{item.price}</td>
                                            <td className="px-4 py-2 font-bold">{item.quantity}</td>
                                            <td className="px-4 py-2">
                                                <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800">Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredMedicines.length === 0 && <p className="text-center py-4 text-gray-500">No medicines found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
