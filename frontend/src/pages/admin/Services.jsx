import { useEffect, useState } from 'react';
import { getServices, createService, deleteService } from '../../api/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Briefcase } from 'lucide-react';

const Services = () => {
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', price: '' });
    const [loading, setLoading] = useState(false);

    const load = () => getServices().then(r => setServices(r.data));
    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createService({ ...form, price: Number(form.price) });
            toast.success('Service created');
            setShowModal(false);
            setForm({ name: '', description: '', price: '' });
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this service?')) return;
        try { await deleteService(id); toast.success('Deleted'); load(); }
        catch { toast.error('Delete failed'); }
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
                        <button onClick={() => handleDelete(s._id)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={15} /></button>
                    </div>
                ))}
                {services.length === 0 && <p className="col-span-3 text-center text-slate-400 text-sm py-8">No services yet</p>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800 dark:text-white">Add Service</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div><label className="label">Service Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                            <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                            <div><label className="label">Price (₹)</label><input type="number" min="0" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
