const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendToUser, broadcast } = require('../utils/socket');
const { sendPushNotification } = require('../utils/firebase');

/**
 * CORE LOGIC: Unified notification processor
 * This can be called by the Worker OR directly in offline mode.
 */
const processNotificationAction = async (data) => {
    const { userId, eventId, title, message, type } = data;
    const eventIdStr = eventId?.toString();
    
    try {
        if (type === 'new_event') {
            const users = await User.find({ status: 'verified' }).select('_id fcmToken');
            const notifications = users.map(u => ({ user: u._id, title, message, type, eventId: eventIdStr }));
            await Notification.insertMany(notifications);
            
            // Broadcast a generic notification structure for real-time UI
            broadcast('notification', { 
                title, 
                message, 
                eventId: eventIdStr, 
                type,
                createdAt: new Date(),
                isRead: false
            });

            for (const u of users) {
                if (u.fcmToken) sendPushNotification(u.fcmToken, title, message, { eventId: eventIdStr });
            }
        } else {
            const notification = await Notification.create({ user: userId, title, message, type, eventId: eventIdStr });
            sendToUser(userId, 'notification', notification);
            const user = await User.findById(userId).select('fcmToken');
            if (user?.fcmToken) sendPushNotification(user.fcmToken, title, message, { eventId: eventIdStr });
        }
    } catch (err) {
        console.error(`âŒ [NOTIFICATION_PROCESSOR]: Failed:`, err.message);
        throw err;
    }
};

/**
 * HIGH-FIDELITY REDIS ADAPTER
 * Silences all connection errors by performing an opt-in check.
 */
const REDIS_ENABLED = process.env.REDIS_URL || process.env.ENABLE_REDIS === 'true';

let notificationQueue = { 
    add: async (name, data) => {
        console.log(`ðŸ“¡ [QUEUE-OFFLINE]: Processing ${name} immediately (Redis disabled)`);
        await processNotificationAction(data);
    },
    getJob: async () => null,
    on: () => {}
};

let worker = null;

if (REDIS_ENABLED) {
    const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        showFriendlyErrorStack: false,
        retryStrategy: (times) => Math.min(times * 500, 15000)
    });

    connection.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            console.warn('âš ï¸ [REDIS]: Service unavailable. Switching to real-time relay mode.');
            // Downgrade to offline mode if connection fails
            notificationQueue.add = async (name, data) => {
                await processNotificationAction(data);
            };
        }
    });

    try {
        notificationQueue = new Queue('notificationQueue', { 
            connection,
            defaultJobOptions: { removeOnComplete: true, removeOnFail: 1000 }
        });

        worker = new Worker('notificationQueue', async (job) => {
            console.log(`ðŸ“¦ [QUEUE]: Processing job ${job.id} (${job.name})`);
            await processNotificationAction(job.data);
        }, { connection });

        worker.on('completed', (job) => console.log(`✅ [QUEUE]: Job ${job.id} completed`));
        worker.on('failed', (job, err) => console.error(`🚨 [QUEUE]: Job ${job.id} failed: ${err.message}`));
    } catch (err) {
        console.error('âŒ [QUEUE]: Initialization error:', err.message);
    }
} else {
    console.log('ðŸ’¡ [REDIS]: Offline mode active. Real-time notifications used via relay.');
}

const scheduleReminders = async (userId, eventId, eventDate) => {
    if (!REDIS_ENABLED) return;
    const eventTime = new Date(eventDate).getTime();
    const now = Date.now();
    const reminders = [
        { time: eventTime - 24 * 60 * 60 * 1000, msg: "Your event is tomorrow!", tag: '24h' },
        { time: eventTime - 60 * 60 * 1000, msg: "Your event starts in 1 hour!", tag: '1h' },
        { time: eventTime, msg: "Your event is starting now!", tag: 'now' }
    ];

    for (const r of reminders) {
        const delay = r.time - now;
        if (delay > 0) {
            await notificationQueue.add('reminder', { userId, eventId, title: 'Event Reminder', message: r.msg, type: 'event_reminder' }, {
                delay,
                jobId: `reminder-${userId}-${eventId}-${r.tag}`,
                attempts: 3
            });
        }
    }
};

const cancelReminders = async (userId, eventId) => {
    if (!REDIS_ENABLED) return;
    const tags = ['24h', '1h', 'now'];
    for (const tag of tags) {
        const job = await notificationQueue.getJob(`reminder-${userId}-${eventId}-${tag}`);
        if (job) await job.remove();
    }
};

module.exports = { notificationQueue, scheduleReminders, cancelReminders };
