import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaTicketAlt, FaUser, FaPlusSquare, FaListAlt, FaQrcode, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();
    
    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Dynamic Navigation Items based on Role
    const getNavItems = () => {
        const base = [
            { name: 'Home', path: '/', icon: <FaHome size={20} /> },
        ];

        if (!user) {
            return [
                ...base,
                { name: 'Events', path: '/events', icon: <FaSearch size={20} /> },
                { name: 'Login', path: '/login', icon: <FaUser size={20} /> },
            ];
        }

        if (user.role === 'admin') {
            return [
                ...base,
                { name: 'Console', path: '/admin/dashboard', icon: <FaShieldAlt size={20} /> },
                { name: 'Events', path: '/events', icon: <FaSearch size={20} /> },
                { name: 'Profile', path: '/organizer/dashboard', icon: <FaUser size={20} /> },
            ];
        }

        if (user.role === 'organizer') {
            return [
                ...base,
                { name: 'Events', path: '/organizer/dashboard', icon: <FaListAlt size={20} /> },
                { name: 'Create', path: '/organizer/create-event', icon: <FaPlusSquare size={20} /> },
                { name: 'Profile', path: '/organizer/dashboard', icon: <FaUser size={20} /> },
            ];
        }

        if (user.role === 'staff') {
            return [
                ...base,
                { name: 'Scanner', path: '/staff/scanner', icon: <FaQrcode size={20} /> },
                { name: 'Profile', path: '/staff/dashboard', icon: <FaUser size={20} /> },
            ];
        }

        // Attendee / Default
        return [
            ...base,
            { name: 'Explore', path: '/events', icon: <FaSearch size={20} /> },
            { name: 'Tickets', path: '/my-bookings', icon: <FaTicketAlt size={20} /> },
            { name: 'Profile', path: '/attendee/dashboard', icon: <FaUser size={20} /> },
        ];
    };

    const navItems = getNavItems();

    return (
        <div 
            className="fixed-bottom d-flex d-lg-none justify-content-around align-items-center py-2 px-1 w-100"
            style={{
                background: 'rgba(15, 15, 26, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                zIndex: 1040,
                boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
                paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)',
                left: 0,
                right: 0
            }}
        >
            {navItems.map((item, idx) => {
                const active = isActive(item.path);
                return (
                    <Link
                        key={idx}
                        to={item.path}
                        className="d-flex flex-column align-items-center text-decoration-none"
                        style={{
                            color: active ? '#7c3aed' : '#a1a1aa', // Using primary purple for active
                            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                            minWidth: '70px',
                            padding: '6px 0',
                            position: 'relative'
                        }}
                    >
                        {active && (
                            <div style={{
                                position: 'absolute',
                                top: '-2px',
                                width: '4px',
                                height: '4px',
                                background: '#7c3aed',
                                borderRadius: '50%',
                                boxShadow: '0 0 10px #7c3aed'
                            }} />
                        )}
                        <div style={{
                            transform: active ? 'scale(1.2) translateY(-2px)' : 'scale(1)',
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            marginBottom: '4px',
                            filter: active ? 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.4))' : 'none'
                        }}>
                            {item.icon}
                        </div>
                        <span style={{ 
                            fontSize: '0.6rem', 
                            fontWeight: active ? '800' : '600',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            opacity: active ? 1 : 0.6
                        }}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default MobileBottomNav;
