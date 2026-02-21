import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, uploadProjectFiles, addProjectPayment, createRazorpayOrder, verifyRazorpayPayment, getUsers } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, UploadCloud, FileText, CheckCircle, CreditCard, DollarSign, Wallet } from 'lucide-react';
import dayjs from 'dayjs';

const statusBadge = {
    not_started: 'badge-pending',
    in_progress: 'badge-active',
    completed: 'badge-completed',
    on_hold: 'badge-on_hold',
};

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // File Upload State
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Payment State (Admin Only)
    const [paymentForm, setPaymentForm] = useState({ amount: '', totalAmount: '', method: 'bank_transfer', notes: '' });
    const [savingPayment, setSavingPayment] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [pRes, uRes] = await Promise.all([getProjectById(id), getUsers()]);
                setProject(pRes.data);
                setUsers(uRes.data);
                setPaymentForm(prev => ({ ...prev, totalAmount: pRes.data.totalAmount || '' }));
            } catch (err) {
                toast.error('Failed to load project details');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, navigate]);

    const getUserName = (userId) => users.find(u => u._id === userId)?.name || 'Unknown';

    // Handle Multer File Upload
    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        setUploading(true);
        try {
            const res = await uploadProjectFiles(id, formData);
            setProject(prev => ({ ...prev, files: [...prev.files, ...res.data] }));
            toast.success(`${files.length} file(s) uploaded successfully`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'File upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Handle Admin Payment Submission
    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setSavingPayment(true);
        try {
            const res = await addProjectPayment(id, {
                amount: Number(paymentForm.amount),
                totalAmount: Number(paymentForm.totalAmount),
                method: paymentForm.method,
                notes: paymentForm.notes
            });
            setProject(res.data);
            toast.success('Payment ledger updated');
            setPaymentForm(prev => ({ ...prev, amount: '', notes: '' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment update failed');
        } finally {
            setSavingPayment(false);
        }
    };

    // Payment Mock Modal State
    const [showRazorpayModal, setShowRazorpayModal] = useState(false);
    const [pendingOrder, setPendingOrder] = useState(null);
    const [mockPaymentStage, setMockPaymentStage] = useState('input'); // input -> processing -> success

    // Handle Client Razorpay Checkout (Mocked Flow - Opens UI Modal)
    const handleRazorpayCheckout = async () => {
        try {
            // 1. Create Order on Backend
            const orderRes = await createRazorpayOrder(id);
            setPendingOrder(orderRes.data);

            // 2. Open Dummy UI Modal Instead of Real SDK
            setMockPaymentStage('input');
            setShowRazorpayModal(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initialize payment');
        }
    };

    const processDummyPayment = async () => {
        setMockPaymentStage('processing');

        // Simulate network delay
        setTimeout(async () => {
            setMockPaymentStage('success');

            // Wait 1 second on success frame, then verify
            setTimeout(async () => {
                try {
                    const dummyResponse = {
                        razorpay_order_id: pendingOrder.id,
                        razorpay_payment_id: `pay_dummy_${Math.random().toString(36).substring(7)}`,
                        razorpay_signature: 'dummy_signature_bypassed'
                    };

                    const verifyRes = await verifyRazorpayPayment(id, {
                        ...dummyResponse,
                        amount: pendingOrder.amount / 100
                    });

                    setProject(verifyRes.data.project);
                    toast.success('Payment processing successful!');
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Payment verification failed');
                } finally {
                    setShowRazorpayModal(false);
                    setPendingOrder(null);
                }
            }, 1000);
        }, 2000);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading project details...</div>;
    if (!project) return null;

    // Derived Payment Metrics
    const balanceDue = Math.max(0, project.totalAmount - project.amountPaid);
    const progressPct = project.totalAmount > 0 ? Math.min(100, (project.amountPaid / project.totalAmount) * 100) : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        {project.name}
                        <span className={`text - xs ${statusBadge[project.status]} `}>{project.status.replace('_', ' ')}</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Client: {getUserName(project.client)}</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-700 no-scrollbar mb-6">
                {['overview', 'files', 'payments'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3 text-sm font-medium transition-all capitalize whitespace-nowrap border-b-2 ${activeTab === tab
                            ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 dark:border-indigo-400 dark:text-indigo-400 dark:bg-indigo-900/20'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="mt-6">

                {/* ---------- OVERVIEW TAB ---------- */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Description */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText size={20} className="text-indigo-500" />
                                    Project Description
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {project.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Details & Payment Status */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5">At a Glance</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500 font-medium">Created</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{dayjs(project.createdAt).format('MMM D, YYYY')}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500 font-medium">Employees</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{project.assignedEmployees?.length || 0} assigned</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500 font-medium">Total Amount</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">${project.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-500 font-medium">Payment Status</span>
                                        <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full tracking-wider ${project.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            project.paymentStatus === 'partially_paid' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                            }`}>
                                            {project.paymentStatus.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------- FILES TAB ---------- */}
                {activeTab === 'files' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border-dashed border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors rounded-2xl flex flex-col items-center justify-center py-12 shadow-sm relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud size={32} className="text-indigo-500" />
                            </div>
                            <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1">{uploading ? 'Uploading...' : 'Click to Upload Documents'}</h3>
                            <p className="text-slate-500 text-sm mb-6">PDFs, Images, and Docs up to 50MB</p>

                            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                            <button disabled={uploading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors relative z-10">
                                Browse Files
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Uploaded Files <span className="text-slate-400 font-normal text-sm ml-2">({project.files.length})</span></h3>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {project.files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-800">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
                                                    {file.filename}
                                                </a>
                                                <p className="text-xs text-slate-500 mt-0.5">Uploaded by <span className="font-medium text-slate-600 dark:text-slate-400">{getUserName(file.uploadedBy)}</span> • {dayjs(file.uploadedAt).format('MMM D, YYYY h:mm A')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {project.files.length === 0 && (
                                    <div className="p-10 text-center text-slate-400 text-sm">No files uploaded yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------- PAYMENTS TAB ---------- */}
                {activeTab === 'payments' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Financial Ledger (Main View) */}
                        <div className="md:col-span-2 space-y-6">

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                                    <span className="text-slate-500 mb-1 text-sm font-medium flex items-center gap-1.5"><DollarSign size={14} /> Total Amount</span>
                                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">${project.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                                    <span className="text-slate-500 mb-1 text-sm font-medium flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Paid so far</span>
                                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">${project.amountPaid.toLocaleString()}</span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                                    <span className="text-slate-500 mb-1 text-sm font-medium flex items-center gap-1.5"><Wallet size={14} className="text-orange-500" /> Balance Due</span>
                                    <span className="text-3xl font-extrabold text-orange-500 dark:text-orange-400 mt-1 block">${balanceDue.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Visual Progress Bar */}
                            {project.totalAmount > 0 && (
                                <div className="card py-4">
                                    <div className="flex justify-between text-xs font-semibold mb-2">
                                        <span className="text-emerald-600 dark:text-emerald-400">{Math.round(progressPct)}% Paid</span>
                                        <span className="text-slate-400 uppercase tracking-wider">{project.paymentStatus.replace('_', ' ')}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${progressPct}% ` }}></div>
                                    </div>
                                </div>
                            )}

                            {/* Payment History Table */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                        <DollarSign size={20} className="text-indigo-500" /> Payment Ledger
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-medium">Date</th>
                                                <th className="px-6 py-4 text-left font-medium">Amount</th>
                                                <th className="px-6 py-4 text-left font-medium">Method</th>
                                                <th className="px-6 py-4 text-left font-medium">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {project.paymentHistory.map((pmt, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{dayjs(pmt.date).format('MMM D, YYYY')}</td>
                                                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">+${pmt.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-slate-500 capitalize">{pmt.method.replace('_', ' ')}</td>
                                                    <td className="px-6 py-4 text-slate-500">{pmt.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {project.paymentHistory.length === 0 && (
                                    <div className="p-10 text-center text-slate-400 italic text-sm">No payments have been logged yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Record Payment Form (Admin Only) */}
                        {user.role === 'admin' && (
                            <div className="space-y-6">
                                <form onSubmit={handlePaymentSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <CreditCard size={20} className="text-indigo-500" /> Administrative Billing
                                    </h3>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Total Project Bill</label>
                                        <p className="text-xs text-slate-500 mb-2">Set or update the final required total.</p>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-500 font-medium">$</span>
                                            <input type="number" min="0" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" value={paymentForm.totalAmount} onChange={e => setPaymentForm(p => ({ ...p, totalAmount: e.target.value }))} />
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Log New Payment</label>
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-emerald-500 font-medium">$</span>
                                                <input type="number" min="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="Amount received" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Method</label>
                                                    <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors" value={paymentForm.method} onChange={e => setPaymentForm(p => ({ ...p, method: e.target.value }))}>
                                                        <option value="bank_transfer">Bank Transfer</option>
                                                        <option value="credit_card">Credit Card</option>
                                                        <option value="paypal">PayPal</option>
                                                        <option value="cash">Cash / Cheque</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Notes (Optional)</label>
                                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Wire tx" value={paymentForm.notes} onChange={e => setPaymentForm(p => ({ ...p, notes: e.target.value }))} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={savingPayment} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all flex items-center justify-center gap-2 mt-4">
                                        {savingPayment ? 'Saving Ledger...' : <><CheckCircle size={18} /> Record Transaction</>}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Pay Now Button (Client Only) */}
                        {user.role === 'client' && balanceDue > 0 && (
                            <div className="space-y-6">
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-indigo-500/30 rounded-2xl p-6 shadow-sm">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 border-b border-indigo-200 dark:border-indigo-900/50 pb-4 mb-4">
                                        <Wallet size={20} className="text-indigo-600 dark:text-indigo-400" /> Make a Payment
                                    </h3>

                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                                            Securely pay your remaining balance of <span className="font-extrabold text-slate-800 dark:text-white text-base">${balanceDue.toLocaleString()}</span> via Razorpay.
                                        </p>

                                        <button
                                            onClick={handleRazorpayCheckout}
                                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mb-3"
                                        >
                                            <CreditCard size={18} />
                                            Pay Now
                                        </button>

                                        <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 uppercase font-medium tracking-wider">
                                            <CheckCircle size={12} className="text-emerald-500" /> Securely processed by Razorpay
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Dummy Razorpay Modal UI */}
                        {showRazorpayModal && pendingOrder && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                                <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in-up">

                                    {/* Razorpay "Header" */}
                                    <div className="bg-[#12122c] border-b border-[#2d2d4c] px-6 py-5 flex justify-between items-center text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                                <Wallet size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[15px] leading-tight text-[#f8f9fa]">Prasanth Software Solutions</h3>
                                                <p className="text-xs text-[#a3a3b8] mt-0.5">Project Payment: {project.name}</p>
                                            </div>
                                        </div>
                                        {mockPaymentStage === 'input' && (
                                            <button onClick={() => setShowRazorpayModal(false)} className="text-[#a3a3b8] hover:text-white p-1 rounded-md transition-colors bg-white/5 hover:bg-white/10">✕</button>
                                        )}
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6">

                                        {mockPaymentStage === 'success' ? (
                                            <div className="flex flex-col items-center justify-center py-8 opacity-0 animate-fade-in">
                                                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-6 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10">
                                                    <CheckCircle size={40} className="text-emerald-500 animate-[scale-in_0.5s_ease-out]" />
                                                </div>
                                                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Payment Successful</h4>
                                                <p className="text-sm text-slate-500 text-center mb-6">Your transaction was processed securely.<br />Redirecting to dashboard...</p>
                                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 animate-[progress_1s_ease-in-out_forwards]"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-end mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">To Pay</p>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">₹{pendingOrder.amount / 100}</span>
                                                            <span className="text-sm font-medium text-slate-500">.00</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-medium text-slate-400 mb-1">Order ID</p>
                                                        <p className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">{pendingOrder.id.substring(0, 18)}...</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-8">

                                                    {/* Expanded Card Form */}
                                                    <div className="p-5 rounded-xl border-2 border-[#4f46e5] bg-[#4f46e5]/[0.02] relative overflow-hidden">
                                                        <div className="absolute inset-y-0 left-0 w-1 bg-[#4f46e5] shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                                                        <div className="flex items-center gap-3 mb-5 border-b border-slate-200 dark:border-slate-700 pb-4">
                                                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                                                <CreditCard size={20} className="text-slate-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-[#4f46e5]">Pay via Card</h4>
                                                                <p className="text-xs text-slate-500">Visa, MasterCard, RuPay</p>
                                                            </div>
                                                        </div>

                                                        {/* Dummy Inputs */}
                                                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); processDummyPayment(); }}>
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Card Number</label>
                                                                <div className="relative">
                                                                    <input type="text" required maxLength="19" placeholder="4111 1111 1111 1111" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]" />
                                                                    <CreditCard size={16} className="absolute right-3 top-2.5 text-slate-400" />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Expiry</label>
                                                                    <input type="text" required placeholder="MM/YY" maxLength="5" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">CVV</label>
                                                                    <input type="password" required placeholder="123" maxLength="4" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Cardholder Name</label>
                                                                <input type="text" required placeholder="John Doe" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]" />
                                                            </div>

                                                            <button
                                                                type="submit"
                                                                disabled={mockPaymentStage === 'processing'}
                                                                className="w-full mt-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white py-4 rounded-xl font-semibold transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                            >
                                                                {mockPaymentStage === 'processing' ? (
                                                                    <>
                                                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        Processing...
                                                                    </>
                                                                ) : (
                                                                    <>Pay ₹{pendingOrder.amount / 100}</>
                                                                )}
                                                            </button>
                                                        </form>
                                                    </div>

                                                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 opacity-60 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed">
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                                            <span className="font-bold text-slate-400 text-xs">UPI</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-slate-500">UPI / QR</h4>
                                                            <p className="text-xs text-slate-400">Google Pay, PhonePe, Paytm</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="mt-6 flex items-center justify-center gap-1.5 opacity-60">
                                            <svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4.99992 0C2.24276 0 0.00695801 2.2358 0.00695801 4.99295C0.00695801 7.75011 4.99992 12.5517 4.99992 12.5517C4.99992 12.5517 9.99288 7.75011 9.99288 4.99295C9.99288 2.2358 7.75708 0 4.99992 0ZM4.99992 6.78453C4.01083 6.78453 3.20835 5.98205 3.20835 4.99295C3.20835 4.00386 4.01083 3.20138 4.99992 3.20138C5.98902 3.20138 6.7915 4.00386 6.7915 4.99295C6.7915 5.98205 5.98902 6.78453 4.99992 6.78453Z" fill="#9CA3AF" />
                                            </svg>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Secured by DummyPay</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
