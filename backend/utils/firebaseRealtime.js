/**
 * Firebase Firestore Realtime Transport Layer.
 *
 * Backend writes short-lived delivery documents to Firestore while MongoDB
 * remains the source of truth for all notification and business data.
 */

const admin = require('firebase-admin');

const getDb = () => {
    try {
        if (!admin.apps.length) return null;
        return admin.firestore();
    } catch (err) {
        console.error('[FIREBASE REALTIME]: Failed to get Firestore instance:', err.message);
        return null;
    }
};

const createRealtimePayload = (event, data) => ({
    event,
    data: JSON.parse(JSON.stringify(data)),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 5 * 60 * 1000),
    delivered: false
});

const sendToUser = async (userId, event, data) => {
    if (!userId) return;

    const db = getDb();
    if (!db) {
        console.warn('[FIREBASE REALTIME]: Firestore unavailable; skipping realtime delivery for user:', userId.toString());
        return;
    }

    try {
        const userIdStr = userId.toString();
        await db
            .collection('notifications')
            .doc(userIdStr)
            .collection('items')
            .add(createRealtimePayload(event, data));

        console.log(`[FIREBASE REALTIME]: Sent "${event}" to user ${userIdStr}`);
    } catch (err) {
        console.error('[FIREBASE REALTIME]: sendToUser failed:', err.message);
    }
};

const broadcast = async (event, data) => {
    const db = getDb();
    if (!db) {
        console.warn('[FIREBASE REALTIME]: Firestore unavailable; skipping broadcast');
        return;
    }

    try {
        await db.collection('broadcasts').add(createRealtimePayload(event, data));
        console.log(`[FIREBASE REALTIME]: Broadcasted "${event}" to all listeners`);
    } catch (err) {
        console.error('[FIREBASE REALTIME]: broadcast failed:', err.message);
    }
};

module.exports = { sendToUser, broadcast };
