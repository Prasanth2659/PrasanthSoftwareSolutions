import { useEffect, useState } from 'react';
import { getServices, createServiceRequest } from '../../api/api';
import toast from 'react-hot-toast';
import { Briefcase, Send } from 'lucide-react';

const ClientServices = () => {
    const [services, setServices] = useState([]);
    const [requesting, setRequesting] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { getServices().then(r => setServices(r.data)); }, []);

    const handleRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createServiceRequest({ service: requesting._id, message });
            toast.success('Service requested! Admin will review it.');
            setRequesting(null);
            setMessage('');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Available Services</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(s => (
                    <div key={s._id} className="card flex flex-col justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1"><Briefcase size={16} className="text-indigo-500" />
                                <span className="font-semibold text-slate-800 dark:text-white">{s.name}</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{s.description || 'No description'}</p>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₹{s.price?.toLocaleString()}</p>
                        </div>
                        <button onClick={() => setRequesting(s)} className="btn-primary flex items-center justify-center gap-2"><Send size={14} /> Request Service</button>
                    </div>
                ))}
                {services.length === 0 && <p className="col-span-3 text-center text-slate-400 text-sm py-8">No services available</p>}
            </div>

            {requesting && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md shadow-2xl">
                        <h2 className="font-semibold text-slate-800 dark:text-white mb-1">Request: {requesting.name}</h2>
                        <p className="text-xs text-slate-400 mb-4">Send a message to admin with your requirements.</p>
                        <form onSubmit={handleRequest} className="space-y-3">
                            <div><label className="label">Message (optional)</label>
                                <textarea className="input resize-none" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your requirements..." />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Sending...' : 'Submit Request'}</button>
                                <button type="button" onClick={() => setRequesting(null)} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientServices;
