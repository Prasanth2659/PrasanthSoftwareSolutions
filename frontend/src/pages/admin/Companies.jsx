import { useEffect, useState } from 'react';
import { getCompanies, createCompany, deleteCompany } from '../../api/api';
import toast from 'react-hot-toast';
import { Building, Plus, Trash2, X } from 'lucide-react';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', industry: '', contactEmail: '' });
    const [loading, setLoading] = useState(false);

    const load = () => getCompanies().then(r => setCompanies(r.data));
    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCompany(form);
            toast.success('Company created');
            setShowModal(false);
            setForm({ name: '', industry: '', contactEmail: '' });
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this company?')) return;
        try { await deleteCompany(id); toast.success('Deleted'); load(); }
        catch { toast.error('Delete failed'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Client Companies</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Company</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map(c => (
                    <div key={c._id} className="card flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1"><Building size={16} className="text-indigo-500" /><span className="font-semibold text-slate-800 dark:text-white">{c.name}</span></div>
                            <p className="text-xs text-slate-400">{c.industry || '—'}</p>
                            <p className="text-xs text-slate-400">{c.contactEmail || '—'}</p>
                        </div>
                        <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={15} /></button>
                    </div>
                ))}
                {companies.length === 0 && <p className="col-span-3 text-center text-slate-400 text-sm py-8">No companies yet</p>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800 dark:text-white">Add Company</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div><label className="label">Company Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                            <div><label className="label">Industry</label><input className="input" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} /></div>
                            <div><label className="label">Contact Email</label><input type="email" className="input" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} /></div>
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

export default Companies;
