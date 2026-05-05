import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaHome, FaSearch, FaTicketAlt, FaUser, FaPlusSquare, 
    FaListAlt, FaQrcode, FaShieldAlt, FaThLarge, FaEnvelope 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(true);
    const scrollTimeout = useRef(null);
    
    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(true);
            
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
            
            scrollTimeout.current = setTimeout(() => {
                setIsVisible(false);
            }, 5000); // Stays for 5 seconds after scroll stops
        };

        window.addEventListener('scroll', handleScroll);
        
        // Initial timer to hide after page load if no scroll happens
        scrollTimeout.current = setTimeout(() => {
            setIsVisible(false);
        }, 5000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, []);

    // Dynamic Navigation Items based on Role
    const getNavItems = () => {
        const base = [
            { name: 'Home', path: '/', icon: <FaHome size={20} /> },
        ];

        if (!user) {
            return [
                ...base,
                { name: 'Events', path: '/events', icon: <FaSearch size={20} /> },
                { name: 'Contact', path: '/contact-us', icon: <FaEnvelope size={20} /> },
                { name: 'Login', path: '/login', icon: <FaUser size={20} /> },
            ];
        }

        if (user.role === 'admin') {
            return [
                ...base,
                { name: 'Console', path: '/admin/dashboard', icon: <FaShieldAlt size={20} /> },
                { name: 'Events', path: '/events', icon: <FaSearch size={20} /> },
                { name: 'Contact', path: '/contact-us', icon: <FaEnvelope size={20} /> },
            ];
        }

        if (user.role === 'organizer') {
            return [
                ...base,
                { name: 'Events', path: '/organizer/events', icon: <FaListAlt size={20} /> },
                { name: 'Dashboard', path: '/organizer/dashboard', icon: <FaThLarge size={20} /> },
                { name: 'Contact', path: '/contact-us', icon: <FaEnvelope size={20} /> },
            ];
        }

        if (user.role === 'staff') {
            return [
                ...base,
                { name: 'Scanner', path: '/staff/scanner', icon: <FaQrcode size={20} /> },
                { name: 'Contact', path: '/contact-us', icon: <FaEnvelope size={20} /> },
            ];
        }

        // Attendee / Default
        return [
            ...base,
            { name: 'Explore', path: '/events', icon: <FaSearch size={20} /> },
            { name: 'Tickets', path: '/my-bookings', icon: <FaTicketAlt size={20} /> },
            { name: 'Contact', path: '/contact-us', icon: <FaEnvelope size={20} /> },
        ];
    };

    const navItems = getNavItems();

    return (
        <div className={`fixed-bottom d-flex d-md-none justify-content-around align-items-center bottom-navbar ${!isVisible ? 'nav-hidden' : ''}`}>
            {navItems.map((item, idx) => {
                const active = isActive(item.path);
                return (
                    <Link
                        key={idx}
                        to={item.path}
                        className={`bottom-nav-link ${active ? 'active' : ''}`}
                    >
                        <div className="nav-icon-wrapper">
                            {item.icon}
                        </div>
                        <span>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default MobileBottomNav;
