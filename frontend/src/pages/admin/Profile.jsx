import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../api/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

const Profile = () => {
    const { user, loginUser } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', bio: user.bio || '' });
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateUser(user.id, form);
            toast.success('Profile updated!');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-lg">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Edit Profile</h1>
            <div className="card">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-900">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-slate-400 capitalize">{user?.role}</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                    <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    <div><label className="label">Bio</label><textarea className="input resize-none" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></div>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        <Save size={16} />{loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
