import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/routing/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import MobileHeader from './components/common/MobileHeader';
import MobileBottomNav from './components/common/MobileBottomNav';
import DashboardLayout from './components/common/DashboardLayout';
import './layout.css';
import ScrollToTop from './components/common/ScrollToTop';


// Performance: Lazy Loading across all deployment nodes
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Home = lazy(() => import('./pages/Home'));
const EventListing = lazy(() => import('./pages/EventListing'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Profile = lazy(() => import('./pages/Profile'));
const AttendeeDashboard = lazy(() => import('./pages/AttendeeDashboard'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const AdminEnquiries = lazy(() => import('./pages/AdminEnquiries'));
const AdminEnquiryDetails = lazy(() => import('./pages/AdminEnquiryDetails'));
const Notifications = lazy(() => import('./pages/Notifications'));
const TicketView = lazy(() => import('./pages/TicketView'));
const CheckoutFlow = lazy(() => import('./pages/CheckoutFlow'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const OrganizerEvents = lazy(() => import('./pages/OrganizerEvents'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const OrganizerBookings = lazy(() => import('./pages/OrganizerBookings'));
const OrganizerEventAnalytics = lazy(() => import('./pages/OrganizerEventAnalytics'));
const OrganizerInquiriesPage = lazy(() => import('./pages/OrganizerInquiriesPage'));
const OrganizerStaffManagement = lazy(() => import('./pages/OrganizerStaffManagement'));
const PricingPlans = lazy(() => import('./pages/PricingPlans'));
const LogisticsDashboard = lazy(() => import('./pages/LogisticsDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const FinanceDashboard = lazy(() => import('./pages/FinanceDashboard'));
const AdminEventApproval = lazy(() => import('./pages/AdminEventApproval'));
const AdminSecretLogin = lazy(() => import('./pages/AdminSecretLogin'));
const AdminOrganizerRequests = lazy(() => import('./pages/AdminOrganizerRequests'));
const AdminStaffManagement = lazy(() => import('./pages/AdminStaffManagement'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const StaffScanner = lazy(() => import('./pages/StaffScanner'));
const PendingVerification = lazy(() => import('./pages/PendingVerification'));
const VerifyTicket = lazy(() => import('./pages/VerifyTicket'));
const ReelBook = lazy(() => import('./pages/ReelBook'));

// Shared Components
const HelpChatbot = lazy(() => import('./components/common/HelpChatbot'));

// High-Fidelity Intelligence Loader
const SectorLoader = () => (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark gap-4">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <div className="text-white-50 small fw-black tracking-widest uppercase opacity-60">Synchronizing Sector Nodes...</div>
    </div>
);

const DashboardWrapper = ({ children, role }) => (
    <DashboardLayout role={role}>
        <Suspense fallback={<SectorLoader />}>
            {children}
        </Suspense>
    </DashboardLayout>
);

import RemainingPaymentPage from './pages/RemainingPaymentPage';

const AppContent = () => {
    const location = useLocation();
    
    // Hide peripheral UI for Native App scanner view
    const isNativeScannerView = location.pathname.startsWith('/verify-ticket') || location.pathname.startsWith('/ticket/');
    
    if (isNativeScannerView) {
        return (
            <div className="min-vh-100 bg-black overflow-hidden">
                <Suspense fallback={<SectorLoader />}>
                    <Routes>
                        <Route path="/verify-ticket/:id" element={<VerifyTicket />} />
                        <Route path="/ticket/:id" element={<VerifyTicket />} />
                    </Routes>
                </Suspense>
                <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex flex-column mobile-nav-padding overflow-x-hidden">
            <Navbar />
            
            <main className="flex-grow-1">
                <div className={(location.pathname === '/' || location.pathname === '/contact-us') ? 'content-wrapper-home' : 'content-wrapper-page'}>
                    <Suspense fallback={<SectorLoader />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/events" element={<EventListing />} />
                            <Route path="/events/:id" element={<EventDetails />} />
                            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                            <Route path="/tickets/:id" element={<ProtectedRoute><TicketView /></ProtectedRoute>} />
                            <Route path="/digital-pass/:id" element={<ProtectedRoute><TicketView /></ProtectedRoute>} />
                            <Route path="/checkout" element={<ProtectedRoute><CheckoutFlow /></ProtectedRoute>} />
                            <Route path="/contact-us" element={<ContactUs />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/pending-verification" element={<ProtectedRoute><PendingVerification /></ProtectedRoute>} />
                            <Route path="/reels" element={<ReelBook />} />

                            {/* Stealth Admin Gateway */}
                            <Route path="/admin" element={<AdminSecretLogin />} />
                            <Route path="/admin-login" element={<AdminSecretLogin />} />

                            <Route path="/attendee/dashboard" element={<ProtectedRoute roles={['user', 'admin']}><DashboardWrapper role="attendee"><AttendeeDashboard /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                            {/* Organizer Dashboard Routes */}
                            <Route path="/organizer/dashboard" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><OrganizerDashboard /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/organizer/bookings" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><OrganizerBookings /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/organizer/events" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><OrganizerEvents /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/organizer/event/:id" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><OrganizerEventAnalytics /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/organizer/inquiries" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><OrganizerInquiriesPage /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/organizer/plans" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><PricingPlans /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/organizer/staff" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><OrganizerStaffManagement /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/logistics/:eventId" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><LogisticsDashboard /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/organizer/create-event" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><CreateEvent /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/organizer/edit-event/:id" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardWrapper role="organizer"><CreateEvent /></DashboardWrapper></ProtectedRoute>} />

                            {/* Admin Dashboard Routes */}
                            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><DashboardWrapper role="admin"><AdminDashboard /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/admin/finance" element={<ProtectedRoute roles={['admin']}><DashboardWrapper role="admin"><FinanceDashboard /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/admin/event-approvals" element={<ProtectedRoute roles={['admin']}><DashboardWrapper role="admin"><AdminEventApproval /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/admin/organizer-requests" element={<ProtectedRoute roles={['admin']}><DashboardWrapper role="admin"><AdminOrganizerRequests /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/admin/staff" element={<ProtectedRoute roles={['admin']}><DashboardWrapper role="admin"><AdminStaffManagement /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/admin/enquiries" element={<ProtectedRoute roles={['admin']}><DashboardWrapper role="admin"><AdminEnquiries /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/admin/enquiries/:id" element={<ProtectedRoute roles={['admin']}><DashboardWrapper role="admin"><AdminEnquiryDetails /></DashboardWrapper></ProtectedRoute>} />

                            <Route path="/staff/dashboard" element={<ProtectedRoute roles={['staff', 'admin']}><DashboardWrapper role="staff"><StaffDashboard /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/staff/scanner" element={<ProtectedRoute roles={['staff', 'admin']}><DashboardWrapper role="staff"><StaffScanner /></DashboardWrapper></ProtectedRoute>} />
                            <Route path="/remaining-payment/:bookingId" element={<ProtectedRoute><RemainingPaymentPage /></ProtectedRoute>} />
                        </Routes>
                    </Suspense>
                </div>
            </main>

            <MobileBottomNav />

            {/* Hide footer on dashboard pages to prevent sidebar overlap */}
            {!location.pathname.includes('/admin') && 
            !location.pathname.includes('/organizer') && 
            !location.pathname.includes('/staff') && 
            !location.pathname.includes('/attendee') && 
            location.pathname !== '/profile' && (
                <Footer />
            )}

            <Suspense fallback={null}>
                <HelpChatbot />
            </Suspense>
            
            <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} toastOptions={{
                style: {
                    background: 'var(--mid-space)',
                    color: 'var(--text-bright)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(10px)'
                }
            }} />
        </div>
    );
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <AppContent />
        </Router>
    );
}

export default App;
