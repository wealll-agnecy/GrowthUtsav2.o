import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, Row, Col, Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash, FaClock, FaExclamationTriangle, FaCheckCircle, FaProjectDiagram, FaInfoCircle, FaShieldAlt, FaGripVertical } from 'react-icons/fa';
import * as logisticsApi from '../../api/logisticsApi';
import { motion, AnimatePresence } from 'framer-motion';

const KanbanBoard = ({ eventId }) => {
    const [tasks, setTasks] = useState({
        'Pending': [],
        'In Progress': [],
        'Completed': []
    });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium' });

    const fetchTasks = async () => {
        try {
            const res = await logisticsApi.getTasks(eventId);
            const organized = { 'Pending': [], 'In Progress': [], 'Completed': [] };
            res.data.data.forEach(task => {
                if (organized[task.status]) {
                    organized[task.status].push(task);
                }
            });
            setTasks(organized);
        } catch (err) {
            console.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [eventId]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const start = tasks[source.droppableId];
        const finish = tasks[destination.droppableId];

        if (source.droppableId === destination.droppableId) {
            const newList = Array.from(start);
            const [removed] = newList.splice(source.index, 1);
            newList.splice(destination.index, 0, removed);
            setTasks({ ...tasks, [source.droppableId]: newList });
            return;
        }

        const startList = Array.from(start);
        const [removed] = startList.splice(source.index, 1);
        const finishList = Array.from(finish);
        finishList.splice(destination.index, 0, removed);

        setTasks({
            ...tasks,
            [source.droppableId]: startList,
            [destination.droppableId]: finishList
        });

        try {
            await logisticsApi.updateTaskStatus(draggableId, {
                status: destination.droppableId,
                order: destination.index
            });
        } catch (err) {
            fetchTasks(); // Revert
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await logisticsApi.addTask(eventId, { ...newTask, status: 'Pending' });
            setShowModal(false);
            setNewTask({ title: '', description: '', priority: 'Medium' });
            fetchTasks();
        } catch (err) {
            alert('Failed to add task');
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await logisticsApi.deleteTask(id);
            fetchTasks();
        } catch (err) {
            alert('Failed to delete task');
        }
    };

    const getPriorityBadge = (p) => {
        switch (p) {
            case 'Critical': return <Badge bg="danger" className="rounded-pill px-2 py-1 shadow-sm border-0">CRITICAL</Badge>;
            case 'High': return <Badge bg="warning" text="dark" className="rounded-pill px-2 py-1 shadow-sm border-0">HIGH</Badge>;
            case 'Medium': return <Badge bg="info" className="rounded-pill px-2 py-1 shadow-sm border-0">MEDIUM</Badge>;
            default: return <Badge bg="secondary" className="rounded-pill px-2 py-1 shadow-sm border-0 uppercase">LOW</Badge>;
        }
    };

    if (loading) return (
        <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="opacity-50" />
            <p className="text-white-50 mt-4 fw-black text-uppercase tracking-widest small">Synchronizing Neural Strategy...</p>
        </div>
    );

    return (
        <div className="kanban-board-module">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="d-flex justify-content-between align-items-center mb-5"
            >
                <div className="d-flex align-items-center gap-4">
                    <span className="bg-primary shadow-lg p-2 rounded-4 d-inline-flex border border-white/5"><FaProjectDiagram className="text-white" /></span>
                    <h4 className="fw-black m-0 text-white display-6">Node <span className="gradient-text">Orchestration</span></h4>
                </div>
                <Button variant="primary" className="rounded-pill px-5 py-3 fw-black glow-hover shadow-2xl border-0 d-flex align-items-center gap-3 text-uppercase tracking-widest" onClick={() => setShowModal(true)}>
                    <FaPlus /> NEW OPERATION
                </Button>
            </motion.div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Row className="g-4">
                    {Object.keys(tasks).map((columnId, colIdx) => (
                        <Col key={columnId} lg={4}>
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: colIdx * 0.1 }}
                                className="glass-panel p-4 rounded-5 h-100 border-white/5 shadow-2xl backdrop-blur-xl"
                            >
                                <div className="d-flex justify-content-between align-items-center mb-5 px-3 py-2 rounded-4 bg-white/2 border border-white/5">
                                    <h6 className="m-0 fw-black text-uppercase tracking-widest small text-white tracking-widest font-monospace">{columnId}</h6>
                                    <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-1 rounded-pill fw-black small">{tasks[columnId].length}</Badge>
                                </div>

                                <Droppable droppableId={columnId}>
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '500px' }}>
                                            <AnimatePresence>
                                                {tasks[columnId].map((task, index) => (
                                                    <Draggable key={task._id} draggableId={task._id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                {...provided.draggableProps} 
                                                                {...provided.dragHandleProps} 
                                                                ref={provided.innerRef}
                                                                className="mb-4"
                                                            >
                                                                <motion.div
                                                                    layout
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                                    className={`glass-card p-4 rounded-5 border-white/5 shadow-lg antigravity-hover transition-all position-relative overflow-hidden ${snapshot.isDragging ? 'ring-primary-glow' : ''}`}
                                                                >
                                                                    <div className="position-absolute top-0 end-0 p-3 opacity-20"><FaGripVertical size={12} className="text-white" /></div>
                                                                    <div className="position-relative">
                                                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                                                            <div className="small fw-black d-flex align-items-center gap-2">
                                                                                {getPriorityBadge(task.priority)}
                                                                                <span className="text-white-50 opacity-30 font-monospace">#{task._id.slice(-4).toUpperCase()}</span>
                                                                            </div>
                                                                            <motion.button 
                                                                                whileHover={{ scale: 1.2 }}
                                                                                className="btn btn-link p-0 text-danger border-0 opacity-20 hover-opacity-100 transition-opacity" 
                                                                                onClick={() => handleDeleteTask(task._id)}
                                                                            >
                                                                                <FaTrash />
                                                                            </motion.button>
                                                                        </div>
                                                                        <h5 className="fw-black text-white mb-2 fs-5">{task.title}</h5>
                                                                        <p className="small text-white-50 mb-5 fw-medium lh-base line-clamp-3 opacity-80">{task.description}</p>
                                                                        
                                                                        <div className="pt-4 border-top border-white/5 d-flex align-items-center justify-content-between">
                                                                            <div className="d-flex align-items-center gap-2 text-white-50 small fw-bold opacity-70">
                                                                                <FaClock className="text-primary-light" /> <span className="text-uppercase tracking-widest font-monospace">ACTIVE SYNC</span>
                                                                            </div>
                                                                            <div className="bg-white/5 p-2 rounded-circle shadow-inner">
                                                                                <FaCheckCircle className={columnId === 'Completed' ? 'text-success shadow-glow' : 'text-white-50 opacity-20'} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </AnimatePresence>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </DragDropContext>

            {/* Premium Strategic Modal */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                centered 
                contentClassName="bg-deep-space rounded-5 border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden"
            >
                <Modal.Header closeButton closeVariant="white" className="border-0 p-5 pb-0">
                    <Modal.Title className="fw-black fs-2 gradient-text tracking-tightest">INITIALIZE OPERATION</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddTask}>
                    <Modal.Body className="p-5">
                        <Form.Group className="mb-5">
                            <Form.Label className="small fw-black text-white-50 text-uppercase tracking-widest mb-3 opacity-60">Task Designation</Form.Label>
                            <Form.Control 
                                className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-white placeholder-light"
                                type="text" 
                                required 
                                placeholder="e.g. Critical Node Security Briefing..."
                                value={newTask.title}
                                onChange={e => setNewTask({...newTask, title: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-5">
                            <Form.Label className="small fw-black text-white-50 text-uppercase tracking-widest mb-3 opacity-60">Execution Directive</Form.Label>
                            <Form.Control 
                                className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-white placeholder-light"
                                as="textarea" 
                                rows={4} 
                                placeholder="Outline the strategic requirements for node completion..."
                                value={newTask.description}
                                onChange={e => setNewTask({...newTask, description: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-black text-white-50 text-uppercase tracking-widest mb-3 opacity-60">Priority Resonance</Form.Label>
                            <Form.Select 
                                className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-white cursor-pointer"
                                value={newTask.priority}
                                onChange={e => setNewTask({...newTask, priority: e.target.value})}
                            >
                                <option className="bg-dark text-white">Low</option>
                                <option className="bg-dark text-white">Medium</option>
                                <option className="bg-dark text-white">High</option>
                                <option className="bg-dark text-white">Critical</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-5 pt-0 gap-3">
                        <Button variant="link" className="text-white-50 fw-black text-decoration-none text-uppercase small" onClick={() => setShowModal(false)}>STAND DOWN</Button>
                        <Button variant="primary" type="submit" className="rounded-pill px-5 py-3 fw-black shadow-2xl border-0 glow-hover text-uppercase tracking-widest">DEPLOY TASK</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default KanbanBoard;
