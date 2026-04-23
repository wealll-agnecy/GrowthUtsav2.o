import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Badge, Spinner, Button, Alert } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaClock, FaEye, FaTrash, FaSearch, FaInbox } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/admin-pages.css';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
        const res = await axios.get("/api/v1/enquiries", { withCredentials: true });
        setEnquiries(res.data.data || res.data || []);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
        await axios.delete(`/api/v1/enquiries/${id}`, { withCredentials: true });
        setToast({ msg: 'Enquiry deleted', type: 'success' });
        fetchEnquiries();
    } catch (err) {
        setToast({ msg: 'Failed to delete', type: 'danger' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = enquiries.filter(e => 
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page-container enquiries-wrapper">
      <Container fluid>
        <AnimatePresence>
            {toast && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
                    <Alert variant={toast.type} className="border-0 shadow-lg">{toast.msg}</Alert>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="admin-page-header">
            <div>
                <h1 className="enquiries-title">General Enquiries</h1>
                <p className="dashboard-subtext enquiries-subtitle">Incoming customer messages and signals</p>
            </div>
            <div className="d-flex gap-3">
                <div className="admin-search-wrapper position-relative enquiries-search">
                    <FaSearch className="search-icon position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 10 }} />
                    <input
                        type="text"
                        className="form-control admin-search-input"
                        placeholder="Search enquiries..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ minWidth: '300px' }}
                    />
                </div>
            </div>
        </div>

        <div className="admin-card enquiries-table">
            {loading ? (
                <div className="loading-skeleton">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-row" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><FaInbox /></div>
                    <h3>Inbox Clear</h3>
                    <p>{search ? `No messages matching "${search}"` : 'No incoming enquiries recorded.'}</p>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>SENDER</th>
                                <th>MESSAGE PREVIEW</th>
                                <th>DATE</th>
                                <th>STATUS</th>
                                <th className="text-end">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(e => (
                                <tr key={e._id}>
                                    <td>
                                        <div className="fw-bold">{e.name}</div>
                                        <div className="small text-muted">{e.email}</div>
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>
                                        <div className="text-truncate small opacity-75">{e.message}</div>
                                    </td>
                                    <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`admin-badge badge-${e.status?.toLowerCase() === 'read' ? 'resolved' : 'pending'}`}>
                                            {e.status || 'New'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btn-group justify-content-end">
                                            <button className="btn btn-outline-pink" onClick={() => navigate(`/admin/enquiries/${e._id}`)}>
                                                <FaEye />
                                            </button>
                                            <button className="btn btn-pink" onClick={() => handleDelete(e._id)}>
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </Container>
    </div>
  );
}
