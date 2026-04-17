const admin = require('firebase-admin');

const initFirebase = () => {
    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.warn('⚠️ [FIREBASE]: Missing FIREBASE_SERVICE_ACCOUNT env. Push notifications disabled.');
            return null;
        }

        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log('🔥 [FIREBASE]: Admin initialized successfully');
        return admin;
    } catch (err) {
        console.error('❌ [FIREBASE]: Initialization failed:', err.message);
        return null;
    }
};

const sendPushNotification = async (token, title, body, data = {}) => {
    if (!admin.apps.length) return;

    const message = {
        notification: { title, body },
        data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK' // For mobile/web consistency
        },
        token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('✅ [FIREBASE]: Push sent successfully:', response);
        return response;
    } catch (err) {
        console.error('❌ [FIREBASE]: Push failed:', err.message);
    }
};

module.exports = { initFirebase, sendPushNotification };
