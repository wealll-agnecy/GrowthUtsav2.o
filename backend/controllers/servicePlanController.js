const ServicePlan = require('../models/ServicePlan');
const User = require('../models/User');

// @desc    Get all service plans
// @route   GET /api/v1/plans
// @access  Public
exports.getPlans = async (req, res, next) => {
    try {
        let plans = await ServicePlan.find();

        // Seed default plans if none exist
        if (plans.length === 0) {
            const defaultPlans = [
                {
                    name: 'Bronze',
                    price: 0,
                    features: ['Up to 5 Events', 'Standard Ticketing', 'Basic Analytics'],
                    eventLimit: 5,
                    supportLevel: 'Basic'
                },
                {
                    name: 'Silver',
                    price: 999,
                    features: ['Up to 20 Events', 'Priority Listing', 'Extended Analytics', 'Email Support'],
                    eventLimit: 20,
                    supportLevel: 'Priority'
                },
                {
                    name: 'Gold',
                    price: 2499,
                    features: ['Unlimited Events', 'White-label Tickets', 'Dedicated Account Manager', 'WhatsApp Reminders'],
                    eventLimit: 999,
                    supportLevel: 'Dedicated'
                }
            ];
            plans = await ServicePlan.create(defaultPlans);
        }

        res.status(200).json({
            success: true,
            data: plans
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Select / Upgrade Service Plan
// @route   PUT /api/v1/plans/select/:planId
// @access  Private (Organizer/Admin)
exports.selectPlan = async (req, res, next) => {
    try {
        const plan = await ServicePlan.findById(req.params.planId);

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + plan.duration);

        const user = await User.findByIdAndUpdate(req.user.id, {
            servicePlan: plan._id,
            planExpiry: expiryDate
        }, { new: true }).populate('servicePlan');

        res.status(200).json({
            success: true,
            message: `Successfully upgraded to ${plan.name} plan`,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
