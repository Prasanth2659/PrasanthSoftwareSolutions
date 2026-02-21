import DashboardLayout from '../components/DashboardLayout';
import {
    LayoutDashboard, Users, Building, Briefcase,
    ClipboardList, FolderKanban, MessageSquare, UserCircle
} from 'lucide-react';

const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/companies', icon: Building, label: 'Companies' },
    { to: '/admin/services', icon: Briefcase, label: 'Services' },
    { to: '/admin/requests', icon: ClipboardList, label: 'Service Requests' },
    { to: '/admin/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/admin/profile', icon: UserCircle, label: 'Profile' },
];

const AdminLayout = () => {
    return <DashboardLayout links={links} title="Admin Portal" />;
};

export default AdminLayout;
