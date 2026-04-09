const Vendor = require('../models/Vendor');
const Equipment = require('../models/Equipment');
const LogisticsTask = require('../models/LogisticsTask');
const Event = require('../models/Event');

// VENDOR CONTROLLERS
exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({ event: req.params.eventId });
        res.status(200).json({ success: true, data: vendors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addVendor = async (req, res) => {
    try {
        req.body.event = req.params.eventId;
        const vendor = await Vendor.create(req.body);
        res.status(201).json({ success: true, data: vendor });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        await vendor.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// EQUIPMENT CONTROLLERS
exports.getEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find({ event: req.params.eventId });
        res.status(200).json({ success: true, data: equipment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addEquipment = async (req, res) => {
    try {
        req.body.event = req.params.eventId;
        const item = await Equipment.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteEquipment = async (req, res) => {
    try {
        const item = await Equipment.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Equipment not found' });
        await item.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// TASK CONTROLLERS (KANBAN)
exports.getTasks = async (req, res) => {
    try {
        const tasks = await LogisticsTask.find({ event: req.params.eventId }).sort('order');
        res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addTask = async (req, res) => {
    try {
        req.body.event = req.params.eventId;
        const task = await LogisticsTask.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const task = await LogisticsTask.findByIdAndUpdate(req.params.id, {
            status: req.body.status,
            order: req.body.order
        }, { new: true });
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await LogisticsTask.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        await task.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

