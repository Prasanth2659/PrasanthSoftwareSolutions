import { useEffect, useState } from 'react';
import { getCompanies, createCompany, deleteCompany, updateCompany } from '../../api/api';
import toast from 'react-hot-toast';
import { Building, Plus, Trash2, X, AlertTriangle, Edit2 } from 'lucide-react';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', industry: '', contactEmail: '' });
    const [loading, setLoading] = useState(false);

    const load = () => getCompanies().then(r => setCompanies(r.data));
    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await updateCompany(editingId, form);
                toast.success('Company updated');
            } else {
                await createCompany(form);
                toast.success('Company created');
            }
            closeModal();
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const openEditModal = (company) => {
        setEditingId(company._id);
        setForm({ name: company.name, industry: company.industry || '', contactEmail: company.contactEmail || '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm({ name: '', industry: '', contactEmail: '' });
    };

    const handleDelete = async () => {
        if (!companyToDelete) return;
        try {
            await deleteCompany(companyToDelete);
            toast.success('Company deleted successfully');
            load();
        }
        catch { toast.error('Delete failed'); }
        finally { setCompanyToDelete(null); }
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
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => openEditModal(c)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"><Edit2 size={15} /></button>
                            <button onClick={() => setCompanyToDelete(c._id)} className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"><Trash2 size={15} /></button>
                        </div>
                    </div>
                ))}
                {companies.length === 0 && <p className="col-span-3 text-center text-slate-400 text-sm py-8">No companies yet</p>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800 dark:text-white">{editingId ? 'Edit Company' : 'Add Company'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div><label className="label">Company Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                            <div><label className="label">Industry</label><input className="input" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} /></div>
                            <div><label className="label">Contact Email</label><input type="email" className="input" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} /></div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : (editingId ? 'Save Changes' : 'Create')}</button>
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {companyToDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-sm shadow-2xl p-6">
                        <div className="flex items-center gap-3 mb-4 text-rose-500">
                            <AlertTriangle size={24} />
                            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Delete Company?</h2>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                            Are you sure you want to delete this company? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setCompanyToDelete(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors flex-1 shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Companies;
