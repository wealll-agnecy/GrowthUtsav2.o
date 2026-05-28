import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { 
    FaShieldAlt, FaEye, FaEyeSlash, FaCloudUploadAlt, FaTimes, FaCheck, 
    FaArrowLeft, FaRocket, FaUserCircle, FaBriefcase, FaEnvelope, 
    FaPhone, FaMapMarkerAlt, FaBuilding, FaUserTie 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

const Register = () => {
    const [searchParams] = useSearchParams();
    const roleParam = 'organizer';

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        phone: '', 
        password: '', 
        role: 'organizer',
        // Attendee specific fields
        whatsappNumber: '',
        address: '',
        city: '',
        state: '',
        companyName: '',
        designation: '',
        heardAboutUs: '',
        reference: '',
        selectedIndustries: []
    });

    const [orgDetails, setOrgDetails] = useState({
        companyName: '', selectedEventTypes: [], logo: null, logoPreview: '', registrationNumber: ''
    });
    const [showEventDropdown, setShowEventDropdown] = useState(false);

    const eventOptions = ["Seminar", "Makeup Event", "Carnival", "Beauty Expo", "Exhibition"];
    const industryOptions = ["Makeup", "Hair Styling", "Skin Care", "Fashion", "Photography", "Nails", "Spa & Wellness", "Bridal Artistry"];
    const heardAboutUsOptions = ["Search Engine", "Social Media (Instagram/Facebook)", "Friend / Colleague", "Event Brochure", "Other"];

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

    const handleIndustryToggle = (industry) => {
        let updated = [...formData.selectedIndustries];
        if (updated.includes(industry)) {
            updated = updated.filter(i => i !== industry);
        } else {
            updated = [...updated, industry];
        }
        setFormData({ ...formData, selectedIndustries: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (isOrganizer && step === 1) {
            setStep(2);
            return;
        }

        if (isOrganizer && step === 2) {
            if (!orgDetails.companyName.trim()) return setError("Organization name is required");
            if (!orgDetails.registrationNumber.trim()) return setError("Registration number is required");
            if (orgDetails.selectedEventTypes.length === 0) return setError("Select at least one event type");
        }

        if (!formData.name.trim()) return setError("Full Name is required");
        if (!formData.email.trim()) return setError("Email is required");

        const payload = { ...formData };

        if (isOrganizer) {
            if (!formData.phone.trim()) return setError("Phone number is required");
            if (!formData.password.trim()) return setError("Password is required");
            payload.organizationDetails = orgDetails;
        } else {
            // Attendee specific validation
            if (!formData.whatsappNumber.trim()) return setError("WhatsApp Number is required");
            if (!formData.address.trim()) return setError("Address is required");
            if (!formData.city.trim()) return setError("City is required");
            if (!formData.state.trim()) return setError("State is required");
            if (!formData.companyName.trim()) return setError("Company Name is required");
            if (!formData.designation.trim()) return setError("Designation is required");
            if (!formData.heardAboutUs) return setError("Please select where you heard about us");
            if (!formData.password.trim()) return setError("Password is required");
            if (formData.password.trim().length < 6) return setError("Password must be at least 6 characters");

            // Sync phone with whatsappNumber for backend compatibility
            payload.phone = formData.whatsappNumber;
        }

        await register(payload);
    };

    return (
        <div className="auth-luxury-wrapper">
            <div className="auth-form-side w-100 max-w-xl px-3 px-md-4 py-5">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`auth-premium-card ${isOrganizer && step === 2 ? 'auth-premium-card-wide' : 'w-100'}`}
                    style={{ maxWidth: isOrganizer && step === 2 ? '800px' : '650px', margin: '0 auto' }}
                >
                    <div className="auth-header text-center">
                        <span className="status-badge badge-pink tracking-widest uppercase mb-2 d-inline-block" style={{ fontSize: '0.7rem' }}>
                            {isOrganizer ? 'Organizer Portal' : 'Attendee Registration'}
                        </span>
                        <h3 className="fw-black mb-1">{isOrganizer ? (step === 1 ? 'Join the Journey' : 'Business Details') : 'Quick Register'}</h3>
                        <p className="text-soft">{isOrganizer ? (step === 1 ? 'Create your professional account' : 'Tell us about your organization') : 'Access premium beauty and styling events instantly'}</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Alert variant="danger" className="text-center p-3 mb-4 rounded-3 small border-0 shadow-sm">
                                {error}
                            </Alert>
                        </motion.div>
                    )}


                    <Form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {!isOrganizer ? (
                                <motion.div key="attendeeForm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <div className="premium-input-group">
                                                <label><FaUserCircle className="text-pink me-1" /> Full Name</label>
                                                <Form.Control id="name" className="premium-auth-input" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="premium-input-group">
                                                <label><FaEnvelope className="text-pink me-1" /> Email Address</label>
                                                <Form.Control id="email" type="email" className="premium-auth-input" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                                            </div>
                                        </Col>
                                        <Col md={12}>
                                            <div className="premium-input-group">
                                                <label><FaPhone className="text-pink me-1" /> WhatsApp Number</label>
                                                <Form.Control id="whatsappNumber" type="text" className="premium-auth-input" value={formData.whatsappNumber} onChange={handleChange} required placeholder="Active WhatsApp number" />
                                            </div>
                                        </Col>
                                        <Col md={12}>
                                            <div className="premium-input-group">
                                                <label><FaMapMarkerAlt className="text-pink me-1" /> Complete Address</label>
                                                <Form.Control id="address" className="premium-auth-input" value={formData.address} onChange={handleChange} required placeholder="Street address, Appt, Suite" />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="premium-input-group">
                                                <label>City</label>
                                                <Form.Control id="city" className="premium-auth-input" value={formData.city} onChange={handleChange} required placeholder="e.g. Mumbai" />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="premium-input-group">
                                                <label>State</label>
                                                <Form.Control id="state" className="premium-auth-input" value={formData.state} onChange={handleChange} required placeholder="e.g. Maharashtra" />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="premium-input-group">
                                                <label><FaBuilding className="text-pink me-1" /> Company Name</label>
                                                <Form.Control id="companyName" className="premium-auth-input" value={formData.companyName} onChange={handleChange} required placeholder="Organization / Studio name" />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="premium-input-group">
                                                <label><FaUserTie className="text-pink me-1" /> Designation</label>
                                                <Form.Control id="designation" className="premium-auth-input" value={formData.designation} onChange={handleChange} required placeholder="e.g. Senior Stylist" />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="premium-input-group">
                                                <label>Where did you hear about us?</label>
                                                <Form.Select id="heardAboutUs" className="premium-auth-input text-dark" value={formData.heardAboutUs} onChange={handleChange} required>
                                                    <option value="">Select Option</option>
                                                    {heardAboutUsOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </Form.Select>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="premium-input-group">
                                                <label>Enter Reference</label>
                                                <Form.Control id="reference" className="premium-auth-input" value={formData.reference} onChange={handleChange} placeholder="e.g. Code, Referral name" />
                                            </div>
                                        </Col>
                                        <Col md={12} className="mt-3">
                                            <label className="small fw-bold text-muted uppercase mb-2 d-block">Select Industries</label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {industryOptions.map(ind => {
                                                    const isSelected = formData.selectedIndustries.includes(ind);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={ind}
                                                            className={`btn btn-sm rounded-pill px-3 py-1 border transition-all ${
                                                                isSelected 
                                                                    ? 'btn-pink border-pink shadow-sm' 
                                                                    : 'btn-outline-secondary border-dashed text-secondary bg-transparent'
                                                            }`}
                                                            style={{ fontSize: '0.8rem', fontWeight: '600' }}
                                                            onClick={() => handleIndustryToggle(ind)}
                                                        >
                                                            {isSelected && <FaCheck className="me-1" size={10} />}
                                                            {ind}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </Col>
                                        <Col md={12} className="mt-2">
                                             <div className="premium-input-group">
                                                 <label><FaShieldAlt className="text-pink me-1" /> Create Password</label>
                                                 <div className="position-relative">
                                                     <Form.Control
                                                         id="password"
                                                         type={showPassword ? 'text' : 'password'}
                                                         className="premium-auth-input password-input"
                                                         value={formData.password}
                                                         onChange={handleChange}
                                                         required
                                                         minLength={6}
                                                         placeholder="Min. 6 characters"
                                                     />
                                                     <button
                                                         type="button"
                                                         className="position-absolute end-0 top-0 border-0 shadow-none password-toggle-btn"
                                                         onClick={() => setShowPassword(!showPassword)}
                                                     >
                                                         {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                     </button>
                                                 </div>
                                             </div>
                                         </Col>
                                    </Row>
                                </motion.div>
                            ) : (
                                <motion.div key="organizerForm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    {step === 1 ? (
                                        <div key="orgStep1">
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
                                        </div>
                                    ) : (
                                        <div key="orgStep2">
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
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="d-flex justify-content-center gap-2 mt-4">
                            {isOrganizer && step === 2 && (
                                <button type="button" className="btn btn-outline-pink rounded-pill px-4" onClick={() => setStep(1)}>
                                    <FaArrowLeft />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn btn-pink px-5 rounded-pill fw-bold uppercase tracking-wide"
                                disabled={loading}
                            >
                                {loading ? <Spinner size="sm" /> : !isOrganizer ? 'Register & Login' : step === 1 ? 'Next: Business Setup' : 'Activate Account'}
                            </button>
                        </div>
                    </Form>

                    <div className="auth-footer text-center mt-4">
                        <p className="small mb-0">Already have an account? <Link to={`/login?role=${formData.role}`} className="text-pink fw-bold">Sign In</Link></p>
                    </div>

                    <div className="text-center mt-3">
                        <Link to="/" className="return-home-link text-decoration-none text-muted small fw-bold">
                            <FaArrowLeft /> Return Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
