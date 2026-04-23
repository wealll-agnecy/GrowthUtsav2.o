import React, { useState, useEffect } from 'react';
import { Nav, Badge, Button, Offcanvas } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaThLarge, FaPlusCircle, FaUsers, FaChartLine, FaCog,
    FaChevronLeft, FaChevronRight, FaShieldAlt, FaTicketAlt,
    FaUserTie, FaSignOutAlt, FaLifeRing, FaCalendarAlt, FaQrcode, FaBars, FaEnvelope
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children, role }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [pendingOrgCount, setPendingOrgCount] = useState(0);
    const [enquiryCount, setEnquiryCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const fetchCounts = async () => {
        if (role === 'admin') {
            try {
                const res = await axios.get('/api/v1/notifications/count');
                console.log('🔔 Notification Counts:', res.data);
                setPendingOrgCount(res.data.requests || 0);
                setEnquiryCount(res.data.enquiries || 0);
            } catch (err) {
                console.error('Failed to fetch notification counts', err);
            }
        }
    };

    useEffect(() => {
        document.body.classList.add('dashboard-active');
        
        fetchCounts();
        const interval = setInterval(fetchCounts, 5000); // Polling every 5 seconds

        return () => {
            document.body.classList.remove('dashboard-active');
            clearInterval(interval);
        };
    }, [role]);

    const handleLogout = async () => {
        await logout();
        toast.success('Successfully logged out');
        navigate('/login');
    };

    const adminLinks = [
        { name: 'Console', path: '/admin/dashboard', icon: <FaChartLine /> },
        { name: 'Host Requests', path: '/admin/organizer-requests', icon: <FaUserTie />, badge: pendingOrgCount },
        { name: 'Enquiries', path: '/admin/enquiries', icon: <FaEnvelope />, badge: enquiryCount },
        { name: 'Approvals', path: '/admin/event-approvals', icon: <FaShieldAlt /> },
        { name: 'Staff Hub', path: '/admin/staff', icon: <FaUsers /> },
        { name: 'Settings', path: '/admin/settings', icon: <FaCog /> },
    ];

    const organizerLinks = [
        { name: 'Dashboard', path: '/organizer/dashboard', icon: <FaThLarge /> },
        { name: 'My Events', path: '/organizer/events', icon: <FaCalendarAlt /> },
        { name: 'Create Event', path: '/organizer/create-event', icon: <FaPlusCircle /> },
        { name: 'Bookings', path: '/organizer/bookings', icon: <FaTicketAlt /> },
        { name: 'Earnings', path: '/organizer/earnings', icon: <FaChartLine /> },
        { name: 'Settings', path: '/organizer/settings', icon: <FaCog /> },
    ];

    const attendeeLinks = [
        { name: 'My Hub', path: '/attendee/dashboard', icon: <FaThLarge /> },
        { name: 'My Tickets', path: '/my-bookings', icon: <FaTicketAlt /> },
        { name: 'Explore', path: '/events', icon: <FaCalendarAlt /> },
        { name: 'Profile', path: '/profile', icon: <FaCog /> },
    ];

    const staffLinks = [
        { name: 'Terminal', path: '/staff/dashboard', icon: <FaThLarge /> },
        { name: 'Scanner', path: '/staff/scanner', icon: <FaQrcode /> },
        { name: 'Security', path: '/staff/security', icon: <FaShieldAlt /> },
    ];

    const getLinks = () => {
        switch (role) {
            case 'admin': return adminLinks;
            case 'organizer': return organizerLinks;
            case 'staff': return staffLinks;
            default: return attendeeLinks;
        }
    }

    const links = getLinks();
    const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    useEffect(() => {
        if (collapsed) {
            document.body.classList.add('sidebar-collapsed');
        } else {
            document.body.classList.remove('sidebar-collapsed');
        }
    }, [collapsed]);

    const SidebarContent = () => (
        <div className="d-flex flex-column h-100 py-4 dashboard_left_sidebar">
            <div className="px-4 mb-4 d-flex align-items-center justify-content-between logo-section-sidebar">
                <Link to="/" className="logo-container text-decoration-none">
                    {collapsed ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="sidebar-logo-min"
                        >
                            GU
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="sidebar-logo-expanded"
                        >
                            <h1 className="logo-text mb-0">
                                <span className="growth">Growth</span>
                                <span className="utsav">Utsav</span>
                            </h1>
                            <p className="tagline mb-0">AN EVENT SERIES OF WE ALL</p>
                        </motion.div>
                    )}
                </Link>
                <Button
                    variant="link"
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-dark p-0 d-none d-lg-block shadow-none hover-text-pink transition-all border-0"
                >
                    {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
                </Button>
            </div>

            <div className="px-4 mb-4">
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fw-bold fs-6 text-uppercase tracking-widest text-secondary small opacity-50"
                    >
                        Menu
                    </motion.span>
                )}
            </div>

            <Nav className="flex-column px-3 gap-2 flex-grow-1">
                {links.map((link) => (
                    <Nav.Link
                        key={link.path}
                        as={Link}
                        to={link.path}
                        onClick={() => setShowMobileSidebar(false)}
                        className={`d-flex align-items-center gap-3 px-3 py-3 rounded-4 transition-premium overflow-visible-nav ${isActive(link.path) ? 'bg-primary text-white shadow-glow' : 'text-white-50 hover-bg-white/5 hover-text-white'}`}
                    >
                        <span className={`nav-icon-box ${isActive(link.path) ? 'text-white' : 'text-primary-light'}`}>
                            {link.icon}
                            {Number(link.badge) > 0 && <span className="nav-notif-dot">{link.badge}</span>}
                        </span>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="small fw-black text-uppercase tracking-widest link-text-label"
                            >
                                {link.name}
                            </motion.span>
                        )}
                    </Nav.Link>
                ))}
            </Nav>

            <div className="px-3 mt-auto pt-4 border-top border-white/5">
                <div className={`d-flex align-items-center gap-3 p-2 rounded-4 user-drawer-info ${collapsed ? 'justify-content-center' : ''}`}>
                    <div
                        className="rounded-circle bg-gradient-premium d-flex align-items-center justify-content-center fw-black text-white shadow-lg user-avatar-badge"
                    >
                        {user?.name?.charAt(0) || role?.charAt(0).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="m-0 small fw-black text-white text-truncate user-name-label">{user?.name || 'Active User'}</p>
                            <p className="m-0 text-white-50 text-truncate uppercase tracking-tighter user-role-label">{role} node</p>
                        </div>
                    )}
                </div>
                <Button
                    variant="link"
                    onClick={handleLogout}
                    className={`w-100 mt-3 d-flex align-items-center gap-3 text-danger hover-bg-danger/10 shadow-none transition-all ${collapsed ? 'justify-content-center' : ''} btn rounded-pill fw-medium px-4 py-2`}
                >
                    <FaSignOutAlt />
                    {!collapsed && <span className="small fw-black uppercase tracking-widest logout-label-text">Disconnect</span>}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container d-flex dashboard-main-container">
            {/* Desktop Sidebar */}
            <motion.div
                animate={{ width: collapsed ? '80px' : '280px' }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="d-none d-lg-block border-end border-white/5 bg-dark-space desktop-sidebar-box"
            >
                <SidebarContent />
            </motion.div>

            {/* Mobile Header Overlap Fix (Optional: if the main Navbar isn't enough) */}



            {/* Mobile Offcanvas Sidebar */}
            <Offcanvas
                show={showMobileSidebar}
                onHide={() => setShowMobileSidebar(false)}
                className="bg-dark-space text-white border-0 offcanvas-sidebar-box"
                placement="start"
            >
                <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-white/5" />

                <Offcanvas.Body className="p-0 overflow-hidden">
                    <SidebarContent />
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content Area */}
            <div
                className={`flex-grow-1 d-flex flex-column min-w-0 dashboard-content-area ${collapsed ? 'collapsed' : ''}`}
            >
                {/* Mobile Dashboard Header */}
                <div className="d-lg-none d-flex align-items-center justify-content-between p-3 border-bottom border-white/5 bg-dark-space shadow-sm sticky-top dashboard-mobile-header">
                    <Button
                        variant="link"
                        onClick={() => setShowMobileSidebar(true)}
                        className="text-white p-0 shadow-none hover-text-primary transition-all"
                    >
                        <FaBars size={20} />
                    </Button>
                    <span className="small fw-black text-uppercase tracking-widest text-white">
                        {role} console
                    </span>
                    <div className="mobile-header-spacer" style={{ width: '20px' }}></div>
                </div>

                <main className="p-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
