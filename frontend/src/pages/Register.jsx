import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaShieldAlt, FaEye, FaEyeSlash, FaCloudUploadAlt, FaTimes, FaCheck, FaArrowLeft, FaRocket, FaUserCircle, FaBriefcase } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

const Register = () => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role') || 'attendee';

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', role: roleParam
    });
    const [orgDetails, setOrgDetails] = useState({
        companyName: '', selectedEventTypes: [], logo: null, logoPreview: '', registrationNumber: ''
    });
    const [showEventDropdown, setShowEventDropdown] = useState(false);

    const eventOptions = ["Seminar", "Makeup Event", "Carnival", "Beauty Expo", "Exhibition"];
    const { register, user, error, setError, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'organizer') navigate('/organizer/dashboard');
            else navigate('/');
        }
        return () => setError(null);
    }, [user, navigate, setError]);

    const handleChange = (e) => {
        setError(null);
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    const handleOrgChange = (e) => {
        setError(null);
        setOrgDetails({ ...orgDetails, [e.target.id]: e.target.value });
    };


    const isOrganizer = formData.role === 'organizer';

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
            if (!validTypes.includes(file.type)) {
                setError("Please upload a valid image (.png, .jpg, .jpeg)");
                return;
            }
            setOrgDetails({
                ...orgDetails,
                logo: file,
                logoPreview: URL.createObjectURL(file)
            });
            setError(null);
        }
    };

    const removeLogo = () => setOrgDetails({ ...orgDetails, logo: null, logoPreview: '' });

    const handleEventTypeToggle = (type) => {
        let updated = [...orgDetails.selectedEventTypes];
        if (type === "All") {
            updated = (updated.length === eventOptions.length) ? [] : [...eventOptions];
        } else {
            updated = updated.includes(type) ? updated.filter(t => t !== type) : [...updated, type];
        }
        setOrgDetails({ ...orgDetails, selectedEventTypes: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isOrganizer && step === 1) {
            setStep(2);
            return;
        }

        if (isOrganizer && step === 2) {
            if (!orgDetails.companyName.trim()) return setError("Organization name is required");
            if (!orgDetails.registrationNumber.trim()) return setError("Registration number is required");
            if (orgDetails.selectedEventTypes.length === 0) return setError("Select at least one event type");
        }

        if (!formData.email.trim()) return setError("Email is required");
        if (!formData.phone.trim()) return setError("Phone number is required");

        const payload = { ...formData };
        if (isOrganizer) payload.organizationDetails = orgDetails;

        await register(payload);

    };

    return (
        <div className="auth-luxury-wrapper">
            {/* Form Side */}
            <div className="auth-form-side">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`auth-premium-card ${step === 2 ? 'auth-premium-card-wide' : ''}`}
                >
                    <div className="auth-header">
                        <h3>{step === 1 ? 'Join the Journey' : 'Business Details'}</h3>
                        <p>{step === 1 ? 'Create your professional account' : 'Tell us about your organization'}</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <Alert variant="danger" className="text-center p-2 mb-4 rounded-3 small">
                                {error}
                            </Alert>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <div className="role-selector-beauty">
                            <button 
                                className={`role-btn-beauty ${formData.role === 'attendee' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'attendee' })}
                            >
                                <FaUserCircle /> Attendee
                            </button>
                            <button 
                                className={`role-btn-beauty ${formData.role === 'organizer' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'organizer' })}
                            >
                                <FaBriefcase /> Organizer
                            </button>
                        </div>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="premium-input-group">
                                        <label>Full Name</label>
                                        <Form.Control id="name" className="premium-auth-input" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="premium-input-group">
                                        <label>Email Address</label>
                                        <Form.Control id="email" type="email" className="premium-auth-input" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="premium-input-group">
                                        <label>Phone Number</label>
                                        <Form.Control id="phone" type="text" className="premium-auth-input" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                    <div className="premium-input-group">
                                        <label>CREATE PASSWORD</label>
                                        <div className="position-relative">
                                            <Form.Control id="password" type={showPassword ? "text" : "password"} className="premium-auth-input password-input" value={formData.password} onChange={handleChange} required minLength="6" />
                                            <button type="button" className="position-absolute end-0 top-0 border-0 shadow-none password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Row className="g-4">
                                        <Col md={6}>
                                            <div className="premium-input-group">
                                                <label>Company / Artist Name</label>
                                                <Form.Control id="companyName" className="premium-auth-input" value={orgDetails.companyName} onChange={handleOrgChange} required />
                                            </div>
                                            <div className="premium-input-group">
                                                <label>Company Registration Number</label>
                                                <Form.Control id="registrationNumber" className="premium-auth-input" value={orgDetails.registrationNumber} onChange={handleOrgChange} required />
                                            </div>
                                            <div className="premium-input-group position-relative">
                                                <label>Event Segments</label>
                                                <div className="premium-auth-input min-vh-10 d-flex flex-wrap gap-2 cursor-pointer" onClick={() => setShowEventDropdown(!showEventDropdown)}>
                                                    {orgDetails.selectedEventTypes.length === 0 ? <span className="text-muted">Select Segments...</span> : orgDetails.selectedEventTypes.map(t => (
                                                        <span key={t} className="badge bg-pink text-white rounded-pill px-2 py-1 small">{t}</span>
                                                    ))}
                                                </div>
                                                <AnimatePresence>
                                                    {showEventDropdown && (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="event-type-dropdown-premium">
                                                            {eventOptions.map(opt => (
                                                                <div key={opt} className="event-option-beauty" onClick={() => handleEventTypeToggle(opt)}>
                                                                    <div className={`checkbox-beauty ${orgDetails.selectedEventTypes.includes(opt) ? 'checked' : ''}`}>
                                                                        {orgDetails.selectedEventTypes.includes(opt) && <FaCheck size={10} className="text-white" />}
                                                                    </div>
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="h-100">
                                                <label className="small fw-bold text-muted text-uppercase mb-2 d-block">Brand Identity (Logo)</label>
                                                <div className="logo-upload-beauty" onClick={() => document.getElementById('logo-in').click()}>
                                                    {orgDetails.logoPreview ? (
                                                        <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center">
                                                            <img src={orgDetails.logoPreview} className="img-fluid rounded-3" style={{ maxHeight: '140px' }} alt="Brand" />
                                                            <button type="button" className="btn btn-sm btn-pink position-absolute top-0 end-0 rounded-circle" onClick={(e) => { e.stopPropagation(); removeLogo(); }}><FaTimes /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <FaCloudUploadAlt size={32} className="text-pink opacity-50 mb-2" />
                                                            <p className="small text-muted mb-0">Upload Logo</p>
                                                        </div>
                                                    )}
                                                    <input type="file" id="logo-in" hidden onChange={handleLogoUpload} />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="d-flex justify-content-center gap-2 mt-4">
                            {step === 2 && (
                                <button type="button" className="btn btn-outline-pink rounded-pill px-4" onClick={() => setStep(1)}>
                                    <FaArrowLeft />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn btn-pink px-5"
                                disabled={loading}
                            >
                                {loading ? <Spinner size="sm" /> : step === 1 && isOrganizer ? 'Next: Business Setup' : 'Activate Account'}
                            </button>
                        </div>
                    </Form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to={`/login?role=${formData.role}`}>Sign In</Link></p>
                    </div>

                    <div className="text-center mt-3">
                        <Link to="/" className="return-home-link">
                            <FaArrowLeft /> Return Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
