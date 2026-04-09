import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Navbar as BsNavbar, Nav, Container, Button, NavDropdown,
    Offcanvas, Form, InputGroup
} from 'react-bootstrap';
import {
    FaUserCircle, FaSignOutAlt, FaTicketAlt, FaShieldAlt,
    FaPlusCircle, FaThLarge, FaSearch, FaBell, FaTimes,
    FaRocket, FaChevronDown, FaHome, FaMoon, FaSun,
    FaHeadset, FaEnvelope
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ContactModal } from './HelpChatbot';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';



const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isLightMode = theme === 'light';
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showContact, setShowContact] = useState(false);



    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Refresh notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/v1/auth/notifications');
            if (res.data.success) {
                setNotifications(res.data.data.slice(0, 5));
                setUnreadCount(res.data.data.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            await axios.put(`/api/v1/auth/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark notification as read');
        }
    };

    useEffect(() => {
        console.log('[Navbar] User state:', user);
    }, [user]);


    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);



        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };



    // Logical Redirects for Primary Actions
    const joinEventPath = user ? '/attendee/dashboard' : '/login?role=attendee';
    const hostEventPath = user ? (user.role === 'admin' ? '/admin/dashboard' : '/organizer/dashboard') : '/login?role=organizer';

    const navItems = [
        { name: 'Home', path: '/', icon: <FaHome /> },
        { name: 'Events', path: '/events' },
        ...(user?.role === 'admin' ? [
            { name: 'Admin Console', path: '/admin/dashboard', icon: <FaShieldAlt /> }
        ] : []),
        ...(user?.role === 'organizer' ? [
            { name: 'My Events', path: '/organizer/dashboard', icon: <FaThLarge /> },
        ] : []),
        ...(user?.role === 'attendee' ? [
            { name: 'My Tickets', path: '/my-bookings', icon: <FaTicketAlt /> }
        ] : []),
        ...(user?.role === 'staff' ? [
            { name: 'Scanner', path: '/staff/scanner', icon: <FaShieldAlt /> }
        ] : [])
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <>
            {/* Verification Pending Banner */}
            {user?.role === 'organizer' && user?.status === 'pending' && (
                <div
                    className="verification-pending-banner text-center py-2 fw-bold small text-uppercase tracking-widest"
                >
                    Verification Pending ⏳ — Your account is under review by admin.
                </div>
            )}

            <BsNavbar
                expand="lg"
                fixed="top"
                variant="dark"
                className={`transition-all d-none d-lg-block ${scrolled ? 'navbar-scrolled' : ''} navbar-main-container`}
            >
                <Container fluid className="px-md-5 d-flex align-items-center">
                    {/* Brand Logo */}
                    <BsNavbar.Brand
                        as={Link}
                        to="/"
                        className="fw-black fs-3 me-2 navbar-brand-logo"
                    >
                        GrowthUtsav
                    </BsNavbar.Brand>

                    {/* Desktop Navigation (Left-aligned) */}
                    <Nav className="d-none d-lg-flex align-items-center gap-4 me-auto ms-4 flex-nowrap">
                        {navItems.slice(0, 2).map((item, idx) => (
                            <Nav.Link
                                key={idx}
                                as={Link}
                                to={item.path}
                                className={`nav-link-custom nav-link-container ${isActive(item.path) ? 'active' : ''}`}
                            >
                                {item.name}
                            </Nav.Link>
                        ))}
                        <Nav.Link
                            as="button"
                            className="nav-link-custom d-flex align-items-center gap-2 border-0 bg-transparent text-nowrap nav-link-container"
                            onClick={() => setShowContact(true)}
                        >
                            Contact
                        </Nav.Link>
                        {user && (
                            <Nav.Link
                                as={Link}
                                to={user.role === 'admin' ? '/admin/dashboard' : '/my-bookings'}
                                className={`nav-link-custom nav-link-container ${isActive(user.role === 'admin' ? '/admin/dashboard' : '/my-bookings') ? 'active' : ''}`}
                            >
                                My Profile
                            </Nav.Link>
                        )}
                    </Nav>


                    {/* Mobile Controls */}
                    <div className="d-flex align-items-center gap-1 ms-auto d-lg-none">
                        <button
                            onClick={toggleTheme}
                            className="btn btn-link text-soft p-1"
                        >
                            {isLightMode ? <FaMoon size={16} /> : <FaSun size={16} />}
                        </button>

                        <BsNavbar.Toggle
                            onClick={() => setShowMobileMenu(true)}
                            className="p-1 text-primary border-0 shadow-none"
                        />
                    </div>


                    {/* Desktop Actions (Right-aligned) */}
                    <div className="d-none d-lg-flex align-items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle-desktop glass-btn"
                            title="Toggle Theme"
                        >
                            {isLightMode ? <FaMoon size={18} /> : <FaSun size={18} />}
                        </button>



                        {/* Notifications */}
                        {user && (
                            <NavDropdown
                                align="end"
                                className="notification-dropdown-custom"
                                title={
                                    <div className="notification-icon-wrapper glass-btn position-relative d-flex align-items-center justify-content-center notification-icon-container">
                                        <FaBell size={18} />
                                        {unreadCount > 0 && (
                                            <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger notification-badge-pill">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                }
                            >

                                <div className="dropdown-header d-flex justify-content-between align-items-center py-2 px-3 border-bottom border-white/5 bg-white/2">
                                    <span className="fw-black text-bright small text-uppercase tracking-widest">Alerts Feed</span>
                                    {unreadCount > 0 && <span className="badge bg-primary-light text-primary small new-notif-badge">{unreadCount} NEW</span>}
                                </div>
                                <div className="notification-list-scroll">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-4 px-3">
                                            <p className="text-muted small mb-0">No notifications yet.</p>
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <NavDropdown.Item
                                                key={notif._id}
                                                className={`notification-item-custom p-3 border-bottom border-white/5 ${!notif.isRead ? 'unread' : ''}`}
                                                onClick={() => markNotificationAsRead(notif._id)}
                                            >
                                                <div className="d-flex gap-3">
                                                    <div className={`notif-icon-circle ${notif.type}`}>
                                                        <FaBell size={10} />
                                                    </div>
                                                    <div className="flex-grow-1 overflow-hidden">
                                                        <p className={`small mb-1 text-wrap fw-bold font-monospace tracking-tighter notification-msg-text ${notif.isRead ? 'text-secondary' : 'text-primary'}`}>
                                                            {notif.message}
                                                        </p>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-muted opacity-50 notification-timestamp">
                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                            </span>
                                                            {!notif.isRead && <div className="unread-dot-premium bg-primary shadow-glow"></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </NavDropdown.Item>
                                        ))
                                    )}
                                </div>
                                <NavDropdown.Item as={Link} to="/notifications" className="text-center py-3 text-primary small fw-black text-uppercase tracking-widest border-top border-white/5 hover-bg-primary/10">
                                    Full Moderation Log
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}






                        {/* Dashboard Link if Logged In */}
                        {user && navItems.slice(2).map((item, idx) => (
                            <Nav.Link
                                key={idx}
                                as={Link}
                                to={item.path}
                                className={`nav-link-custom d-none d-xl-flex ${isActive(item.path) ? 'active' : ''}`}
                            >
                                {item.name}
                            </Nav.Link>
                        ))}
                    </div>

                    <div className="d-none d-lg-flex align-items-center ms-3 gap-2 visibility-visible opacity-1">
                        {user ? (
                            <div className="d-flex align-items-center gap-2 min-width-fit">
                                <NavDropdown
                                    title={
                                        <span className="d-inline-flex align-items-center gap-2">
                                            <div className="profile-avatar-node shadow-glow-hover profile-avatar-container">
                                                <FaUserCircle size={22} color="#fff" />
                                            </div>
                                            <FaChevronDown size={10} className="profile-chevron-icon" />
                                        </span>
                                    }

                                    id="user-dropdown"
                                    align="end"
                                    className="custom-dropdown profile-dropdown-visibility"
                                >
                                    <div className="px-3 py-2 mb-1">
                                        <div className="fw-bold text-bright profile-name-text">{user.name}</div>
                                        <div className="profile-email-text">{user.email}</div>
                                        <span
                                            className="badge mt-1 text-uppercase tracking-widest profile-role-badge"
                                        >
                                            {user.role}
                                        </span>
                                    </div>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to={user.role === 'admin' ? '/admin/dashboard' : '/my-bookings'}>
                                        My Profile
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={user.role === 'organizer' ? '/organizer/dashboard' : '/my-bookings'}>
                                        My Events
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item
                                        onClick={handleLogout}
                                        className="text-danger fw-semibold d-flex align-items-center gap-2"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </div>
                        ) : (
                            !loading && (
                                <div className="d-flex align-items-center gap-2">
                                    <Link to="/login" className="nav-link-custom border-0 text-decoration-none navbar-auth-btn-signin">Sign In</Link>
                                    <Button as={Link} to="/register" className="btn-primary navbar-auth-btn-getstarted">
                                        <FaRocket className="me-2" /> Get Started
                                    </Button>
                                </div>
                            )
                        )}
                    </div>
                </Container>
            </BsNavbar>



            {/* Mobile Offcanvas */}
            <Offcanvas
                show={showMobileMenu}
                onHide={() => setShowMobileMenu(false)}
                placement="end"
            >
                <Offcanvas.Header closeButton className="pb-0">
                    <Offcanvas.Title
                        className="fw-black mobile-brand-title"
                    >
                        GrowthUtsav
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-4">
                    {user && (
                        <div
                            className="d-flex align-items-center gap-3 p-3 rounded-4 mb-4 mobile-user-profile-bar"
                        >
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 shadow-lg mobile-user-avatar"
                            >
                                <FaUserCircle size={24} color="#fff" />
                            </div>
                            <div>
                                <div className="fw-black text-bright mobile-user-name">{user.name}</div>
                                <div className="text-soft mobile-user-role">{user.role}</div>
                            </div>
                        </div>
                    )}

                    <Nav className="flex-column gap-1">
                        {navItems.map((item, idx) => (
                            <Nav.Link
                                key={idx}
                                as={Link}
                                to={item.path}
                                className={`d-flex align-items-center gap-3 rounded-4 px-3 py-3 fw-bold text-uppercase tracking-widest mobile-nav-link-item ${isActive(item.path) ? 'active-mobile-link' : ''}`}
                                onClick={() => setShowMobileMenu(false)}
                            >
                                {item.icon && <span className="mobile-nav-link-icon">{item.icon}</span>}
                                {item.name}
                            </Nav.Link>
                        ))}
                    </Nav>

                    {/* Contact in Mobile Menu */}
                    <button
                        className="d-flex align-items-center gap-3 rounded-4 px-3 py-3 fw-bold text-uppercase tracking-widest w-100 mt-2 nav-contact-trigger mobile-contact-btn"
                        onClick={() => { setShowContact(true); setShowMobileMenu(false); }}
                        id="mobile-contact-btn"
                    >
                        <span className="mobile-nav-link-icon"><FaHeadset /></span>
                        Contact
                    </button>

                    <div className="mt-4 pt-4 mobile-menu-footer">
                        {user ? (
                            <div className="d-grid gap-2">
                                {user.role === 'organizer' && (
                                    <Link
                                        to="/organizer/plans"
                                        className="btn btn-outline-primary fw-bold text-uppercase tracking-widest w-100 mobile-pricing-btn"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Pricing Plans
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-danger fw-semibold"
                                >
                                    <FaSignOutAlt className="me-2" />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="d-grid gap-3">
                                <div className="d-grid gap-2 mt-2">
                                    <Link
                                        to="/login"
                                        className="btn btn-outline-primary fw-bold text-uppercase tracking-widest mobile-pricing-btn"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn btn-primary fw-bold"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        <FaRocket className="me-2" />
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Contact Modal */}
            <ContactModal show={showContact} onClose={() => setShowContact(false)} />
        </>
    );
};

export default Navbar;
