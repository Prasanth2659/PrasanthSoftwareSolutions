import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCompanies from './pages/admin/Companies';
import AdminServices from './pages/admin/Services';
import AdminRequests from './pages/admin/ServiceRequests';
import AdminProjects from './pages/admin/Projects';
import AdminMessages from './pages/admin/Messages';
import AdminProfile from './pages/admin/Profile';

// Employee pages
import EmployeeLayout from './layouts/EmployeeLayout';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProjects from './pages/employee/Projects';
import EmployeeMessages from './pages/employee/Messages';
import EmployeeProfile from './pages/employee/Profile';

// Client pages
import ClientLayout from './layouts/ClientLayout';
import ClientDashboard from './pages/client/Dashboard';
import ClientServices from './pages/client/Services';
import ClientRequests from './pages/client/MyRequests';
import ClientProjects from './pages/client/Projects';
import ClientMessages from './pages/client/Messages';
import ClientProfile from './pages/client/Profile';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
    return children;
};

const RoleRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'employee') return <Navigate to="/employee" replace />;
    return <Navigate to="/client" replace />;
};

const App = () => (
    <AuthProvider>
        <Toaster position="top-right" toastOptions={{ className: 'rounded-xl text-sm' }} />
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RoleRedirect />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="companies" element={<AdminCompanies />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="requests" element={<AdminRequests />} />
                    <Route path="projects" element={<AdminProjects />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="profile" element={<AdminProfile />} />
                </Route>

                {/* Employee Routes */}
                <Route path="/employee" element={<ProtectedRoute roles={['employee']}><EmployeeLayout /></ProtectedRoute>}>
                    <Route index element={<EmployeeDashboard />} />
                    <Route path="projects" element={<EmployeeProjects />} />
                    <Route path="messages" element={<EmployeeMessages />} />
                    <Route path="profile" element={<EmployeeProfile />} />
                </Route>

                {/* Client Routes */}
                <Route path="/client" element={<ProtectedRoute roles={['client']}><ClientLayout /></ProtectedRoute>}>
                    <Route index element={<ClientDashboard />} />
                    <Route path="services" element={<ClientServices />} />
                    <Route path="requests" element={<ClientRequests />} />
                    <Route path="projects" element={<ClientProjects />} />
                    <Route path="messages" element={<ClientMessages />} />
                    <Route path="profile" element={<ClientProfile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </AuthProvider>
);

export default App;
