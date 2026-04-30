import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner } from 'react-bootstrap';
import { 
    FaUserCircle, FaEnvelope, FaShieldAlt, FaMapMarkerAlt, 
    FaCamera, FaEdit, FaCheckCircle, FaLock, FaHistory, FaPhone, FaMapPin
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
            setAvatarPreview(user.avatar);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            // Auto-submit or wait for Save? Let's wait for Save.
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('address', formData.address);
            
            if (selectedFile) {
                data.append('avatar', selectedFile);
            }

            const res = await axios.put('/api/v1/auth/updatedetails', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                await refreshUser();
                toast.success('Security protocol successful: Identity updated.');
                setIsEditing(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString(), icon: <FaCheckCircle /> },
        { label: 'Account Level', value: user?.role?.toUpperCase() || 'USER', icon: <FaShieldAlt /> },
        { label: 'Verified Status', value: user?.status === 'verified' ? 'Level 2 Clearance' : 'Level 1 Pending', icon: <FaShieldAlt /> }
    ];

    const getAvatarSrc = () => {
        if (avatarPreview && avatarPreview.startsWith('blob:')) return avatarPreview;
        if (user?.avatar && user.avatar !== 'no-avatar.jpg') {
            return user.avatar.startsWith('http') ? user.avatar : `${axios.defaults.baseURL}${user.avatar}`;
        }
        return null;
    };

    return (
        <div className="profile-page-premium" style={{ paddingTop: '100px', background: '#f8fafc', minHeight: '100vh' }}>
            <Container>
                <Row className="g-4">
                    {/* LEFT: Profile Overview */}
                    <Col lg={4}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                                <div className="profile-cover-mini" style={{ height: '100px', background: 'linear-gradient(45deg, #ee749f, #fef3c7)' }}></div>
                                <Card.Body className="text-center position-relative pt-0">
                                    <div className="profile-avatar-wrapper mx-auto mb-3" style={{ marginTop: '-50px' }}>
                                        <div className="position-relative d-inline-block">
                                            {getAvatarSrc() ? (
                                                <img src={getAvatarSrc()} alt="Profile" className="rounded-circle border border-4 border-white shadow" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="bg-white rounded-circle border border-4 border-white shadow d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                                                    <FaUserCircle size={80} className="text-pink opacity-20" />
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="d-none" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            <button 
                                                className="btn btn-sm btn-pink rounded-circle position-absolute bottom-0 end-0 border-2 border-white"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <FaCamera size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="fw-black m-0">{user?.name}</h4>
                                    <p className="text-muted small mb-3">{user?.email}</p>
                                    <Badge bg="pink-subtle" className="text-pink px-3 py-2 rounded-pill uppercase tracking-widest small mb-4">
                                        {user?.role} Protocol Active
                                    </Badge>

                                    <div className="d-flex flex-column gap-2">
                                        <Button 
                                            as={Link} 
                                            to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'organizer' ? '/organizer/dashboard' : '/attendee/dashboard'} 
                                            className="btn btn-pink w-100 rounded-pill fw-bold py-2 shadow-sm"
                                        >
                                            Access Dashboard
                                        </Button>
                                        <Button variant="outline-dark" className="w-100 rounded-pill fw-bold py-2 border-0 bg-light" onClick={() => setIsEditing(!isEditing)}>
                                            <FaEdit className="me-2" /> {isEditing ? 'Discard Changes' : 'Edit Profile'}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm rounded-4 p-3">
                                <h6 className="fw-black uppercase tracking-widest small mb-3 opacity-50">Security Metrics</h6>
                                <div className="d-flex flex-column gap-3">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded-3 text-pink">{stat.icon}</div>
                                            <div>
                                                <div className="tiny-text text-muted fw-bold uppercase">{stat.label}</div>
                                                <div className="small fw-bold">{stat.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    </Col>

                    {/* RIGHT: Detailed Settings */}
                    <Col lg={8}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-black m-0 d-flex align-items-center gap-2">
                                        <FaUserCircle className="text-pink" /> Security Clearance Details
                                    </h5>
                                    {isEditing && <Badge bg="warning" className="text-dark">Editing Node</Badge>}
                                </div>

                                <Form onSubmit={handleUpdateProfile}>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted uppercase">Full Name</Form.Label>
                                                <Form.Control 
                                                    className="bg-light border-0 py-2 px-3 fw-bold" 
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    readOnly={!isEditing}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted uppercase">Email Identity</Form.Label>
                                                <Form.Control 
                                                    className="bg-light border-0 py-2 px-3 fw-bold" 
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    readOnly={!isEditing}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted uppercase">Contact Link</Form.Label>
                                                <Form.Control 
                                                    className="bg-light border-0 py-2 px-3 fw-bold" 
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                    readOnly={!isEditing}
                                                    placeholder="Enter phone number"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted uppercase">Primary Sector (Address)</Form.Label>
                                                <Form.Control 
                                                    className="bg-light border-0 py-2 px-3 fw-bold" 
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                    readOnly={!isEditing}
                                                    placeholder="Enter your address"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {isEditing && (
                                        <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                                            <Button variant="light" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</Button>
                                            <Button variant="pink" type="submit" disabled={loading} className="px-4">
                                                {loading ? <Spinner animation="border" size="sm" /> : 'Update Identity'}
                                            </Button>
                                        </div>
                                    )}
                                </Form>
                            </Card>

                            <Card className="border-0 shadow-sm rounded-4 p-4">
                                <h5 className="fw-black mb-4 d-flex align-items-center gap-2">
                                    <FaLock className="text-warning" /> Critical Node Security
                                </h5>
                                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border border-warning border-opacity-10 mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-warning bg-opacity-10 p-2 rounded-circle text-warning">
                                            <FaLock />
                                        </div>
                                        <div>
                                            <div className="fw-bold small">Encrypted Access Key</div>
                                            <div className="text-muted tiny-text">Last rotated 12 days ago</div>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline-warning" className="fw-bold px-3 rounded-pill">Change</Button>
                                </div>
                                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border border-primary border-opacity-10">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                                            <FaHistory />
                                        </div>
                                        <div>
                                            <div className="fw-bold small">Session Log Analysis</div>
                                            <div className="text-muted tiny-text">4 active sessions detected</div>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline-primary" className="fw-bold px-3 rounded-pill">Review</Button>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

// Internal icon fix if FaCalendarAlt is not imported
const FaCalendarAlt = ({ size }) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height={size || "1em"} width={size || "1em"} xmlns="http://www.w3.org/2000/svg">
        <path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm336-192c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32zm0 128c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32zm-128-128c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32zm0 128c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32zm-128-128c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32zm0 128c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"></path>
    </svg>
);

export default Profile;
