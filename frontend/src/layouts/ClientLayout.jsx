import DashboardLayout from '../components/DashboardLayout';
import { LayoutDashboard, Briefcase, ClipboardList, FolderKanban, MessageSquare, UserCircle } from 'lucide-react';

const links = [
    { to: '/client', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/client/services', icon: Briefcase, label: 'Services' },
    { to: '/client/requests', icon: ClipboardList, label: 'My Requests' },
    { to: '/client/projects', icon: FolderKanban, label: 'My Projects' },
    { to: '/client/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/client/profile', icon: UserCircle, label: 'Profile' },
];

const ClientLayout = () => {
    return <DashboardLayout links={links} title="Client Portal" />;
};

export default ClientLayout;
