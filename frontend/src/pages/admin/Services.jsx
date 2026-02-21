import { useEffect, useState } from 'react';
import { getServices, createService, deleteService, updateService } from '../../api/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Briefcase, AlertTriangle, Edit2 } from 'lucide-react';

const Services = () => {
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null); // New state for delete confirmation
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '' });
    const [loading, setLoading] = useState(false);

    const load = () => getServices().then(r => setServices(r.data));
    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await updateService(editingId, { ...form, price: Number(form.price) });
                toast.success('Service updated');
            } else {
                await createService({ ...form, price: Number(form.price) });
                toast.success('Service created');
            }
            closeModal();
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const openEditModal = (service) => {
        setEditingId(service._id);
        setForm({ name: service.name, description: service.description || '', price: service.price });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm({ name: '', description: '', price: '' });
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;
        try {
            await deleteService(serviceToDelete);
            toast.success('Service deleted successfully');
            load();
        }
        catch { toast.error('Delete failed'); }
        finally { setServiceToDelete(null); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Services</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Service</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(s => (
                    <div key={s._id} className="card flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1"><Briefcase size={16} className="text-indigo-500" /><span className="font-semibold text-slate-800 dark:text-white">{s.name}</span></div>
                            <p className="text-xs text-slate-400 mb-2">{s.description || 'No description'}</p>
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">₹{s.price?.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => openEditModal(s)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"><Edit2 size={15} /></button>
                            <button onClick={() => setServiceToDelete(s._id)} className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"><Trash2 size={15} /></button>
                        </div>
                    </div>
                ))}
                {services.length === 0 && <p className="col-span-3 text-center text-slate-400 text-sm py-8">No services yet</p>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800 dark:text-white">{editingId ? 'Edit Service' : 'Add Service'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div><label className="label">Service Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                            <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                            <div><label className="label">Price (₹)</label><input type="number" min="0" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : (editingId ? 'Save Changes' : 'Create')}</button>
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {serviceToDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-sm shadow-2xl p-6">
                        <div className="flex items-center gap-3 mb-4 text-rose-500">
                            <AlertTriangle size={24} />
                            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Delete Service?</h2>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                            Are you sure you want to delete this service? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setServiceToDelete(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors flex-1 shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
