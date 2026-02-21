import { NavLink } from 'react-router-dom';
import { Building2, Menu } from 'lucide-react';

const Sidebar = ({ links, isOpen, setIsOpen }) => {
    return (
        <aside className="w-full h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-sm">
            {/* Brand & Toggle */}
            <div
                className={`px-4 flex h-16 items-center ${isOpen ? 'justify-between' : 'justify-center cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-700/50'} relative flex-shrink-0`}
                onClick={() => !isOpen && setIsOpen(true)}
                title={!isOpen ? "Expand Sidebar" : undefined}
            >
                {isOpen ? (
                    <>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900 transition-all">
                                <Building2 size={16} className="text-white" />
                            </div>
                            <div className="whitespace-nowrap transition-opacity duration-300">
                                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Prasanth</p>
                                <p className="text-[10px] text-slate-400 leading-tight block -mt-0.5">Software Solutions</p>
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                            className="p-1.5 -mr-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                            title="Collapse Sidebar"
                        >
                            <Menu size={20} />
                        </button>
                    </>
                ) : (
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900 transition-opacity duration-200 group-hover:opacity-0 group-hover:scale-95">
                            <Building2 size={16} className="text-white" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:scale-100 scale-95">
                            <Menu size={20} />
                        </div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to.split('/').length <= 2}
                        title={!isOpen ? label : undefined}
                        className={({ isActive }) =>
                            `flex items-center ${isOpen ? 'px-3' : 'justify-center px-0 w-11 mx-auto'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                            }`
                        }
                    >
                        <Icon size={20} className="flex-shrink-0" />
                        {isOpen && (
                            <span className="ml-3 truncate">{label}</span>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
