import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaShieldAlt, FaEye, FaEyeSlash, FaCloudUploadAlt, FaTimes, FaCheck, FaArrowLeft, FaRocket, FaUserCircle, FaBriefcase } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role') || 'attendee';

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', role: roleParam
    });
    const [orgDetails, setOrgDetails] = useState({
        companyName: '', selectedEventTypes: [], logo: null, logoPreview: ''
    });
    const [showEventDropdown, setShowEventDropdown] = useState(false);

    const eventOptions = ["Seminar", "Makeup Event", "Carnival", "Beauty Expo", "Exhibition"];
    const { register, user, error, setError, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'organizer') navigate('/organizer/dashboard');
            else navigate('/attendee/dashboard');
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
            if (orgDetails.selectedEventTypes.length === 0) return setError("Select at least one event type");
            if (!orgDetails.logo) return setError("Logo upload is required");
        }

        if (!formData.email.trim()) return setError("Email is required");
        if (!formData.phone.trim()) return setError("Phone number is required");

        const payload = { ...formData };
        if (isOrganizer) payload.organizationDetails = orgDetails;

        await register(payload);

    };

    return (
        <div className="auth-bg-gradient min-vh-100 d-flex align-items-center py-5">
            <Container>
                <div className="text-center mb-4">
                    <Link to="/" className="btn-back">
                        <FaArrowLeft /> SECTOR TERMINAL
                    </Link>
                </div>

                <Row className="justify-content-center">

                    <Col lg={isOrganizer && step === 2 ? 6 : 4} md={8} sm={10}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Card className="saas-card border-0 shadow-2xl p-4 p-md-5 overflow-hidden position-relative">
                                <div className="text-center mb-5 position-relative">
                                    <h2 className="fw-black text-white tracking-tighter mb-2">
                                        {step === 1 ? 'Join the Network' : 'Org Configuration'}
                                    </h2>
                                    <p className="text-white-50 small uppercase tracking-widest opacity-60">
                                        {step === 1 ? 'Select your role and initialize' : 'Configure host node credentials'}
                                    </p>
                                </div>

                                {error && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                        <Alert variant="danger" className="bg-danger/10 border-danger/20 text-danger small fw-black uppercase tracking-tighter mb-4 rounded-4 py-3">
                                            <FaShieldAlt className="me-2" /> {error}
                                        </Alert>
                                    </motion.div>
                                )}

                                {step === 1 && (
                                    <div className="d-flex gap-2 mb-5 p-1 rounded-4 bg-white/2 border border-white/5">
                                        <button 
                                            className={`flex-grow-1 py-3 px-2 rounded-4 border-0 transition-premium fw-black uppercase tracking-widest small d-flex align-items-center justify-content-center gap-2 ${formData.role === 'attendee' ? 'bg-primary text-white shadow-glow' : 'bg-transparent text-white-50'}`}
                                            onClick={() => setFormData({ ...formData, role: 'attendee' })}
                                        >
                                            <FaUserCircle size={14} /> Attendee
                                        </button>
                                        <button 
                                            className={`flex-grow-1 py-3 px-2 rounded-4 border-0 transition-premium fw-black uppercase tracking-widest small d-flex align-items-center justify-content-center gap-2 ${formData.role === 'organizer' ? 'bg-primary text-white shadow-glow' : 'bg-transparent text-white-50'}`}
                                            onClick={() => setFormData({ ...formData, role: 'organizer' })}
                                        >
                                            <FaBriefcase size={14} /> Organizer
                                        </button>
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit} className="position-relative">
                                    <AnimatePresence mode="wait">
                                        {step === 1 ? (
                                            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                                <Form.Group className="mb-4">
                                                    <label className="form-label-premium">Human Alias</label>
                                                    <Form.Control id="name" className="glass-input-premium rounded-4 py-3" placeholder="Deepak Kumar" value={formData.name} onChange={handleChange} required />
                                                </Form.Group>
                                                <Form.Group className="mb-4">
                                                    <label className="form-label-premium">Communication Link (Email)</label>
                                                    <Form.Control id="email" type="email" className="glass-input-premium rounded-4 py-3" placeholder="deepak@growthutsav.com" value={formData.email} onChange={handleChange} required />
                                                </Form.Group>
                                                <Form.Group className="mb-4">
                                                    <label className="form-label-premium">Contact Identity (Phone)</label>
                                                    <Form.Control id="phone" type="text" className="glass-input-premium rounded-4 py-3" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} required />
                                                </Form.Group>

                                                <Form.Group className="mb-4">
                                                    <label className="form-label-premium">Encryption Key</label>
                                                    <div className="position-relative">
                                                        <Form.Control id="password" type={showPassword ? "text" : "password"} className="glass-input-premium rounded-4 py-3" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength="6" />
                                                        <button type="button" className="btn position-absolute end-0 top-50 translate-middle-y text-white-50 border-0 shadow-none me-2" onClick={() => setShowPassword(!showPassword)}>
                                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                        </button>
                                                    </div>
                                                </Form.Group>
                                            </motion.div>
                                        ) : (
                                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                                <Row className="g-4">
                                                    <Col md={6}>
                                                        <Form.Group className="mb-4">
                                                            <label className="form-label-premium">Organization / Artist Name</label>
                                                            <Form.Control id="companyName" className="glass-input-premium rounded-4 py-3" placeholder="GrowthUtsav Events" value={orgDetails.companyName} onChange={handleOrgChange} required />
                                                        </Form.Group>
                                                        <Form.Group className="mb-4 position-relative">
                                                            <label className="form-label-premium">Target Segments</label>
                                                            <div className="glass-input-premium rounded-4 py-3 d-flex flex-wrap gap-2 cursor-pointer" onClick={() => setShowEventDropdown(!showEventDropdown)}>
                                                                {orgDetails.selectedEventTypes.length === 0 ? <span className="opacity-40">Select Sectors...</span> : orgDetails.selectedEventTypes.map(t => (
                                                                    <span key={t} className="badge bg-primary/20 text-primary border border-primary/30 p-2 rounded-3 small fw-black uppercase">{t}</span>
                                                                ))}
                                                            </div>
                                                            <AnimatePresence>
                                                                {showEventDropdown && (
                                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="multi-select-dropdown shadow-2xl p-2 rounded-4 mt-2">
                                                                        {eventOptions.map(opt => (
                                                                            <div key={opt} className="p-3 rounded-3 hover-bg-white/5 cursor-pointer d-flex align-items-center gap-3 fw-bold text-white-50 hover-text-white" onClick={() => handleEventTypeToggle(opt)}>
                                                                                <div className={`checkbox-box rounded-2 ${orgDetails.selectedEventTypes.includes(opt) ? 'bg-primary border-primary' : 'border-white/10'}`}>
                                                                                    {orgDetails.selectedEventTypes.includes(opt) && <FaCheck size={10} className="text-white" />}
                                                                                </div>
                                                                                {opt}
                                                                            </div>
                                                                        ))}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="h-100">
                                                            <label className="form-label-premium">Brand Identity (Logo)</label>
                                                            <div className="logo-upload-box rounded-4 border-dashed h-75 d-flex flex-column align-items-center justify-content-center p-4">
                                                                {orgDetails.logoPreview ? (
                                                                    <>
                                                                    <div className="logo_upload_img position-relative h-100 w-100 d-flex justify-content-center">
                                                                        <img src={orgDetails.logoPreview} className="h-100 object-fit-contain rounded-3" alt="Brand" />
                                                                    </div>
                                                                    <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle" onClick={removeLogo}><FaTimes /></button>
                                                                    </>
                                                                    
                                                                ) : (
                                                                    <>
                                                                        <input type="file" id="logo-in" hidden onChange={handleLogoUpload} />
                                                                        <label htmlFor="logo-in" className="text-center cursor-pointer">
                                                                            <FaCloudUploadAlt size={40} className="text-primary mb-3 opacity-50" />
                                                                            <p className="text-white-50 small fw-black uppercase tracking-widest mb-0">Synchronize Asset</p>
                                                                        </label>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="d-flex gap-3 mt-5">
                                        {step === 2 && (
                                            <Button variant="outline-primary" className="btn-outline-primary px-4" onClick={() => setStep(1)}>
                                                <FaArrowLeft />
                                            </Button>
                                        )}
                                        <Button variant="primary" type="submit" className="btn-primary flex-grow-1" disabled={loading}>
                                            {loading ? <Spinner size="sm" /> : step === 1 && isOrganizer ? 'Initialize Matrix' : <><FaRocket className="me-2" /> Activate Account</>}
                                        </Button>
                                    </div>

                                </Form>

                                <div className="text-center mt-5">
                                    <p className="text-white-50 small mb-0 fw-medium">
                                        Existing identity? <Link to={`/login?role=${formData.role}`} className="text-primary-light fw-black text-decoration-none hover-text-white transition-all ms-2">Re-Authorize</Link>
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Register;
