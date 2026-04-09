const express = require('express');
const {
    getVendors, addVendor, deleteVendor,
    getEquipment, addEquipment, deleteEquipment,
    getTasks, addTask, updateTaskStatus, deleteTask
} = require('../controllers/logisticsController');

const router = express.Router({ mergeParams: true });

const { protect, authorize, checkGoldPlan } = require('../middleware/authMiddleware');

// All logistics routes require Gold Plan and Organizer/Admin role
router.use(protect);
router.use(authorize('organizer', 'admin'));
router.use(checkGoldPlan);

// VENDORS
router.route('/vendors/:eventId').get(getVendors).post(addVendor);
router.route('/vendors/delete/:id').delete(deleteVendor);

// EQUIPMENT
router.route('/equipment/:eventId').get(getEquipment).post(addEquipment);
router.route('/equipment/delete/:id').delete(deleteEquipment);

// TASKS
router.route('/tasks/:eventId').get(getTasks).post(addTask);
router.route('/tasks/update/:id').put(updateTaskStatus);
router.route('/tasks/delete/:id').delete(deleteTask);

module.exports = router;
